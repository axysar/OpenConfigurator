import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMETERS,
  buildPergolaModel,
  getMaterialPreset,
} from '@templates/pergola/lib/pergolaMath';
import { buildPergolaQuote } from '@templates/pergola/lib/pricing';
import { buildPergolaBom } from '@templates/pergola/lib/bom';

describe('pergola pricing & BOM', () => {
  const material = getMaterialPreset('graphite_matte');
  const model = buildPergolaModel(
    { width: 4, depth: 5, height: 2.7 },
    DEFAULT_PARAMETERS,
    material,
  );

  it('builds a positive quote with all expected lines', () => {
    const quote = buildPergolaQuote(model.metrics, material, {
      texturePresetId: 'none',
      loadFactor: 1,
    });

    expect(quote.lines.map((line) => line.id)).toEqual([
      'frame',
      'labor',
      'finish',
      'engineering',
      'delivery',
    ]);
    expect(quote.subtotal).toBeGreaterThan(0);
    expect(quote.total).toBeGreaterThanOrEqual(quote.subtotal);
  });

  it('charges more when texture or higher load factor are applied', () => {
    const baseline = buildPergolaQuote(model.metrics, material, {
      texturePresetId: 'none',
      loadFactor: 1,
    });
    const upgraded = buildPergolaQuote(model.metrics, material, {
      texturePresetId: 'oak',
      loadFactor: 1.35,
    });

    expect(upgraded.total).toBeGreaterThan(baseline.total);
  });

  it('groups parts into a stable BOM', () => {
    const rows = buildPergolaBom(model);
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.count).toBeGreaterThan(0);
      expect(row.totalLengthM).toBeGreaterThan(0);
      expect(row.section).toMatch(/mm/);
    });
  });
});
