import type { ConfigRule } from '@core/rulesEngine';

/**
 * Pergola configuration rules — enforced by the generic rules engine.
 *
 * These prevent invalid combinations (e.g. brushed metal texture on
 * walnut wood) and auto-tune parameters for large/heavy structures.
 */
export const PERGOLA_RULES: ConfigRule[] = [
  {
    id: 'wood-no-brushed',
    name: 'Walnut wood cannot use brushed metal texture',
    conditions: [
      { field: 'materialId', operator: 'eq', value: 'walnut_wood' },
      { field: 'texturePreset', operator: 'eq', value: 'brushed' },
    ],
    actions: [
      { type: 'force', field: 'texturePreset', value: 'oak' },
      { type: 'warn', message: 'Brushed metal texture is not available for walnut wood. Switched to Natural Oak.' },
    ],
  },
  {
    id: 'wood-no-slate',
    name: 'Walnut wood cannot use slate composite texture',
    conditions: [
      { field: 'materialId', operator: 'eq', value: 'walnut_wood' },
      { field: 'texturePreset', operator: 'eq', value: 'slate' },
    ],
    actions: [
      { type: 'force', field: 'texturePreset', value: 'oak' },
      { type: 'warn', message: 'Slate composite texture is not available for walnut wood. Switched to Natural Oak.' },
    ],
  },
  {
    id: 'large-must-parametric',
    name: 'Large footprints force mathematical mode for accuracy',
    conditions: [
      { field: 'dimensions.width', operator: 'gt', value: 7 },
    ],
    actions: [
      { type: 'force', field: 'modelMode', value: 'parametric' },
      { type: 'warn', message: 'Width exceeds 7 m — switched to mathematical mode for accurate structural sizing.' },
    ],
  },
  {
    id: 'heavy-snow-min-beam',
    name: 'Heavy snow scenario enforces thicker minimum beam',
    conditions: [
      { field: 'loadScenarioId', operator: 'eq', value: 'heavy_snow' },
    ],
    actions: [
      { type: 'clamp', field: 'parameters.beamThickness', min: 0.12, max: 0.22 },
      { type: 'clamp', field: 'parameters.postThickness', min: 0.14, max: 0.24 },
    ],
  },
  {
    id: 'coastal-post-safety',
    name: 'Coastal wind scenario enforces sturdier posts',
    conditions: [
      { field: 'loadScenarioId', operator: 'eq', value: 'coastal' },
    ],
    actions: [
      { type: 'clamp', field: 'parameters.postThickness', min: 0.14, max: 0.24 },
    ],
  },
  {
    id: 'compact-no-pavilion-slat-spacing',
    name: 'Compact sizes should use tighter slat spacing',
    conditions: [
      { field: 'sizeId', operator: 'eq', value: 'compact' },
      { field: 'parameters.slatSpacing', operator: 'gt', value: 0.3 },
    ],
    actions: [
      { type: 'clamp', field: 'parameters.slatSpacing', min: 0.12, max: 0.3 },
      { type: 'warn', message: 'Slat spacing clamped for compact size to maintain shade coverage.' },
    ],
  },
  {
    id: 'steel-disable-oak-texture',
    name: 'Carbon steel cannot use oak texture',
    conditions: [
      { field: 'materialId', operator: 'eq', value: 'carbon_steel' },
      { field: 'texturePreset', operator: 'eq', value: 'oak' },
    ],
    actions: [
      { type: 'force', field: 'texturePreset', value: 'brushed' },
      { type: 'warn', message: 'Oak texture is not available for carbon steel. Switched to Brushed Metal.' },
    ],
  },
];
