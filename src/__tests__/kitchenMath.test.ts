import { describe, expect, it } from 'vitest';
import {
  DEFAULT_KITCHEN_SPEC,
  buildKitchenModel,
  CABINET_STYLES,
  CABINET_FINISHES,
  COUNTERTOP_MATERIALS,
} from '@templates/kitchen/lib/kitchenMath';

describe('kitchen cabinet configurator', () => {
  it('generates correct unit counts for default spec', () => {
    const model = buildKitchenModel(DEFAULT_KITCHEN_SPEC);
    expect(model.metrics.baseUnits).toBe(6); // 3.6m / 0.6m = 6
    expect(model.metrics.wallUnits).toBe(6);
    expect(model.metrics.totalUnits).toBe(12);
    expect(model.units.length).toBe(12);
    expect(model.countertop).not.toBeNull();
  });

  it('adjusts unit count when wall length changes', () => {
    const small = buildKitchenModel({ ...DEFAULT_KITCHEN_SPEC, wallLength: 1.8 });
    const large = buildKitchenModel({ ...DEFAULT_KITCHEN_SPEC, wallLength: 6 });
    expect(large.metrics.baseUnits).toBeGreaterThan(small.metrics.baseUnits);
  });

  it('prices vary by finish and countertop material', () => {
    const base = buildKitchenModel({ ...DEFAULT_KITCHEN_SPEC, finish: 'white', countertop: 'laminate' });
    const premium = buildKitchenModel({ ...DEFAULT_KITCHEN_SPEC, finish: 'natural_oak', countertop: 'quartz' });
    expect(premium.metrics.estimatedCost).toBeGreaterThan(base.metrics.estimatedCost);
  });

  it('clamps extreme inputs', () => {
    const model = buildKitchenModel({
      ...DEFAULT_KITCHEN_SPEC,
      wallLength: 100,
      cabinetDepth: -1,
    });
    expect(model.metrics.linearMeters).toBeLessThanOrEqual(8);
    expect(model.units[0].size[2]).toBeGreaterThanOrEqual(0.45);
  });

  it('all catalog arrays have entries', () => {
    expect(CABINET_STYLES.length).toBeGreaterThanOrEqual(3);
    expect(CABINET_FINISHES.length).toBeGreaterThanOrEqual(4);
    expect(COUNTERTOP_MATERIALS.length).toBeGreaterThanOrEqual(3);
  });
});
