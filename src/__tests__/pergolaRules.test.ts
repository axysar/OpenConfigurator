import { describe, expect, it } from 'vitest';
import { evaluateRules, applyRuleResults } from '@core/rulesEngine';
import { PERGOLA_RULES } from '@templates/pergola/lib/pergolaRules';
import { DEFAULT_PERGOLA_SPEC } from '@templates/pergola/lib/pergolaSpec';

describe('pergola-specific rules', () => {
  it('forces oak texture when walnut + brushed are combined', () => {
    const spec = {
      ...DEFAULT_PERGOLA_SPEC,
      materialId: 'walnut_wood',
      texturePreset: 'brushed',
    };

    const result = evaluateRules(PERGOLA_RULES, spec as unknown as Record<string, unknown>);
    expect(result.forcedValues.get('texturePreset')).toBe('oak');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('forces brushed texture when carbon steel + oak are combined', () => {
    const spec = {
      ...DEFAULT_PERGOLA_SPEC,
      materialId: 'carbon_steel',
      texturePreset: 'oak',
    };

    const result = evaluateRules(PERGOLA_RULES, spec as unknown as Record<string, unknown>);
    expect(result.forcedValues.get('texturePreset')).toBe('brushed');
  });

  it('forces parametric mode for widths above 7m', () => {
    const spec = {
      ...DEFAULT_PERGOLA_SPEC,
      dimensions: { ...DEFAULT_PERGOLA_SPEC.dimensions, width: 7.5 },
      modelMode: 'sample' as const,
    };

    const result = evaluateRules(PERGOLA_RULES, spec as unknown as Record<string, unknown>);
    expect(result.forcedValues.get('modelMode')).toBe('parametric');
  });

  it('clamps beam thickness for heavy snow', () => {
    const spec = {
      ...DEFAULT_PERGOLA_SPEC,
      loadScenarioId: 'heavy_snow',
      parameters: { ...DEFAULT_PERGOLA_SPEC.parameters, beamThickness: 0.08 },
    };

    const result = evaluateRules(PERGOLA_RULES, spec as unknown as Record<string, unknown>);
    const patched = applyRuleResults(
      spec as unknown as Record<string, unknown>,
      result,
    ) as typeof spec;
    expect(patched.parameters.beamThickness).toBeGreaterThanOrEqual(0.12);
  });

  it('no rules fire for default spec', () => {
    const result = evaluateRules(
      PERGOLA_RULES,
      DEFAULT_PERGOLA_SPEC as unknown as Record<string, unknown>,
    );
    expect(result.warnings).toHaveLength(0);
    expect(result.forcedValues.size).toBe(0);
  });
});
