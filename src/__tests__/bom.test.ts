import { describe, expect, it } from 'vitest';
import { buildPergolaBom, bomToCsv } from '@templates/pergola/lib/bom';
import { buildPergolaModel, DEFAULT_PARAMETERS, getMaterialPreset } from '@templates/pergola/lib/pergolaMath';

describe('bill of materials', () => {
  const material = getMaterialPreset('graphite_matte');

  it('groups identical parts by section and length', () => {
    const model = buildPergolaModel(
      { width: 3, depth: 3, height: 2.5 },
      DEFAULT_PARAMETERS,
      material,
    );
    const bom = buildPergolaBom(model);

    const postRows = bom.filter((r) => r.category === 'Post');
    expect(postRows.length).toBeGreaterThan(0);
    const totalPostCount = postRows.reduce((acc, r) => acc + r.count, 0);
    expect(totalPostCount).toBe(model.posts.length);
  });

  it('produces valid CSV output', () => {
    const model = buildPergolaModel(
      { width: 4, depth: 5, height: 2.7 },
      DEFAULT_PARAMETERS,
      material,
    );
    const bom = buildPergolaBom(model);
    const csv = bomToCsv(bom);

    expect(csv.startsWith('Category,Section,Count,Length (m),Total Length (m)')).toBe(true);
    expect(csv.split('\n').length).toBeGreaterThan(2);
    expect(csv).toContain('Post');
    expect(csv).toContain('Beam');
    expect(csv).toContain('Slat');
  });

  it('handles large configurations without duplicating rows', () => {
    const model = buildPergolaModel(
      { width: 8, depth: 9, height: 3 },
      DEFAULT_PARAMETERS,
      material,
    );
    const bom = buildPergolaBom(model);

    const totalParts = model.posts.length + model.beams.length + model.slats.length;
    const bomTotal = bom.reduce((acc, r) => acc + r.count, 0);
    expect(bomTotal).toBe(totalParts);
  });
});
