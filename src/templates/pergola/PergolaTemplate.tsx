import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistoryState, useKeyboardShortcuts } from '@core/index';
import {
  fmtArea,
  fmtCurrency,
  fmtMeters,
  fmtPercent,
  fmtSectionMm,
  fmtVolume,
  fmtWeight,
  clamp,
} from '@shared/index';
import { SceneCanvas, type SceneCaptureHandle, type ViewPreset } from './components/SceneCanvas';
import {
  MODEL_FORMULA,
  DEFAULT_PARAMETERS,
  MATERIAL_PRESETS,
  TEXTURE_LABELS,
  SIZE_PRESETS,
  buildPergolaModel,
  getMaterialPreset,
  getSizePreset,
  type PergolaDimensions,
  type PergolaParameters,
} from './lib/pergolaMath';
import {
  DEFAULT_PERGOLA_SPEC,
  decodeSpecFromHash,
  encodeSpecToHash,
  sanitizePergolaSpec,
  type PergolaSpec,
} from './lib/pergolaSpec';
import { LOAD_SCENARIOS, getLoadScenario } from './lib/loadScenarios';
import { buildPergolaQuote } from './lib/pricing';
import { buildPergolaBom, bomToCsv } from './lib/bom';
import {
  copyTextToClipboard,
  downloadCsv,
  downloadJson,
  downloadPng,
} from './lib/exporters';
import {
  addSavedConfig,
  loadRecentSpec,
  loadSavedConfigs,
  persistRecentSpec,
  removeSavedConfig,
  type SavedConfig,
} from './lib/persistence';

const DIMENSION_LIMITS = {
  width: [2.5, 9] as const,
  depth: [2.5, 10] as const,
  height: [2.2, 4] as const,
};

const STEPS: Array<{ id: string; label: string }> = [
  { id: 'model', label: 'Model & Size' },
  { id: 'material', label: 'Materials' },
  { id: 'structure', label: 'Structure' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'quote', label: 'Quote & Export' },
];

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  unit?: string;
  fractionDigits?: number;
}

const RangeControl = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  unit = 'm',
  fractionDigits = 3,
}: RangeControlProps): JSX.Element => (
  <label className={`range-control ${disabled ? 'disabled' : ''}`}>
    <div className="range-head">
      <span>{label}</span>
      <strong>
        {value.toFixed(fractionDigits)} {unit}
      </strong>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={disabled}
      aria-label={label}
    />
  </label>
);

const computeInitialSpec = (): PergolaSpec => {
  if (typeof window !== 'undefined') {
    const fromHash = decodeSpecFromHash(window.location.hash);
    if (fromHash) return fromHash;
  }
  const recent = loadRecentSpec();
  if (recent) return recent;
  return DEFAULT_PERGOLA_SPEC;
};

