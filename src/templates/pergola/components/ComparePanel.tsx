import { useMemo } from 'react';
import { fmtArea, fmtCurrency, fmtMeters, fmtWeight } from '@shared/index';
import { buildPergolaModel, getMaterialPreset } from '../lib/pergolaMath';
import { getLoadScenario } from '../lib/loadScenarios';
import { buildPergolaQuote } from '../lib/pricing';
import type { PergolaSpec } from '../lib/pergolaSpec';
import type { SavedConfig } from '../lib/persistence';

interface ComparePanelProps {
  currentSpec: PergolaSpec;
  compareTarget: SavedConfig | null;
  onClose: () => void;
}

const SpecColumn = ({ spec, label }: { spec: PergolaSpec; label: string }): JSX.Element => {
  const mat = useMemo(() => getMaterialPreset(spec.materialId), [spec.materialId]);
  const scenario = useMemo(() => getLoadScenario(spec.loadScenarioId), [spec.loadScenarioId]);
  const model = useMemo(
    () => buildPergolaModel(spec.dimensions, spec.parameters, mat, {
      roofLoadKPa: scenario.roofLoadKPa,
      lateralFactor: scenario.lateralFactor,
    }),
    [spec, mat, scenario],
  );
  const quote = useMemo(
    () => buildPergolaQuote(model.metrics, mat, { texturePresetId: spec.texturePreset, loadFactor: scenario.lateralFactor }),
    [model.metrics, mat, spec.texturePreset, scenario.lateralFactor],
  );

  return (
    <div className="compare-column">
      <strong className="compare-label">{label}</strong>
      <div className="compare-rows">
        <div><span className="metric-label">Dimensions</span><strong>{fmtMeters(spec.dimensions.width)} × {fmtMeters(spec.dimensions.depth)}</strong></div>
        <div><span className="metric-label">Height</span><strong>{fmtMeters(spec.dimensions.height)}</strong></div>
        <div><span className="metric-label">Material</span><strong>{mat.label}</strong></div>
        <div><span className="metric-label">Load</span><strong>{scenario.label}</strong></div>
        <div><span className="metric-label">Footprint</span><strong>{fmtArea(model.metrics.footprintM2)}</strong></div>
        <div><span className="metric-label">Posts</span><strong>{model.metrics.postCount}</strong></div>
        <div><span className="metric-label">Bays</span><strong>{model.metrics.bayCountX}×{model.metrics.bayCountZ}</strong></div>
        <div><span className="metric-label">Weight</span><strong>{fmtWeight(model.metrics.estimatedWeightKg)}</strong></div>
        <div><span className="metric-label">Utilization</span><strong>{model.metrics.structuralUtilizationPct.toFixed(0)}%</strong></div>
        <div><span className="metric-label">Total Price</span><strong>{fmtCurrency(quote.total)}</strong></div>
      </div>
    </div>
  );
};

export const ComparePanel = ({
  currentSpec,
  compareTarget,
  onClose,
}: ComparePanelProps): JSX.Element | null => {
  if (!compareTarget) return null;

  return (
    <div className="compare-overlay" role="dialog" aria-label="Compare configurations">
      <div className="compare-card glass-card">
        <div className="compare-header">
          <h2 className="section-title">Compare Configurations</h2>
          <button type="button" className="oc-icon-btn" onClick={onClose}>✕ Close</button>
        </div>
        <div className="compare-body">
          <SpecColumn spec={currentSpec} label="Current" />
          <SpecColumn spec={compareTarget.spec} label={compareTarget.name} />
        </div>
      </div>
    </div>
  );
};
