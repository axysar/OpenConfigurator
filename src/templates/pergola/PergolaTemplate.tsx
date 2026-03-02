import { useMemo, useState } from 'react';
import { SceneCanvas } from './components/SceneCanvas';
import {
  MODEL_FORMULA,
  DEFAULT_PARAMETERS,
  MATERIAL_PRESETS,
  TEXTURE_LABELS,
  SIZE_PRESETS,
  buildPergolaModel,
  getMaterialPreset,
  getSizePreset,
  type MaterialPresetId,
  type ModelMode,
  type PergolaDimensions,
  type PergolaParameters,
  type SizePresetId,
  type TexturePreset,
} from './lib/pergolaMath';

const INITIAL_SIZE_ID: SizePresetId = 'family';

const DIMENSION_LIMITS = {
  width: [2.5, 9] as const,
  depth: [2.5, 10] as const,
  height: [2.2, 4] as const,
};

const createDimensionsFromPreset = (id: SizePresetId): PergolaDimensions => {
  const preset = getSizePreset(id);
  return { width: preset.width, depth: preset.depth, height: preset.height };
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const fmtMeters = (value: number): string => `${value.toFixed(2)} m`;
const fmtArea = (value: number): string => `${value.toFixed(2)} m²`;
const fmtWeight = (value: number): string => `${Math.round(value)} kg`;
const fmtVolume = (value: number): string => `${value.toFixed(3)} m³`;
const fmtSectionMm = (widthM: number, depthM: number): string =>
  `${Math.round(widthM * 1000)} x ${Math.round(depthM * 1000)} mm`;

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  unit?: string;
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
}: RangeControlProps): JSX.Element => (
  <label className={`range-control ${disabled ? 'disabled' : ''}`}>
    <div className="range-head">
      <span>{label}</span>
      <strong>
        {value.toFixed(3)} {unit}
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
    />
  </label>
);

