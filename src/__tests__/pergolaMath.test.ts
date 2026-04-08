import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMETERS,
  buildPergolaModel,
  getMaterialPreset,
  getSizePreset,
} from '@templates/pergola/lib/pergolaMath';

describe('buildPergolaModel', () => {
  const material = getMaterialPreset('graphite_matte');

  it('produces a positive footprint and weight for the family preset', () => {
    const preset = getSizePreset('family');
    const model = buildPergolaModel(
      { width: preset.width, depth: preset.depth, height: preset.height },
      DEFAULT_PARAMETERS,
      material,
    );

    expect(model.metrics.footprintM2).toBeGreaterThan(0);
    expect(model.metrics.estimatedWeightKg).toBeGreaterThan(0);
    expect(model.posts.length).toBeGreaterThanOrEqual(4);
    expect(model.beams.length).toBeGreaterThan(0);
    expect(model.slats.length).toBeGreaterThan(0);
  });

  it('adds bays for larger footprints', () => {
    const small = buildPergolaModel(
      { width: 3, depth: 3, height: 2.5 },
      DEFAULT_PARAMETERS,
      material,
    );
    const large = buildPergolaModel(
      { width: 8, depth: 9, height: 2.8 },
      DEFAULT_PARAMETERS,
      material,
    );

    expect(large.metrics.bayCountX * large.metrics.bayCountZ).toBeGreaterThan(
      small.metrics.bayCountX * small.metrics.bayCountZ,
    );
    expect(large.metrics.postCount).toBeGreaterThan(small.metrics.postCount);
  });

  it('respects the heavy snow scenario by raising design load', () => {
    const standard = buildPergolaModel(
      { width: 4, depth: 4, height: 2.7 },
      DEFAULT_PARAMETERS,
      material,
      { roofLoadKPa: 0.8, lateralFactor: 1 },
    );
    const heavy = buildPergolaModel(
      { width: 4, depth: 4, height: 2.7 },
      DEFAULT_PARAMETERS,
      material,
      { roofLoadKPa: 2.4, lateralFactor: 1.15 },
    );

    expect(heavy.metrics.designLoadKPa).toBeGreaterThan(standard.metrics.designLoadKPa);
    expect(heavy.metrics.beamDepthM).toBeGreaterThanOrEqual(standard.metrics.beamDepthM);
  });

  it('clamps absurd inputs into the supported envelope', () => {
    const model = buildPergolaModel(
      { width: 999, depth: -10, height: 0 },
      DEFAULT_PARAMETERS,
      material,
    );
    // dimensions get clamped: width->9, depth->2.5, height->2.2
    expect(model.metrics.footprintM2).toBeGreaterThanOrEqual(9 * 2.5 - 0.001);
    expect(model.metrics.footprintM2).toBeLessThanOrEqual(9 * 2.5 + 0.001);
  });
});