export default function PergolaTemplate(): JSX.Element {
  const initialSpec = useMemo(computeInitialSpec, []);
  const history = useHistoryState<PergolaSpec>(initialSpec);
  const spec = history.state;

  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => loadSavedConfigs());
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [viewPreset, setViewPreset] = useState<ViewPreset>('orbit');
  const captureRef = useRef<SceneCaptureHandle | null>(null);

  // ----- Persistence: hash + localStorage -----
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = encodeSpecToHash(spec);
    if (nextHash && window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
    persistRecentSpec(spec);
  }, [spec]);

  useEffect(() => {
    const onHashChange = (): void => {
      const fromHash = decodeSpecFromHash(window.location.hash);
      if (fromHash) history.replace(fromHash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [history]);

  // ----- Derived selectors -----
  const activeSizePreset = useMemo(() => getSizePreset(spec.sizeId), [spec.sizeId]);
  const materialPreset = useMemo(() => getMaterialPreset(spec.materialId), [spec.materialId]);
  const loadScenario = useMemo(() => getLoadScenario(spec.loadScenarioId), [spec.loadScenarioId]);

  const buildOptions = useMemo(
    () => ({
      roofLoadKPa: loadScenario.roofLoadKPa,
      lateralFactor: loadScenario.lateralFactor,
    }),
    [loadScenario],
  );

  const model = useMemo(
    () => buildPergolaModel(spec.dimensions, spec.parameters, materialPreset, buildOptions),
    [spec.dimensions, spec.parameters, materialPreset, buildOptions],
  );

  const quote = useMemo(
    () =>
      buildPergolaQuote(model.metrics, materialPreset, {
        texturePresetId: spec.texturePreset,
        loadFactor: loadScenario.lateralFactor,
      }),
    [model.metrics, materialPreset, spec.texturePreset, loadScenario.lateralFactor],
  );

  const bom = useMemo(() => buildPergolaBom(model), [model]);

  // ----- Mutators -----
  const updateSpec = useCallback(
    (mutator: (current: PergolaSpec) => PergolaSpec) => {
      history.set((current) => mutator(current));
    },
    [history],
  );

  const applyPreset = useCallback(
    (id: PergolaSpec['sizeId']) => {
      const preset = getSizePreset(id);
      updateSpec((current) => ({
        ...current,
        sizeId: id,
        usesCustomSize: false,
        dimensions: { width: preset.width, depth: preset.depth, height: preset.height },
      }));
    },
    [updateSpec],
  );

  const setDimension = useCallback(
    (field: keyof PergolaDimensions, value: number) => {
      const [min, max] = DIMENSION_LIMITS[field];
      updateSpec((current) => ({
        ...current,
        usesCustomSize: true,
        dimensions: {
          ...current.dimensions,
          [field]: clamp(value, min, max),
        },
      }));
    },
    [updateSpec],
  );

  const setParameter = useCallback(
    (field: keyof PergolaParameters, value: number) => {
      updateSpec((current) => ({
        ...current,
        parameters: { ...current.parameters, [field]: value },
      }));
    },
    [updateSpec],
  );

  // ----- Save / Load slots -----
  const saveCurrentConfig = useCallback(() => {
    if (typeof window === 'undefined') return;
    const name = window.prompt('Name this configuration', `${activeSizePreset.label} • ${materialPreset.label}`);
    if (name === null) return;
    const updated = addSavedConfig(name, spec);
    setSavedConfigs(updated);
  }, [activeSizePreset.label, materialPreset.label, spec]);

  const loadSavedConfig = useCallback(
    (entry: SavedConfig) => {
      history.reset(sanitizePergolaSpec(entry.spec));
    },
    [history],
  );

  const deleteSavedConfig = useCallback((id: string) => {
    setSavedConfigs(removeSavedConfig(id));
  }, []);

  // ----- Export actions -----
  const handleExportJson = useCallback(() => {
    downloadJson({ spec, metrics: model.metrics, quote }, `pergola-${Date.now()}.json`);
  }, [spec, model.metrics, quote]);

  const handleExportCsv = useCallback(() => {
    downloadCsv(bomToCsv(bom), `pergola-bom-${Date.now()}.csv`);
  }, [bom]);

  const handleExportPng = useCallback(() => {
    const dataUrl = captureRef.current?.takeScreenshot() ?? null;
    if (dataUrl) downloadPng(dataUrl, `pergola-${Date.now()}.png`);
  }, []);

  const handleShareLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}${encodeSpecToHash(spec)}`;
    const ok = await copyTextToClipboard(url);
    setShareNotice(ok ? 'Share link copied to clipboard' : 'Could not copy automatically — copy the URL above.');
    window.setTimeout(() => setShareNotice(null), 3200);
  }, [spec]);

  // ----- Keyboard shortcuts -----
  useKeyboardShortcuts(
    useMemo(
      () => [
        { combo: 'mod+z', handler: () => history.undo(), description: 'Undo' },
        { combo: 'mod+shift+z', handler: () => history.redo(), description: 'Redo' },
        { combo: 'mod+y', handler: () => history.redo(), description: 'Redo' },
        { combo: 'mod+s', handler: () => saveCurrentConfig(), description: 'Save configuration' },
        { combo: 'mod+e', handler: () => handleExportJson(), description: 'Export JSON' },
        { combo: 'mod+k', handler: () => handleShareLink(), description: 'Copy share link' },
        { combo: '1', handler: () => setViewPreset('orbit') },
        { combo: '2', handler: () => setViewPreset('front') },
        { combo: '3', handler: () => setViewPreset('side') },
        { combo: '4', handler: () => setViewPreset('top') },
      ],
      [history, saveCurrentConfig, handleExportJson, handleShareLink],
    ),
  );

  // ----- Apply view preset to scene -----
  useEffect(() => {
    captureRef.current?.setViewPreset(viewPreset);
  }, [viewPreset]);

  const utilization = model.metrics.structuralUtilizationPct;
  const utilizationStatus =
    utilization > 110 ? 'danger' : utilization > 88 ? 'warn' : 'success';

  const activeSizeLabel = spec.usesCustomSize ? 'Custom Dimensions' : activeSizePreset.label;

  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <div className="grain-layer" />

      <div className="scene-container">
        <SceneCanvas
          mode={spec.modelMode}
          dimensions={spec.dimensions}
          parameters={spec.parameters}
          materialPreset={materialPreset}
          texturePreset={spec.texturePreset}
          buildOptions={buildOptions}
          viewPreset={viewPreset}
          captureRef={captureRef}
        />

        <div className="view-controls" role="toolbar" aria-label="Camera view presets">
          {(['orbit', 'front', 'side', 'top'] as ViewPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              className={viewPreset === preset ? 'active' : ''}
              onClick={() => setViewPreset(preset)}
              aria-pressed={viewPreset === preset}
              title={`View: ${preset} (press ${(['1', '2', '3', '4'] as const)[(['orbit', 'front', 'side', 'top'] as ViewPreset[]).indexOf(preset)]})`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <aside className="panel-wrap" aria-label="Pergola configurator panel">
        <section className="glass-card hero-card panel-header">
          <p className="eyebrow">Pergola Studio 3D</p>
          <h1>Configurator</h1>
          <p>Interactive GLB + mathematical pergola editor with live engineering, pricing, and exports.</p>
          <div className="summary-pills" aria-label="Active configuration summary">
            <span className="summary-pill">{spec.modelMode === 'sample' ? 'Sample Model' : 'Math Model'}</span>
            <span className="summary-pill">{activeSizeLabel}</span>
            <span className="summary-pill">{materialPreset.label}</span>
            <span className="summary-pill">{TEXTURE_LABELS[spec.texturePreset]}</span>
            <span className="summary-pill">{loadScenario.label}</span>
          </div>

          <div className="inline-actions" role="toolbar" aria-label="Configurator history controls">
            <button
              type="button"
              className="oc-icon-btn"
              onClick={history.undo}
              disabled={!history.canUndo}
              aria-label="Undo last change"
              title="Undo (⌘Z)"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              className="oc-icon-btn"
              onClick={history.redo}
              disabled={!history.canRedo}
              aria-label="Redo change"
              title="Redo (⌘⇧Z)"
            >
              ↷ Redo
            </button>
            <button
              type="button"
              className="oc-icon-btn"
              onClick={() => history.reset(DEFAULT_PERGOLA_SPEC)}
              title="Reset all values"
            >
              ⟲ Reset
            </button>
          </div>
        </section>

        <nav className="oc-stepper" aria-label="Configuration steps">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={activeStep === step.id ? 'active' : ''}
              onClick={() => setActiveStep(step.id)}
              aria-current={activeStep === step.id ? 'step' : undefined}
            >
              {index + 1}. {step.label}
            </button>
          ))}
        </nav>

        {activeStep === 'model' && (
          <section className="glass-card" aria-labelledby="step-model">
            <div className="section-head">
              <span className="section-kicker">Step 1</span>
              <h2 id="step-model" className="section-title">Model & Dimensions</h2>
            </div>

            <div className="segmented" role="radiogroup" aria-label="Render mode">
              <button
                type="button"
                role="radio"
                aria-checked={spec.modelMode === 'sample'}
                className={spec.modelMode === 'sample' ? 'active' : ''}
                onClick={() => updateSpec((current) => ({ ...current, modelMode: 'sample' }))}
              >
                Sample GLB
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={spec.modelMode === 'parametric'}
                className={spec.modelMode === 'parametric' ? 'active' : ''}
                onClick={() => updateSpec((current) => ({ ...current, modelMode: 'parametric' }))}
              >
                Mathematical
              </button>
            </div>

            <div className="size-grid size-grid-advanced">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={
                    spec.sizeId === preset.id && !spec.usesCustomSize
                      ? 'active size-option'
                      : 'size-option'
                  }
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={spec.sizeId === preset.id && !spec.usesCustomSize}
                >
                  <strong>{preset.label.split(' ')[0]}</strong>
                  <small>
                    {preset.width}m × {preset.depth}m × {preset.height}m
                  </small>
                </button>
              ))}
            </div>

            <div className="range-stack">
              <RangeControl
                label="Width"
                value={spec.dimensions.width}
                min={DIMENSION_LIMITS.width[0]}
                max={DIMENSION_LIMITS.width[1]}
                step={0.05}
                onChange={(value) => setDimension('width', value)}
                fractionDigits={2}
              />
              <RangeControl
                label="Depth"
                value={spec.dimensions.depth}
                min={DIMENSION_LIMITS.depth[0]}
                max={DIMENSION_LIMITS.depth[1]}
                step={0.05}
                onChange={(value) => setDimension('depth', value)}
                fractionDigits={2}
              />
              <RangeControl
                label="Height"
                value={spec.dimensions.height}
                min={DIMENSION_LIMITS.height[0]}
                max={DIMENSION_LIMITS.height[1]}
                step={0.05}
                onChange={(value) => setDimension('height', value)}
                fractionDigits={2}
              />
            </div>

            <div className="inline-actions">
              <button type="button" className="ghost" onClick={() => applyPreset(spec.sizeId)}>
                Reapply Selected Preset
              </button>
              {spec.usesCustomSize && <span className="tag">Using custom dimensions</span>}
            </div>
          </section>
        )}

        {activeStep === 'material' && (
          <section className="glass-card" aria-labelledby="step-material">
            <div className="section-head">
              <span className="section-kicker">Step 2</span>
              <h2 id="step-material" className="section-title">Materials</h2>
            </div>

            <h3>Frame Material</h3>
            <div className="color-grid">
              {MATERIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`color-chip ${spec.materialId === preset.id ? 'active' : ''}`}
                  onClick={() => updateSpec((current) => ({ ...current, materialId: preset.id }))}
                  aria-pressed={spec.materialId === preset.id}
                >
                  <span style={{ background: preset.swatch }} aria-hidden />
                  {preset.label}
                </button>
              ))}
            </div>

            <h3>Texture Style</h3>
            <div className="texture-grid">
              {(Object.keys(TEXTURE_LABELS) as Array<keyof typeof TEXTURE_LABELS>).map((texture) => (
                <button
                  key={texture}
                  type="button"
                  className={spec.texturePreset === texture ? 'active' : ''}
                  onClick={() => updateSpec((current) => ({ ...current, texturePreset: texture }))}
                  aria-pressed={spec.texturePreset === texture}
                >
                  {TEXTURE_LABELS[texture]}
                </button>
              ))}
            </div>
          </section>
        )}

        {activeStep === 'structure' && (
          <section className="glass-card" aria-labelledby="step-structure">
            <div className="section-head">
              <span className="section-kicker">Step 3</span>
              <h2 id="step-structure" className="section-title">Mathematical Structure</h2>
            </div>

            <p className="hint">Live formula: {MODEL_FORMULA}</p>
            <p className="hint">
              Physics model uses roof load + deflection and stress checks to auto-size beams and add bays/posts.
            </p>
            {spec.modelMode !== 'parametric' && (
              <p className="mode-note">Switch to Mathematical mode to edit structural variables live.</p>
            )}

            <div className="range-stack">
              <RangeControl
                label="Min Post Width"
                value={spec.parameters.postThickness}
                min={0.1}
                max={0.24}
                step={0.005}
                onChange={(value) => setParameter('postThickness', value)}
                disabled={spec.modelMode !== 'parametric'}
              />
              <RangeControl
                label="Min Beam Width"
                value={spec.parameters.beamThickness}
                min={0.08}
                max={0.22}
                step={0.005}
                onChange={(value) => setParameter('beamThickness', value)}
                disabled={spec.modelMode !== 'parametric'}
              />
              <RangeControl
                label="Slat Thickness"
                value={spec.parameters.slatThickness}
                min={0.02}
                max={0.08}
                step={0.0025}
                onChange={(value) => setParameter('slatThickness', value)}
                disabled={spec.modelMode !== 'parametric'}
              />
              <RangeControl
                label="Slat Spacing"
                value={spec.parameters.slatSpacing}
                min={0.12}
                max={0.4}
                step={0.01}
                onChange={(value) => setParameter('slatSpacing', value)}
                disabled={spec.modelMode !== 'parametric'}
              />
            </div>

            <button
              type="button"
              className="ghost"
              onClick={() => updateSpec((current) => ({ ...current, parameters: { ...DEFAULT_PARAMETERS } }))}
            >
              Reset Structural Parameters
            </button>
          </section>
        )}

        {activeStep === 'engineering' && (
          <section className="glass-card" aria-labelledby="step-engineering">
            <div className="section-head">
              <span className="section-kicker">Step 4</span>
              <h2 id="step-engineering" className="section-title">Engineering & Compliance</h2>
            </div>

            <h3>Loading Scenario</h3>
            <div className="size-grid size-grid-advanced">
              {LOAD_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={
                    spec.loadScenarioId === scenario.id ? 'active size-option' : 'size-option'
                  }
                  onClick={() => updateSpec((current) => ({ ...current, loadScenarioId: scenario.id }))}
                  aria-pressed={spec.loadScenarioId === scenario.id}
                >
                  <strong>{scenario.label}</strong>
                  <small>
                    {scenario.roofLoadKPa.toFixed(2)} kPa • lateral ×{scenario.lateralFactor.toFixed(2)}
                  </small>
                </button>
              ))}
            </div>
            <p className="hint">{loadScenario.description}</p>

            <h3>Compliance Snapshot</h3>
            <div className={`compliance-row ${utilizationStatus}`}>
              <span>Beam utilization</span>
              <div className="util-bar" aria-hidden>
                <span style={{ width: `${Math.min(100, utilization)}%` }} />
              </div>
              <strong>{fmtPercent(utilization, 0)}</strong>
            </div>
            <p className="hint">
              Status:{' '}
              <span className={`tag ${utilizationStatus === 'success' ? 'success' : utilizationStatus}`}>
                {utilizationStatus === 'success'
                  ? 'Within design envelope'
                  : utilizationStatus === 'warn'
                    ? 'Approaching limits'
                    : 'Exceeds preliminary envelope'}
              </span>
            </p>

            <h3>Engineering Metrics</h3>
            <div className="metrics-grid" aria-label="Engineering metrics">
              <div className="metric-highlight">
                <span className="metric-label">Dimensions</span>
                <strong>
                  {fmtMeters(spec.dimensions.width)} × {fmtMeters(spec.dimensions.depth)} × {fmtMeters(spec.dimensions.height)}
                </strong>
              </div>
              <div>
                <span className="metric-label">Footprint</span>
                <strong>{fmtArea(model.metrics.footprintM2)}</strong>
              </div>
              <div>
                <span className="metric-label">Perimeter</span>
                <strong>{fmtMeters(model.metrics.perimeterM)}</strong>
              </div>
              <div>
                <span className="metric-label">Clear Height</span>
                <strong>{fmtMeters(model.metrics.clearHeightM)}</strong>
              </div>
              <div>
                <span className="metric-label">Slat Count</span>
                <strong>{model.metrics.slatCount}</strong>
              </div>
              <div>
                <span className="metric-label">Post Count</span>
                <strong>{model.metrics.postCount}</strong>
              </div>
              <div>
                <span className="metric-label">Bays</span>
                <strong>
                  {model.metrics.bayCountX} × {model.metrics.bayCountZ}
                </strong>
              </div>
              <div>
                <span className="metric-label">Beam Section</span>
                <strong>{fmtSectionMm(model.metrics.beamWidthM, model.metrics.beamDepthM)}</strong>
              </div>
              <div>
                <span className="metric-label">Post Section</span>
                <strong>{Math.round(model.metrics.postThicknessM * 1000)} mm</strong>
              </div>
              <div>
                <span className="metric-label">Sections</span>
                <strong>{model.metrics.sectionCount}</strong>
              </div>
              <div>
                <span className="metric-label">Max Clear Span</span>
                <strong>{fmtMeters(model.metrics.maxClearSpanM)}</strong>
              </div>
              <div>
                <span className="metric-label">Shade Coverage</span>
                <strong>{fmtPercent(model.metrics.shadeCoveragePct, 1)}</strong>
              </div>
              <div>
                <span className="metric-label">Design Load</span>
                <strong>{model.metrics.designLoadKPa.toFixed(2)} kPa</strong>
              </div>
              <div>
                <span className="metric-label">Frame Volume</span>
                <strong>{fmtVolume(model.metrics.frameVolumeM3)}</strong>
              </div>
              <div>
                <span className="metric-label">Estimated Weight</span>
                <strong>{fmtWeight(model.metrics.estimatedWeightKg)}</strong>
              </div>
            </div>
          </section>
        )}

        {activeStep === 'quote' && (
          <section className="glass-card" aria-labelledby="step-quote">
            <div className="section-head">
              <span className="section-kicker">Step 5</span>
              <h2 id="step-quote" className="section-title">Quote, BOM & Export</h2>
            </div>

            <h3>Estimated Investment</h3>
            <div className="quote-summary" aria-label="Estimated quote">
              {quote.lines.map((line) => (
                <div key={line.id} className="quote-row">
                  <span>
                    {line.label}
                    {line.detail ? <small style={{ display: 'block', opacity: 0.7 }}>{line.detail}</small> : null}
                  </span>
                  <strong>{fmtCurrency(line.amount)}</strong>
                </div>
              ))}
              <div className="quote-row">
                <span>Subtotal</span>
                <strong>{fmtCurrency(quote.subtotal)}</strong>
              </div>
              <div className="quote-row">
                <span>Tax (estimated)</span>
                <strong>{fmtCurrency(quote.tax)}</strong>
              </div>
              <div className="quote-total">
                <span>Total</span>
                <strong>{fmtCurrency(quote.total)}</strong>
              </div>
            </div>

            <h3>Bill of Materials</h3>
            <table className="bom-table" aria-label="Bill of materials">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Section</th>
                  <th className="right">Qty</th>
                  <th className="right">Length</th>
                </tr>
              </thead>
              <tbody>
                {bom.map((row) => (
                  <tr key={`${row.category}-${row.section}-${row.lengthM}`}>
                    <td>{row.category}</td>
                    <td>{row.section}</td>
                    <td className="right">{row.count}</td>
                    <td className="right">{row.totalLengthM.toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Export & Share</h3>
            <div className="inline-actions">
              <button type="button" className="oc-icon-btn primary" onClick={handleExportJson} title="Export JSON (⌘E)">
                ⤓ JSON
              </button>
              <button type="button" className="oc-icon-btn" onClick={handleExportCsv}>
                ⤓ BOM (CSV)
              </button>
              <button type="button" className="oc-icon-btn" onClick={handleExportPng}>
                ⤓ PNG
              </button>
              <button type="button" className="oc-icon-btn" onClick={handleShareLink} title="Copy share link (⌘K)">
                ↗ Share link
              </button>
            </div>
            {shareNotice && <p className="hint" role="status">{shareNotice}</p>}

            <h3>Saved Configurations</h3>
            <div className="inline-actions">
              <button type="button" className="oc-icon-btn" onClick={saveCurrentConfig} title="Save (⌘S)">
                ＋ Save current
              </button>
            </div>
            {savedConfigs.length === 0 ? (
              <p className="hint">No saved configurations yet.</p>
            ) : (
              <div className="saved-list">
                {savedConfigs.map((entry) => (
                  <div className="saved-row" key={entry.id}>
                    <div className="saved-meta">
                      <strong>{entry.name}</strong>
                      <small>{new Date(entry.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="saved-actions">
                      <button type="button" onClick={() => loadSavedConfig(entry)}>Load</button>
                      <button type="button" className="danger" onClick={() => deleteSavedConfig(entry.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}
