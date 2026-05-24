import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PERGOLA_SPEC,
  decodeSpecFromHash,
  encodeSpecToHash,
  sanitizePergolaSpec,
} from '@templates/pergola/lib/pergolaSpec';

describe('pergola spec serialization', () => {
  it('encodes and decodes a spec losslessly', () => {
    const spec = {
      ...DEFAULT_PERGOLA_SPEC,
      sizeId: 'pavilion' as const,
      usesCustomSize: true,
      dimensions: { width: 5.25, depth: 6.75, height: 2.95 },
      materialId: 'walnut_wood' as const,
      texturePreset: 'oak' as const,
      loadScenarioId: 'alpine',
    };

    const hash = encodeSpecToHash(spec);
    expect(hash.startsWith('#cfg=')).toBe(true);

    const roundTripped = decodeSpecFromHash(hash);
    expect(roundTripped).not.toBeNull();
    expect(roundTripped?.sizeId).toBe('pavilion');
    expect(roundTripped?.usesCustomSize).toBe(true);
    expect(roundTripped?.dimensions.width).toBeCloseTo(5.25);
    expect(roundTripped?.materialId).toBe('walnut_wood');
    expect(roundTripped?.loadScenarioId).toBe('alpine');
  });

  it('returns null for an invalid hash', () => {
    expect(decodeSpecFromHash('#nope=abc')).toBeNull();
    expect(decodeSpecFromHash('')).toBeNull();
  });

  it('sanitizes garbage input back into a usable spec', () => {
    const result = sanitizePergolaSpec({
      sizeId: 'not-a-real-id',
      materialId: 42,
      dimensions: { width: 'broken', depth: NaN, height: 3.1 },
    });

    expect(result.sizeId).toBe(DEFAULT_PERGOLA_SPEC.sizeId);
    expect(result.materialId).toBe(DEFAULT_PERGOLA_SPEC.materialId);
    expect(result.dimensions.width).toBe(DEFAULT_PERGOLA_SPEC.dimensions.width);
    expect(result.dimensions.depth).toBe(DEFAULT_PERGOLA_SPEC.dimensions.depth);
    expect(result.dimensions.height).toBeCloseTo(3.1);
  });
});
