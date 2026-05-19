import { useMemo, useState } from 'react';
import { fmtCurrency, fmtMeters, fmtArea, clamp } from '@shared/index';
import {
  CABINET_STYLES,
  CABINET_FINISHES,
  COUNTERTOP_MATERIALS,
  DEFAULT_KITCHEN_SPEC,
  buildKitchenModel,
  type KitchenSpec,
} from './lib/kitchenMath';

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

const Range = ({ label, value, min, max, step, onChange }: RangeProps): JSX.Element => (
  <label className="range-control">
    <div className="range-head">
      <span>{label}</span>
      <strong>{value.toFixed(2)} m</strong>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
    />
  </label>
);

export default function KitchenTemplate(): JSX.Element {
  const [spec, setSpec] = useState<KitchenSpec>(DEFAULT_KITCHEN_SPEC);

  const model = useMemo(() => buildKitchenModel(spec), [spec]);

  const update = <K extends keyof KitchenSpec>(field: K, value: KitchenSpec[K]) => {
    setSpec((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <div className="grain-layer" />

      <div className="scene-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Kitchen 3D Preview</h2>
          <p>{model.metrics.totalUnits} cabinets • {fmtMeters(model.metrics.linearMeters)} run</p>
          <p style={{ fontSize: '0.74rem', marginTop: 8 }}>
            3D scene uses the same InstancedMesh renderer — add a SceneCanvas when ready.
          </p>
        </div>
      </div>

      <aside className="panel-wrap">
        <section className="glass-card hero-card panel-header">
          <p className="eyebrow">Kitchen Studio</p>
          <h1>Cabinet Configurator</h1>
          <p>Configure your kitchen layout with real-time pricing and cabinet counts.</p>
          <div className="summary-pills">
            <span className="summary-pill">{model.metrics.baseUnits} base + {model.metrics.wallUnits} wall</span>
            <span className="summary-pill">{CABINET_FINISHES.find((f) => f.id === spec.finish)?.label}</span>
            <span className="summary-pill">{COUNTERTOP_MATERIALS.find((c) => c.id === spec.countertop)?.label}</span>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 1</span>
            <h2 className="section-title">Dimensions</h2>
          </div>
          <div className="range-stack">
            <Range label="Wall Length" value={spec.wallLength} min={1.2} max={8} step={0.1} onChange={(v) => update('wallLength', clamp(v, 1.2, 8))} />
            <Range label="Cabinet Depth" value={spec.cabinetDepth} min={0.45} max={0.75} step={0.05} onChange={(v) => update('cabinetDepth', v)} />
            <Range label="Counter Height" value={spec.counterHeight} min={0.8} max={1.0} step={0.02} onChange={(v) => update('counterHeight', v)} />
            <Range label="Unit Width" value={spec.unitWidth} min={0.3} max={0.9} step={0.05} onChange={(v) => update('unitWidth', v)} />
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 2</span>
            <h2 className="section-title">Style & Finish</h2>
          </div>
          <h3>Door Style</h3>
          <div className="segmented" style={{ gridTemplateColumns: `repeat(${CABINET_STYLES.length}, 1fr)` }}>
            {CABINET_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={spec.style === s.id ? 'active' : ''}
                onClick={() => update('style', s.id)}
                aria-pressed={spec.style === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
          <h3>Cabinet Finish</h3>
          <div className="color-grid">
            {CABINET_FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`color-chip ${spec.finish === f.id ? 'active' : ''}`}
                onClick={() => update('finish', f.id)}
                aria-pressed={spec.finish === f.id}
              >
                <span style={{ background: f.swatch }} aria-hidden />
                {f.label}
              </button>
            ))}
          </div>
          <h3>Countertop</h3>
          <div className="color-grid">
            {COUNTERTOP_MATERIALS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-chip ${spec.countertop === c.id ? 'active' : ''}`}
                onClick={() => update('countertop', c.id)}
                aria-pressed={spec.countertop === c.id}
              >
                <span style={{ background: c.color }} aria-hidden />
                {c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-kicker">Step 3</span>
            <h2 className="section-title">Summary & Pricing</h2>
          </div>
          <div className="metrics-grid">
            <div><span className="metric-label">Base Cabinets</span><strong>{model.metrics.baseUnits}</strong></div>
            <div><span className="metric-label">Wall Cabinets</span><strong>{model.metrics.wallUnits}</strong></div>
            <div><span className="metric-label">Linear Run</span><strong>{fmtMeters(model.metrics.linearMeters)}</strong></div>
            <div><span className="metric-label">Counter Area</span><strong>{fmtArea(model.metrics.counterAreaM2)}</strong></div>
          </div>
          <div className="quote-total" style={{ marginTop: 12 }}>
            <span>Estimated Total</span>
            <strong>{fmtCurrency(model.metrics.estimatedCost)}</strong>
          </div>
        </section>
      </aside>
    </div>
  );
}
