import { describe, expect, it } from 'vitest';
import { INSPIRATION_GALLERY } from '@templates/pergola/lib/inspirationGallery';
import { sanitizePergolaSpec } from '@templates/pergola/lib/pergolaSpec';
import { buildPergolaModel, getMaterialPreset } from '@templates/pergola/lib/pergolaMath';

describe('inspiration gallery', () => {
  it('contains at least 5 curated items', () => {
    expect(INSPIRATION_GALLERY.length).toBeGreaterThanOrEqual(5);
  });

  it('all items have valid specs that build successfully', () => {
    for (const item of INSPIRATION_GALLERY) {
      const sanitized = sanitizePergolaSpec(item.spec);
      const mat = getMaterialPreset(sanitized.materialId);
      const model = buildPergolaModel(sanitized.dimensions, sanitized.parameters, mat);

      expect(model.metrics.footprintM2).toBeGreaterThan(0);
      expect(model.metrics.postCount).toBeGreaterThanOrEqual(4);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.tags.length).toBeGreaterThan(0);
    }
  });

  it('each item has a unique id', () => {
    const ids = INSPIRATION_GALLERY.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
