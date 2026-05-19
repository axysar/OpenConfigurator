import { describe, expect, it } from 'vitest';
import {
  evaluateRules,
  applyRuleResults,
  type ConfigRule,
} from '@core/rulesEngine';

const MOCK_RULES: ConfigRule[] = [
  {
    id: 'wood-no-brushed',
    name: 'Walnut wood cannot use brushed texture',
    conditions: [
      { field: 'materialId', operator: 'eq', value: 'walnut_wood' },
      { field: 'texturePreset', operator: 'eq', value: 'brushed' },
    ],
    actions: [
      { type: 'force', field: 'texturePreset', value: 'oak' },
      { type: 'warn', message: 'Switched to oak texture.' },
    ],
  },
  {
    id: 'heavy-snow-clamp',
    name: 'Heavy snow enforces min beam',
    conditions: [
      { field: 'loadScenarioId', operator: 'eq', value: 'heavy_snow' },
    ],
    actions: [
      { type: 'clamp', field: 'parameters.beamThickness', min: 0.12, max: 0.22 },
    ],
  },
  {
    id: 'wide-force-parametric',
    name: 'Wide structures need parametric mode',
    conditions: [
      { field: 'dimensions.width', operator: 'gt', value: 7 },
    ],
    actions: [
      { type: 'force', field: 'modelMode', value: 'parametric' },
    ],
  },
];

describe('rulesEngine', () => {
  it('fires all matching rules and collects warnings', () => {
    const spec = {
      materialId: 'walnut_wood',
      texturePreset: 'brushed',
      loadScenarioId: 'standard',
      dimensions: { width: 4 },
    };

    const result = evaluateRules(MOCK_RULES, spec);
    expect(result.warnings).toContain('Switched to oak texture.');
    expect(result.forcedValues.get('texturePreset')).toBe('oak');
    expect(result.clamps.size).toBe(0);
  });

  it('does not fire rules when conditions are unmet', () => {
    const spec = {
      materialId: 'graphite_matte',
      texturePreset: 'brushed',
      loadScenarioId: 'standard',
      dimensions: { width: 4 },
    };

    const result = evaluateRules(MOCK_RULES, spec);
    expect(result.warnings).toHaveLength(0);
    expect(result.forcedValues.size).toBe(0);
  });

  it('handles nested field paths and gt operator', () => {
    const spec = {
      materialId: 'graphite_matte',
      texturePreset: 'none',
      loadScenarioId: 'standard',
      dimensions: { width: 8 },
    };

    const result = evaluateRules(MOCK_RULES, spec);
    expect(result.forcedValues.get('modelMode')).toBe('parametric');
  });

  it('applies clamps from heavy snow rule', () => {
    const spec = {
      materialId: 'graphite_matte',
      texturePreset: 'none',
      loadScenarioId: 'heavy_snow',
      dimensions: { width: 4 },
      parameters: { beamThickness: 0.08 },
    };

    const result = evaluateRules(MOCK_RULES, spec);
    expect(result.clamps.has('parameters.beamThickness')).toBe(true);

    const patched = applyRuleResults(spec, result);
    expect(patched.parameters.beamThickness).toBeGreaterThanOrEqual(0.12);
  });

  it('applyRuleResults returns original when nothing to change', () => {
    const spec = { materialId: 'graphite_matte', texturePreset: 'none', loadScenarioId: 'standard', dimensions: { width: 4 } };
    const result = evaluateRules(MOCK_RULES, spec);
    const patched = applyRuleResults(spec, result);
    expect(patched).toBe(spec);
  });
});
