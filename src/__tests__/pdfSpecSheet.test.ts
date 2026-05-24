import { describe, expect, it } from 'vitest';
import { generateSpecSheetHtml } from '@templates/pergola/lib/pdfSpecSheet';
import { DEFAULT_PERGOLA_SPEC } from '@templates/pergola/lib/pergolaSpec';
import { buildPergolaModel, getMaterialPreset } from '@templates/pergola/lib/pergolaMath';
import { buildPergolaQuote } from '@templates/pergola/lib/pricing';
import { buildPergolaBom } from '@templates/pergola/lib/bom';

describe('PDF spec sheet generator', () => {
  it('generates valid HTML with all sections', () => {
    const spec = DEFAULT_PERGOLA_SPEC;
    const mat = getMaterialPreset(spec.materialId);
    const model = buildPergolaModel(spec.dimensions, spec.parameters, mat);
    const quote = buildPergolaQuote(model.metrics, mat, { texturePresetId: spec.texturePreset, loadFactor: 1 });
    const bom = buildPergolaBom(model);

    const html = generateSpecSheetHtml({
      spec,
      metrics: model.metrics,
      quote,
      bom,
      materialLabel: mat.label,
      loadScenarioLabel: 'Standard',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Pergola Specification Sheet');
    expect(html).toContain('Engineering Metrics');
    expect(html).toContain('Bill of Materials');
    expect(html).toContain('Estimated Investment');
    expect(html).toContain(mat.label);
    expect(html).toContain('window.print()');
  });

  it('includes screenshot when provided', () => {
    const spec = DEFAULT_PERGOLA_SPEC;
    const mat = getMaterialPreset(spec.materialId);
    const model = buildPergolaModel(spec.dimensions, spec.parameters, mat);
    const quote = buildPergolaQuote(model.metrics, mat, { texturePresetId: 'none', loadFactor: 1 });
    const bom = buildPergolaBom(model);

    const html = generateSpecSheetHtml({
      spec,
      metrics: model.metrics,
      quote,
      bom,
      materialLabel: mat.label,
      loadScenarioLabel: 'Standard',
      screenshotDataUrl: 'data:image/png;base64,FAKE',
    });

    expect(html).toContain('data:image/png;base64,FAKE');
    expect(html).toContain('screenshot');
  });
});
