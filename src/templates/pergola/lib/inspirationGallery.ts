import { DEFAULT_PARAMETERS, type MaterialPresetId, type SizePresetId, type TexturePreset } from './pergolaMath';
import type { PergolaSpec } from './pergolaSpec';

/**
 * Curated inspiration presets that showcase different pergola styles.
 * Each one is a complete PergolaSpec ready to load.
 */
export interface InspirationItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  spec: PergolaSpec;
}

const makeSpec = (
  overrides: Partial<PergolaSpec> & {
    sizeId: SizePresetId;
    materialId: MaterialPresetId;
    texturePreset: TexturePreset;
    width: number;
    depth: number;
    height: number;
  },
): PergolaSpec => ({
  version: 1,
  modelMode: overrides.modelMode ?? 'parametric',
  sizeId: overrides.sizeId,
  usesCustomSize: true,
  dimensions: { width: overrides.width, depth: overrides.depth, height: overrides.height },
  materialId: overrides.materialId,
  texturePreset: overrides.texturePreset,
  parameters: overrides.parameters ?? { ...DEFAULT_PARAMETERS },
  loadScenarioId: overrides.loadScenarioId ?? 'standard',
});

export const INSPIRATION_GALLERY: InspirationItem[] = [
  {
    id: 'modern-minimal',
    title: 'Modern Minimalist',
    description: 'Clean graphite frame with solid finish — perfect for contemporary patios.',
    tags: ['Modern', 'Small'],
    spec: makeSpec({
      sizeId: 'urban',
      materialId: 'graphite_matte',
      texturePreset: 'none',
      width: 3.5,
      depth: 4,
      height: 2.6,
    }),
  },
  {
    id: 'rustic-retreat',
    title: 'Rustic Retreat',
    description: 'Warm walnut wood with natural oak texture for a countryside feel.',
    tags: ['Rustic', 'Wood'],
    spec: makeSpec({
      sizeId: 'family',
      materialId: 'walnut_wood',
      texturePreset: 'oak',
      width: 4.5,
      depth: 4.5,
      height: 2.8,
    }),
  },
  {
    id: 'grand-entertainer',
    title: 'Grand Entertainer',
    description: 'Spacious champagne alloy pavilion sized for outdoor dining and events.',
    tags: ['Large', 'Premium'],
    spec: makeSpec({
      sizeId: 'pavilion',
      materialId: 'champagne_alloy',
      texturePreset: 'brushed',
      width: 6,
      depth: 8,
      height: 3,
      loadScenarioId: 'standard',
    }),
  },
  {
    id: 'industrial-loft',
    title: 'Industrial Loft',
    description: 'Carbon steel with slate composite — an urban rooftop statement.',
    tags: ['Industrial', 'Urban'],
    spec: makeSpec({
      sizeId: 'compact',
      materialId: 'carbon_steel',
      texturePreset: 'slate',
      width: 3,
      depth: 3,
      height: 2.5,
    }),
  },
  {
    id: 'alpine-shelter',
    title: 'Alpine Snow Shelter',
    description: 'Heavy-duty graphite frame rated for alpine snow loads with thicker beams.',
    tags: ['Heavy-duty', 'Snow'],
    spec: makeSpec({
      sizeId: 'grand',
      materialId: 'graphite_matte',
      texturePreset: 'brushed',
      width: 4.5,
      depth: 6,
      height: 2.85,
      loadScenarioId: 'alpine',
      parameters: { ...DEFAULT_PARAMETERS, beamThickness: 0.16, postThickness: 0.16 },
    }),
  },
  {
    id: 'coastal-breeze',
    title: 'Coastal Breeze',
    description: 'Ivory satin finish designed for seaside wind exposure.',
    tags: ['Coastal', 'Elegant'],
    spec: makeSpec({
      sizeId: 'family',
      materialId: 'ivory_satin',
      texturePreset: 'none',
      width: 4,
      depth: 5,
      height: 2.7,
      loadScenarioId: 'coastal',
    }),
  },
];
