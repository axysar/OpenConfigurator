import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useHistoryState,
  useKeyboardShortcuts,
  useI18n,
  embedApi,
  evaluateRules,
  applyRuleResults,
  trackStepViewed,
  trackOptionChanged,
  trackQuoteViewed,
  trackExport,
  trackShareLink,
  trackLeadSubmitted,
  trackViewPresetChanged,
  trackRuleTriggered,
  LeadCaptureForm,
  SceneA11y,
} from '@core/index';
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
import { PERGOLA_RULES } from './lib/pergolaRules';
import { SCENE_ENVIRONMENTS } from './lib/sceneEnvironments';
import { INSPIRATION_GALLERY } from './lib/inspirationGallery';
import { openSpecSheetPdf } from './lib/pdfSpecSheet';
import { ComparePanel } from './components/ComparePanel';

const DIMENSION_LIMITS = {
  width: [2.5, 9] as const,
  depth: [2.5, 10] as const,
  height: [2.2, 4] as const,
};

const STEPS: Array<{ id: string; tKey: string }> = [
  { id: 'model', tKey: 'pergola.step.model' },
  { id: 'material', tKey: 'pergola.step.material' },
  { id: 'structure', tKey: 'pergola.step.structure' },
  { id: 'engineering', tKey: 'pergola.step.engineering' },
  { id: 'quote', tKey: 'pergola.step.quote' },
  { id: 'review', tKey: 'Review' },
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
  const { t } = useI18n();
  const initialSpec = useMemo(computeInitialSpec, []);
  const history = useHistoryState<PergolaSpec>(initialSpec);
  const spec = history.state;

  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => loadSavedConfigs());
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [viewPreset, setViewPreset] = useState<ViewPreset>('orbit');
  const [showDimensions, setShowDimensions] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [environmentId, setEnvironmentId] = useState('day');
  const [compareTarget, setCompareTarget] = useState<SavedConfig | null>(null);
  const captureRef = useRef<SceneCaptureHandle | null>(null);

  // ----- Rules engine -----
  const ruleResult = useMemo(
    () => evaluateRules(PERGOLA_RULES, spec as unknown as Record<string, unknown>),
    [spec],
  );

  useEffect(() => {
    const patched = applyRuleResults(
      spec as unknown as Record<string, unknown>,
      ruleResult,
    ) as unknown as PergolaSpec;
    if (JSON.stringify(patched) !== JSON.stringify(spec)) {
      history.replace(patched);
    }
    for (const warning of ruleResult.warnings) {
      trackRuleTriggered('auto', warning);
    }
  }, [ruleResult, spec, history]);

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

  // ----- Embed API bridge -----
  useEffect(() => {
    if (!embedApi.isEmbedded) return;
    embedApi.emit('oc:specChanged', { spec });
  }, [spec]);

  useEffect(() => {
    const unsubs = [
      embedApi.on('oc:setSpec', (data) => {
        const incoming = sanitizePergolaSpec(data.spec);
        history.reset(incoming);
      }),
      embedApi.on('oc:getSpec', () => {
        embedApi.emit('oc:specResponse', { spec });
      }),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [spec, history]);

  // ----- Analytics: step tracking -----
  useEffect(() => {
    trackStepViewed(activeStep);
  }, [activeStep]);

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

  // Track quote when step is active
  useEffect(() => {
    if (activeStep === 'quote') {
      trackQuoteViewed(quote.total, 'USD');
    }
  }, [activeStep, quote.total]);

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
      trackOptionChanged('sizeId', id);
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

  // ----- Save / Load -----
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

  // ----- Exports -----
  const handleExportJson = useCallback(() => {
    trackExport('json');
    downloadJson({ spec, metrics: model.metrics, quote }, `pergola-${Date.now()}.json`);
  }, [spec, model.metrics, quote]);

  const handleExportCsv = useCallback(() => {
    trackExport('csv');
    downloadCsv(bomToCsv(bom), `pergola-bom-${Date.now()}.csv`);
  }, [bom]);

  const handleExportPng = useCallback(() => {
    trackExport('png');
    const dataUrl = captureRef.current?.takeScreenshot() ?? null;
    if (dataUrl) downloadPng(dataUrl, `pergola-${Date.now()}.png`);
  }, []);

  const handleShareLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    trackShareLink();
    const url = `${window.location.origin}${window.location.pathname}${encodeSpecToHash(spec)}`;
    const ok = await copyTextToClipboard(url);
    setShareNotice(ok ? 'Share link copied to clipboard' : 'Could not copy — use the URL bar.');
    window.setTimeout(() => setShareNotice(null), 3200);
  }, [spec]);

  const handleExportPdf = useCallback(() => {
    trackExport('pdf');
    const screenshotDataUrl = captureRef.current?.takeScreenshot() ?? null;
    openSpecSheetPdf({
      spec,
      metrics: model.metrics,
      quote,
      bom,
      materialLabel: materialPreset.label,
      loadScenarioLabel: loadScenario.label,
      screenshotDataUrl,
    });
  }, [spec, model.metrics, quote, bom, materialPreset.label, loadScenario.label]);

  const handleLoadInspiration = useCallback(
    (inspirationSpec: PergolaSpec) => {
      history.reset(sanitizePergolaSpec(inspirationSpec));
      setActiveStep('model');
    },
    [history],
  );

  const handleLeadSubmit = useCallback(
    (data: { name: string; email: string; phone: string }) => {
      trackLeadSubmitted(data.phone.length > 0);
      embedApi.emit('oc:leadSubmitted', { lead: data, spec, quote });
    },
    [spec, quote],
  );

  // ----- View presets -----
  const handleViewPreset = useCallback((preset: ViewPreset) => {
    setViewPreset(preset);
    trackViewPresetChanged(preset);
  }, []);

  // ----- Keyboard -----
  useKeyboardShortcuts(
    useMemo(
      () => [
        { combo: 'mod+z', handler: () => history.undo() },
        { combo: 'mod+shift+z', handler: () => history.redo() },
        { combo: 'mod+y', handler: () => history.redo() },
        { combo: 'mod+s', handler: () => saveCurrentConfig() },
        { combo: 'mod+e', handler: () => handleExportJson() },
        { combo: 'mod+k', handler: () => handleShareLink() },
        { combo: '1', handler: () => handleViewPreset('orbit') },
        { combo: '2', handler: () => handleViewPreset('front') },
        { combo: '3', handler: () => handleViewPreset('side') },
        { combo: '4', handler: () => handleViewPreset('top') },
        { combo: 'd', handler: () => setShowDimensions((prev) => !prev) },
      ],
      [history, saveCurrentConfig, handleExportJson, handleShareLink, handleViewPreset],
    ),
  );

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
          showDimensions={showDimensions}
          showHotspots={showHotspots}
          autoRotate={autoRotate}
          environmentId={environmentId}
        />

        <div className="view-controls" role="toolbar" aria-label="Camera view presets">
          {(['orbit', 'front', 'side', 'top'] as ViewPreset[]).map((preset, idx) => (
            <button
              key={preset}
              type="button"
              className={viewPreset === preset ? 'active' : ''}
              onClick={() => handleViewPreset(preset)}
              aria-pressed={viewPreset === preset}
              title={`${preset} (${idx + 1})`}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            className={showDimensions ? 'active' : ''}
            onClick={() => setShowDimensions((prev) => !prev)}
            aria-pressed={showDimensions}
            title="Dimension labels (D)"
          >
            dims
          </button>
          <button
            type="button"
            className={showHotspots ? 'active' : ''}
            onClick={() => setShowHotspots((prev) => !prev)}
            aria-pressed={showHotspots}
            title="Part info hotspots"
          >
            info
          </button>
          <button
            type="button"
            className={autoRotate ? 'active' : ''}
            onClick={() => setAutoRotate((prev) => !prev)}
            aria-pressed={autoRotate}
            title="Auto-rotate"
          >
            spin
          </button>
        </div>
      </div>

      <SceneA11y description={`3D pergola configurator showing a ${spec.dimensions.width.toFixed(1)} by ${spec.dimensions.depth.toFixed(1)} meter pergola, ${spec.dimensions.height.toFixed(1)} meters tall, in ${materialPreset.label} finish. ${model.metrics.postCount} posts, ${model.metrics.slatCount} slats. Estimated weight ${Math.round(model.metrics.estimatedWeightKg)} kilograms. Total estimated price ${Math.round(quote.total)} dollars.`} />

      <aside className="panel-wrap" aria-label="Pergola configurator panel">
        <section className="glass-card hero-card panel-header">
          <p className="eyebrow">{t('pergola.hero.eyebrow')}</p>
          <h1>{t('pergola.hero.title')}</h1>
          <p>{t('pergola.hero.subtitle')}</p>
          <div className="summary-pills" aria-label="Active configuration summary">
            <span className="summary-pill">{spec.modelMode === 'sample' ? 'Sample' : 'Math'}</span>
            <span className="summary-pill">{activeSizeLabel}</span>
            <span className="summary-pill">{materialPreset.label}</span>
            <span className="summary-pill">{TEXTURE_LABELS[spec.texturePreset]}</span>
            <span className="summary-pill">{loadScenario.label}</span>
          </div>

          <div className="inline-actions" role="toolbar" aria-label="History controls">
            <button type="button" className="oc-icon-btn" onClick={history.undo} disabled={!history.canUndo} title="Undo (⌘Z)">
              {t('undo')}
            </button>
            <button type="button" className="oc-icon-btn" onClick={history.redo} disabled={!history.canRedo} title="Redo (⌘⇧Z)">
              {t('redo')}
            </button>
            <button type="button" className="oc-icon-btn" onClick={() => history.reset(DEFAULT_PERGOLA_SPEC)} title="Reset all">
              {t('reset')}
            </button>
          </div>
        </section>

        {/* Rule warnings */}
        {ruleResult.warnings.length > 0 && (
          <div className="rule-warnings" role="alert">
            {ruleResult.warnings.map((msg, idx) => (
              <div key={idx} className="rule-warning">{msg}</div>
            ))}
          </div>
        )}

        <nav className="oc-stepper" aria-label="Configuration steps">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={activeStep === step.id ? 'active' : ''}
              onClick={() => setActiveStep(step.id)}
              aria-current={activeStep === step.id ? 'step' : undefined}
            >
              {index + 1}. {t(step.tKey)}
            </button>
          ))}
        </nav>

        {activeStep === 'model' && (
          <section className="glass-card" aria-labelledby="step-model">
            <div className="section-head">
              <span className="section-kicker">Step 1</span>
              <h2 id="step-model" className="section-title">{t('pergola.step.model')}</h2>
            </div>

            <div className="segmented" role="radiogroup" aria-label="Render mode">
              <button
                type="button"
                role="radio"
                aria-checked={spec.modelMode === 'sample'}
                className={spec.modelMode === 'sample' ? 'active' : ''}
                onClick={() => {
                  trackOptionChanged('modelMode', 'sample', spec.modelMode);
                  updateSpec((c) => ({ ...c, modelMode: 'sample' }));
                }}
              >
                {t('pergola.model.sampleGlb')}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={spec.modelMode === 'parametric'}
                className={spec.modelMode === 'parametric' ? 'active' : ''}
                onClick={() => {
                  trackOptionChanged('modelMode', 'parametric', spec.modelMode);
                  updateSpec((c) => ({ ...c, modelMode: 'parametric' }));
                }}
              >
                {t('pergola.model.mathematical')}
              </button>
            </div>

            <div className="size-grid size-grid-advanced">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={spec.sizeId === preset.id && !spec.usesCustomSize ? 'active size-option' : 'size-option'}
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={spec.sizeId === preset.id && !spec.usesCustomSize}
                >
                  <strong>{preset.label.split(' ')[0]}</strong>
                  <small>{preset.width}m × {preset.depth}m × {preset.height}m</small>
                </button>
              ))}
            </div>

            <div className="range-stack">
              <RangeControl label={t('pergola.model.width')} value={spec.dimensions.width} min={DIMENSION_LIMITS.width[0]} max={DIMENSION_LIMITS.width[1]} step={0.05} onChange={(v) => setDimension('width', v)} fractionDigits={2} />
              <RangeControl label={t('pergola.model.depth')} value={spec.dimensions.depth} min={DIMENSION_LIMITS.depth[0]} max={DIMENSION_LIMITS.depth[1]} step={0.05} onChange={(v) => setDimension('depth', v)} fractionDigits={2} />
              <RangeControl label={t('pergola.model.height')} value={spec.dimensions.height} min={DIMENSION_LIMITS.height[0]} max={DIMENSION_LIMITS.height[1]} step={0.05} onChange={(v) => setDimension('height', v)} fractionDigits={2} />
            </div>

            <div className="inline-actions">
              <button type="button" className="ghost" onClick={() => applyPreset(spec.sizeId)}>{t('pergola.model.reapply')}</button>
              {spec.usesCustomSize && <span className="tag">{t('pergola.model.customDims')}</span>}
            </div>
          </section>
        )}

        {activeStep === 'material' && (
          <section className="glass-card" aria-labelledby="step-material">
            <div className="section-head">
              <span className="section-kicker">Step 2</span>
              <h2 id="step-material" className="section-title">{t('pergola.step.material')}</h2>
            </div>

            <h3>{t('pergola.material.frame')}</h3>
            <div className="color-grid">
              {MATERIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`color-chip ${spec.materialId === preset.id ? 'active' : ''}`}
                  onClick={() => {
                    trackOptionChanged('materialId', preset.id, spec.materialId);
                    updateSpec((c) => ({ ...c, materialId: preset.id }));
                  }}
                  aria-pressed={spec.materialId === preset.id}
                >
                  <span style={{ background: preset.swatch }} aria-hidden />
                  {preset.label}
                </button>
              ))}
            </div>

            <h3>{t('pergola.material.texture')}</h3>
            <div className="texture-grid">
              {(Object.keys(TEXTURE_LABELS) as Array<keyof typeof TEXTURE_LABELS>).map((tex) => (
                <button
                  key={tex}
                  type="button"
                  className={spec.texturePreset === tex ? 'active' : ''}
                  onClick={() => {
                    trackOptionChanged('texturePreset', tex, spec.texturePreset);
                    updateSpec((c) => ({ ...c, texturePreset: tex }));
                  }}
                  aria-pressed={spec.texturePreset === tex}
                  disabled={ruleResult.disabledFields.has(`texturePreset.${tex}`)}
                >
                  {TEXTURE_LABELS[tex]}
                </button>
              ))}
            </div>
          </section>
        )}

        {activeStep === 'structure' && (
          <section className="glass-card" aria-labelledby="step-structure">
            <div className="section-head">
              <span className="section-kicker">Step 3</span>
              <h2 id="step-structure" className="section-title">{t('pergola.step.structure')}</h2>
            </div>

            <p className="hint">{t('pergola.structure.formula')}: {MODEL_FORMULA}</p>
            <p className="hint">{t('pergola.structure.hint')}</p>
            {spec.modelMode !== 'parametric' && <p className="mode-note">{t('pergola.structure.switchNote')}</p>}

            <div className="range-stack">
              <RangeControl label="Min Post Width" value={spec.parameters.postThickness} min={0.1} max={0.24} step={0.005} onChange={(v) => setParameter('postThickness', v)} disabled={spec.modelMode !== 'parametric'} />
              <RangeControl label="Min Beam Width" value={spec.parameters.beamThickness} min={0.08} max={0.22} step={0.005} onChange={(v) => setParameter('beamThickness', v)} disabled={spec.modelMode !== 'parametric'} />
              <RangeControl label="Slat Thickness" value={spec.parameters.slatThickness} min={0.02} max={0.08} step={0.0025} onChange={(v) => setParameter('slatThickness', v)} disabled={spec.modelMode !== 'parametric'} />
              <RangeControl label="Slat Spacing" value={spec.parameters.slatSpacing} min={0.12} max={0.4} step={0.01} onChange={(v) => setParameter('slatSpacing', v)} disabled={spec.modelMode !== 'parametric'} />
            </div>

            <button type="button" className="ghost" onClick={() => updateSpec((c) => ({ ...c, parameters: { ...DEFAULT_PARAMETERS } }))}>
              {t('pergola.structure.reset')}
            </button>
          </section>
        )}

        {activeStep === 'engineering' && (
          <section className="glass-card" aria-labelledby="step-engineering">
            <div className="section-head">
              <span className="section-kicker">Step 4</span>
              <h2 id="step-engineering" className="section-title">{t('pergola.step.engineering')}</h2>
            </div>

            <h3>{t('pergola.engineering.loadScenario')}</h3>
            <div className="size-grid size-grid-advanced">
              {LOAD_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={spec.loadScenarioId === scenario.id ? 'active size-option' : 'size-option'}
                  onClick={() => {
                    trackOptionChanged('loadScenarioId', scenario.id, spec.loadScenarioId);
                    updateSpec((c) => ({ ...c, loadScenarioId: scenario.id }));
                  }}
                  aria-pressed={spec.loadScenarioId === scenario.id}
                >
                  <strong>{scenario.label}</strong>
                  <small>{scenario.roofLoadKPa.toFixed(2)} kPa • lateral ×{scenario.lateralFactor.toFixed(2)}</small>
                </button>
              ))}
            </div>
            <p className="hint">{loadScenario.description}</p>

            <h3>{t('pergola.engineering.compliance')}</h3>
            <div className={`compliance-row ${utilizationStatus}`}>
              <span>Utilization</span>
              <div className="util-bar" aria-hidden>
                <span style={{ width: `${Math.min(100, utilization)}%` }} />
              </div>
              <strong>{fmtPercent(utilization, 0)}</strong>
            </div>
            <p className="hint">
              <span className={`tag ${utilizationStatus}`}>
                {utilizationStatus === 'success' ? 'Within design envelope' : utilizationStatus === 'warn' ? 'Approaching limits' : 'Exceeds preliminary envelope'}
              </span>
            </p>

            <h3>Scene Environment</h3>
            <div className="env-picker">
              {SCENE_ENVIRONMENTS.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  className={environmentId === env.id ? 'active' : ''}
                  onClick={() => setEnvironmentId(env.id)}
                  aria-pressed={environmentId === env.id}
                >
                  {env.label}
                </button>
              ))}
            </div>

            <h3>{t('pergola.engineering.metrics')}</h3>
            <div className="metrics-grid" aria-label="Engineering metrics">
              <div className="metric-highlight">
                <span className="metric-label">Dimensions</span>
                <strong>{fmtMeters(spec.dimensions.width)} × {fmtMeters(spec.dimensions.depth)} × {fmtMeters(spec.dimensions.height)}</strong>
              </div>
              <div><span className="metric-label">Footprint</span><strong>{fmtArea(model.metrics.footprintM2)}</strong></div>
              <div><span className="metric-label">Perimeter</span><strong>{fmtMeters(model.metrics.perimeterM)}</strong></div>
              <div><span className="metric-label">Clear Height</span><strong>{fmtMeters(model.metrics.clearHeightM)}</strong></div>
              <div><span className="metric-label">Slat Count</span><strong>{model.metrics.slatCount}</strong></div>
              <div><span className="metric-label">Post Count</span><strong>{model.metrics.postCount}</strong></div>
              <div><span className="metric-label">Bays</span><strong>{model.metrics.bayCountX} × {model.metrics.bayCountZ}</strong></div>
              <div><span className="metric-label">Beam Section</span><strong>{fmtSectionMm(model.metrics.beamWidthM, model.metrics.beamDepthM)}</strong></div>
              <div><span className="metric-label">Post Section</span><strong>{Math.round(model.metrics.postThicknessM * 1000)} mm</strong></div>
              <div><span className="metric-label">Max Clear Span</span><strong>{fmtMeters(model.metrics.maxClearSpanM)}</strong></div>
              <div><span className="metric-label">Shade Coverage</span><strong>{fmtPercent(model.metrics.shadeCoveragePct, 1)}</strong></div>
              <div><span className="metric-label">Design Load</span><strong>{model.metrics.designLoadKPa.toFixed(2)} kPa</strong></div>
              <div><span className="metric-label">Frame Volume</span><strong>{fmtVolume(model.metrics.frameVolumeM3)}</strong></div>
              <div><span className="metric-label">Estimated Weight</span><strong>{fmtWeight(model.metrics.estimatedWeightKg)}</strong></div>
            </div>
          </section>
        )}

        {activeStep === 'quote' && (
          <section className="glass-card" aria-labelledby="step-quote">
            <div className="section-head">
              <span className="section-kicker">Step 5</span>
              <h2 id="step-quote" className="section-title">{t('pergola.step.quote')}</h2>
            </div>

            <h3>{t('pergola.quote.heading')}</h3>
            <div className="quote-summary" aria-label="Estimated quote">
              {quote.lines.map((line) => (
                <div key={line.id} className="quote-row">
                  <span>{line.label}{line.detail ? <small style={{ display: 'block', opacity: 0.7 }}>{line.detail}</small> : null}</span>
                  <strong>{fmtCurrency(line.amount)}</strong>
                </div>
              ))}
              <div className="quote-row"><span>{t('pergola.quote.subtotal')}</span><strong>{fmtCurrency(quote.subtotal)}</strong></div>
              <div className="quote-row"><span>{t('pergola.quote.tax')}</span><strong>{fmtCurrency(quote.tax)}</strong></div>
              <div className="quote-total"><span>{t('pergola.quote.total')}</span><strong>{fmtCurrency(quote.total)}</strong></div>
            </div>

            <h3>{t('pergola.quote.bom')}</h3>
            <table className="bom-table" aria-label="Bill of materials">
              <thead><tr><th>Category</th><th>Section</th><th className="right">Qty</th><th className="right">Length</th></tr></thead>
              <tbody>
                {bom.map((row) => (
                  <tr key={`${row.category}-${row.section}-${row.lengthM}`}>
                    <td>{row.category}</td><td>{row.section}</td><td className="right">{row.count}</td><td className="right">{row.totalLengthM.toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>{t('pergola.quote.export')}</h3>
            <div className="inline-actions">
              <button type="button" className="oc-icon-btn primary" onClick={handleExportJson} title="Export JSON (⌘E)">⤓ JSON</button>
              <button type="button" className="oc-icon-btn" onClick={handleExportCsv}>⤓ BOM</button>
              <button type="button" className="oc-icon-btn" onClick={handleExportPng}>⤓ PNG</button>
              <button type="button" className="oc-icon-btn" onClick={handleExportPdf}>⤓ PDF</button>
              <button type="button" className="oc-icon-btn" onClick={handleShareLink} title="Copy share link (⌘K)">↗ Share</button>
            </div>
            {shareNotice && <p className="hint" role="status">{shareNotice}</p>}

            <h3>{t('lead.heading')}</h3>
            <LeadCaptureForm
              specJson={JSON.stringify(spec)}
              onSubmit={handleLeadSubmit}
            />

            <h3>{t('pergola.quote.savedHeading')}</h3>
            <div className="inline-actions">
              <button type="button" className="oc-icon-btn" onClick={saveCurrentConfig} title="Save (⌘S)">{t('pergola.quote.saveCurrent')}</button>
            </div>
            {savedConfigs.length === 0 ? (
              <p className="hint">{t('pergola.quote.noSaved')}</p>
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
                      <button type="button" onClick={() => setCompareTarget(entry)}>Compare</button>
                      <button type="button" className="danger" onClick={() => deleteSavedConfig(entry.id)}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {activeStep === 'review' && (
          <section className="glass-card" aria-labelledby="step-review">
            <div className="section-head">
              <span className="section-kicker">Step 6</span>
              <h2 id="step-review" className="section-title">Review & Finalize</h2>
            </div>

            <div className="review-grid">
              <div><span className="review-label">Dimensions</span><strong>{fmtMeters(spec.dimensions.width)} × {fmtMeters(spec.dimensions.depth)} × {fmtMeters(spec.dimensions.height)}</strong></div>
              <div><span className="review-label">Material</span><strong>{materialPreset.label}</strong></div>
              <div><span className="review-label">Texture</span><strong>{TEXTURE_LABELS[spec.texturePreset]}</strong></div>
              <div><span className="review-label">Load Scenario</span><strong>{loadScenario.label}</strong></div>
              <div><span className="review-label">Posts / Bays</span><strong>{model.metrics.postCount} / {model.metrics.bayCountX}×{model.metrics.bayCountZ}</strong></div>
              <div><span className="review-label">Weight</span><strong>{fmtWeight(model.metrics.estimatedWeightKg)}</strong></div>
              <div><span className="review-label">Utilization</span><strong><span className={`tag ${utilizationStatus}`}>{fmtPercent(utilization, 0)}</span></strong></div>
              <div><span className="review-label">Total Price</span><strong>{fmtCurrency(quote.total)}</strong></div>
            </div>

            <h3>Inspiration Gallery</h3>
            <p className="hint">Start from a curated design — click any card to load it.</p>
            <div className="inspiration-grid">
              {INSPIRATION_GALLERY.map((item) => (
                <div
                  key={item.id}
                  className="inspiration-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleLoadInspiration(item.spec)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadInspiration(item.spec)}
                >
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <div className="inspiration-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {compareTarget && (
        <ComparePanel
          currentSpec={spec}
          compareTarget={compareTarget}
          onClose={() => setCompareTarget(null)}
        />
      )}
    </div>
  );
}