export default function PergolaTemplate(): JSX.Element {
  const [modelMode, setModelMode] = useState<ModelMode>('sample');
  const [sizeId, setSizeId] = useState<SizePresetId>(INITIAL_SIZE_ID);
  const [dimensions, setDimensions] = useState<PergolaDimensions>(() =>
    createDimensionsFromPreset(INITIAL_SIZE_ID),
  );
  const [usesCustomSize, setUsesCustomSize] = useState(false);
  const [materialId, setMaterialId] = useState<MaterialPresetId>('graphite_matte');
  const [texturePreset, setTexturePreset] = useState<TexturePreset>('none');
  const [parameters, setParameters] = useState<PergolaParameters>(DEFAULT_PARAMETERS);

  const activeSizePreset = useMemo(() => getSizePreset(sizeId), [sizeId]);
  const materialPreset = useMemo(() => getMaterialPreset(materialId), [materialId]);

  const model = useMemo(
    () => buildPergolaModel(dimensions, parameters, materialPreset),
    [dimensions, materialPreset, parameters],
  );

  const applyPreset = (id: SizePresetId): void => {
    const preset = getSizePreset(id);
    setSizeId(id);
    setDimensions({ width: preset.width, depth: preset.depth, height: preset.height });
    setUsesCustomSize(false);
  };

  const setDimension = (field: keyof PergolaDimensions, value: number): void => {
    const [min, max] = DIMENSION_LIMITS[field];
    setDimensions((current) => ({
      ...current,
      [field]: clamp(value, min, max),
    }));
    setUsesCustomSize(true);
  };

  const setParameter = (field: keyof PergolaParameters, value: number): void => {
    setParameters((current) => ({ ...current, [field]: value }));
  };

  const activeSizeLabel = usesCustomSize ? 'Custom Dimensions' : activeSizePreset.label;

  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <div className="grain-layer" />

      <div className="scene-container">
        <SceneCanvas
          mode={modelMode}
          dimensions={dimensions}
          parameters={parameters}
          materialPreset={materialPreset}
          texturePreset={texturePreset}
        />
      </div>

      <aside className="panel-wrap">
        <section className="glass-card hero-card panel-header">
          <p className="eyebrow">Pergola Studio 3D</p>
          <h1>Configurator</h1>
          <p>Interactive GLB + mathematical pergola editor with live engineering feedback.</p>
          <div className="summary-pills">
            <span className="summary-pill">{modelMode === 'sample' ? 'Sample Model' : 'Math Model'}</span>
            <span className="summary-pill">{activeSizeLabel}</span>
            <span className="summary-pill">{materialPreset.label}</span>
            <span className="summary-pill">{TEXTURE_LABELS[texturePreset]}</span>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 1</span>
            <h2 className="section-title">Model & Dimensions</h2>
          </div>

          <div className="segmented">
            <button
              type="button"
              className={modelMode === 'sample' ? 'active' : ''}
              onClick={() => setModelMode('sample')}
            >
              Sample GLB
            </button>
            <button
              type="button"
              className={modelMode === 'parametric' ? 'active' : ''}
              onClick={() => setModelMode('parametric')}
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
                  sizeId === preset.id && !usesCustomSize
                    ? 'active size-option'
                    : 'size-option'
                }
                onClick={() => applyPreset(preset.id)}
              >
                <strong>{preset.label.split(' ')[0]}</strong>
                <small>
                  {preset.width}m x {preset.depth}m x {preset.height}m
                </small>
              </button>
            ))}
          </div>

          <div className="range-stack">
            <RangeControl
              label="Width"
              value={dimensions.width}
              min={DIMENSION_LIMITS.width[0]}
              max={DIMENSION_LIMITS.width[1]}
              step={0.05}
              onChange={(value) => setDimension('width', value)}
            />
            <RangeControl
              label="Depth"
              value={dimensions.depth}
              min={DIMENSION_LIMITS.depth[0]}
              max={DIMENSION_LIMITS.depth[1]}
              step={0.05}
              onChange={(value) => setDimension('depth', value)}
            />
            <RangeControl
              label="Height"
              value={dimensions.height}
              min={DIMENSION_LIMITS.height[0]}
              max={DIMENSION_LIMITS.height[1]}
              step={0.05}
              onChange={(value) => setDimension('height', value)}
            />
          </div>

          <div className="inline-actions">
            <button type="button" className="ghost" onClick={() => applyPreset(sizeId)}>
              Reapply Selected Preset
            </button>
            {usesCustomSize && <span className="tag">Using custom dimensions</span>}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 2</span>
            <h2 className="section-title">Materials</h2>
          </div>

          <h3>Frame Material</h3>
          <div className="color-grid">
            {MATERIAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`color-chip ${materialId === preset.id ? 'active' : ''}`}
                onClick={() => setMaterialId(preset.id)}
              >
                <span style={{ background: preset.swatch }} />
                {preset.label}
              </button>
            ))}
          </div>

          <h3>Texture Style</h3>
          <div className="texture-grid">
            {(Object.keys(TEXTURE_LABELS) as TexturePreset[]).map((texture) => (
              <button
                key={texture}
                type="button"
                className={texturePreset === texture ? 'active' : ''}
                onClick={() => setTexturePreset(texture)}
              >
                {TEXTURE_LABELS[texture]}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 3</span>
            <h2 className="section-title">Mathematical Structure</h2>
          </div>

          <p className="hint">Live formula: {MODEL_FORMULA}</p>
          <p className="hint">
            Physics model uses roof load + deflection and stress checks to auto-size beams and add bays/posts.
          </p>
          {modelMode !== 'parametric' && (
            <p className="mode-note">Switch to Mathematical mode to edit structural variables live.</p>
          )}

          <div className="range-stack">
            <RangeControl
              label="Min Post Width"
              value={parameters.postThickness}
              min={0.1}
              max={0.24}
              step={0.005}
              onChange={(value) => setParameter('postThickness', value)}
              disabled={modelMode !== 'parametric'}
            />
            <RangeControl
              label="Min Beam Width"
              value={parameters.beamThickness}
              min={0.08}
              max={0.22}
              step={0.005}
              onChange={(value) => setParameter('beamThickness', value)}
              disabled={modelMode !== 'parametric'}
            />
            <RangeControl
              label="Slat Thickness"
              value={parameters.slatThickness}
              min={0.02}
              max={0.08}
              step={0.0025}
              onChange={(value) => setParameter('slatThickness', value)}
              disabled={modelMode !== 'parametric'}
            />
            <RangeControl
              label="Slat Spacing"
              value={parameters.slatSpacing}
              min={0.12}
              max={0.4}
              step={0.01}
              onChange={(value) => setParameter('slatSpacing', value)}
              disabled={modelMode !== 'parametric'}
            />
          </div>

          <button type="button" className="ghost" onClick={() => setParameters(DEFAULT_PARAMETERS)}>
            Reset Structural Parameters
          </button>
        </section>

        <section className="glass-card metrics-card">
          <div className="section-head">
            <span className="section-kicker">Step 4</span>
            <h2 className="section-title">Engineering Metrics</h2>
          </div>

          <div className="metrics-grid">
            <div className="metric-highlight">
              <span>Dimensions</span>
              <strong>
                {fmtMeters(dimensions.width)} x {fmtMeters(dimensions.depth)} x {fmtMeters(dimensions.height)}
              </strong>
            </div>
            <div>
              <span>Footprint</span>
              <strong>{fmtArea(model.metrics.footprintM2)}</strong>
            </div>
            <div>
              <span>Perimeter</span>
              <strong>{fmtMeters(model.metrics.perimeterM)}</strong>
            </div>
            <div>
              <span>Clear Height</span>
              <strong>{fmtMeters(model.metrics.clearHeightM)}</strong>
            </div>
            <div>
              <span>Slat Count</span>
              <strong>{model.metrics.slatCount}</strong>
            </div>
            <div>
              <span>Post Count</span>
              <strong>{model.metrics.postCount}</strong>
            </div>
            <div>
              <span>Bays</span>
              <strong>
                {model.metrics.bayCountX} x {model.metrics.bayCountZ}
              </strong>
            </div>
            <div>
              <span>Beam Section</span>
              <strong>{fmtSectionMm(model.metrics.beamWidthM, model.metrics.beamDepthM)}</strong>
            </div>
            <div>
              <span>Post Section</span>
              <strong>{Math.round(model.metrics.postThicknessM * 1000)} mm</strong>
            </div>
            <div>
              <span>Sections</span>
              <strong>{model.metrics.sectionCount}</strong>
            </div>
            <div>
              <span>Max Clear Span</span>
              <strong>{fmtMeters(model.metrics.maxClearSpanM)}</strong>
            </div>
            <div>
              <span>Shade Coverage</span>
              <strong>{model.metrics.shadeCoveragePct.toFixed(1)}%</strong>
            </div>
            <div>
              <span>Load / Utilization</span>
              <strong>
                {model.metrics.designLoadKPa.toFixed(2)} kPa / {model.metrics.structuralUtilizationPct.toFixed(0)}%
              </strong>
            </div>
            <div>
              <span>Frame Volume</span>
              <strong>{fmtVolume(model.metrics.frameVolumeM3)}</strong>
            </div>
            <div>
              <span>Estimated Weight</span>
              <strong>{fmtWeight(model.metrics.estimatedWeightKg)}</strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
