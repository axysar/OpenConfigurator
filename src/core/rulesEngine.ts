/**
 * A lightweight, JSON-friendly rules engine for product configurators.
 *
 * Rules express constraints ("if material is walnut_wood, texture must
 * not be brushed") and auto-actions ("if width > 6, force parametric mode").
 * They can be defined per-template and evaluated against the current spec.
 *
 * This keeps the pergola template (and future templates) free from
 * scattered if-else logic, and lets non-developers author rules via JSON.
 */

export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in';

export interface RuleCondition {
  field: string;
  operator: Operator;
  value: unknown;
}

export type RuleAction =
  | { type: 'disable'; field: string }
  | { type: 'force'; field: string; value: unknown }
  | { type: 'warn'; message: string }
  | { type: 'clamp'; field: string; min: number; max: number };

export interface ConfigRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleEvalResult {
  disabledFields: Set<string>;
  forcedValues: Map<string, unknown>;
  warnings: string[];
  clamps: Map<string, { min: number; max: number }>;
}

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

const testCondition = (condition: RuleCondition, spec: Record<string, unknown>): boolean => {
  const actual = getNestedValue(spec, condition.field);
  const expected = condition.value;
  switch (condition.operator) {
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'gt':
      return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'gte':
      return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case 'lt':
      return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'lte':
      return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual);
    default:
      return false;
  }
};

export const evaluateRules = (
  rules: ConfigRule[],
  spec: Record<string, unknown>,
): RuleEvalResult => {
  const disabledFields = new Set<string>();
  const forcedValues = new Map<string, unknown>();
  const warnings: string[] = [];
  const clamps = new Map<string, { min: number; max: number }>();

  for (const rule of rules) {
    const allMatch = rule.conditions.every((condition) => testCondition(condition, spec));
    if (!allMatch) continue;

    for (const action of rule.actions) {
      switch (action.type) {
        case 'disable':
          disabledFields.add(action.field);
          break;
        case 'force':
          forcedValues.set(action.field, action.value);
          break;
        case 'warn':
          warnings.push(action.message);
          break;
        case 'clamp':
          clamps.set(action.field, { min: action.min, max: action.max });
          break;
      }
    }
  }

  return { disabledFields, forcedValues, warnings, clamps };
};

/**
 * Apply forced values and clamps from a rules evaluation back into a spec.
 * Returns a new object if anything changed, or the original if untouched.
 */
export const applyRuleResults = <T extends Record<string, unknown>>(
  spec: T,
  result: RuleEvalResult,
): T => {
  if (result.forcedValues.size === 0 && result.clamps.size === 0) return spec;

  const clone = JSON.parse(JSON.stringify(spec)) as Record<string, unknown>;

  for (const [path, value] of result.forcedValues) {
    setNestedValue(clone, path, value);
  }

  for (const [path, { min, max }] of result.clamps) {
    const current = getNestedValue(clone, path);
    if (typeof current === 'number') {
      const clamped = Math.min(Math.max(current, min), max);
      if (clamped !== current) setNestedValue(clone, path, clamped);
    }
  }

  return clone as T;
};

const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
};
