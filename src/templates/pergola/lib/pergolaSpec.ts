import {
  DEFAULT_PARAMETERS,
  MATERIAL_PRESETS,
  SIZE_PRESETS,
  type MaterialPresetId,
  type ModelMode,
  type PergolaDimensions,
  type PergolaParameters,
  type SizePresetId,
  type TexturePreset,
} from './pergolaMath';

/**
 * A normalized snapshot of every user-controlled value in the pergola
 * configurator. The whole spec is round-trippable through JSON, the URL
 * hash, and localStorage. Anything that lives in this object is undoable.
 */
export interface PergolaSpec {
  version: number;
  modelMode: ModelMode;
  sizeId: SizePresetId;
  usesCustomSize: boolean;
  dimensions: PergolaDimensions;
  materialId: MaterialPresetId;
  texturePreset: TexturePreset;
  parameters: PergolaParameters;
  /** Loading scenario id (snow / wind / regional). */
  loadScenarioId: string;
}

export const SPEC_VERSION = 1;

const defaultSizePreset = SIZE_PRESETS.find((preset) => preset.id === 'family') ?? SIZE_PRESETS[0];
const defaultMaterial = MATERIAL_PRESETS[0];

export const DEFAULT_PERGOLA_SPEC: PergolaSpec = {
  version: SPEC_VERSION,
  modelMode: 'sample',
  sizeId: defaultSizePreset.id,
  usesCustomSize: false,
  dimensions: {
    width: defaultSizePreset.width,
    depth: defaultSizePreset.depth,
    height: defaultSizePreset.height,
  },
  materialId: defaultMaterial.id,
  texturePreset: 'none',
  parameters: { ...DEFAULT_PARAMETERS },
  loadScenarioId: 'standard',
};

const SIZE_IDS = new Set(SIZE_PRESETS.map((preset) => preset.id));
const MATERIAL_IDS = new Set(MATERIAL_PRESETS.map((preset) => preset.id));
const TEXTURE_IDS = new Set<TexturePreset>(['none', 'brushed', 'oak', 'slate']);

const finiteOrFallback = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

/** Normalize an arbitrary value back into a fully-formed PergolaSpec. */
export const sanitizePergolaSpec = (input: unknown): PergolaSpec => {
  const fallback = DEFAULT_PERGOLA_SPEC;
  if (!input || typeof input !== 'object') {
    return { ...fallback, dimensions: { ...fallback.dimensions }, parameters: { ...fallback.parameters } };
  }

  const raw = input as Partial<PergolaSpec> & { dimensions?: Partial<PergolaDimensions>; parameters?: Partial<PergolaParameters> };

  const sizeId: SizePresetId = SIZE_IDS.has(raw.sizeId as SizePresetId)
    ? (raw.sizeId as SizePresetId)
    : fallback.sizeId;

  const materialId: MaterialPresetId = MATERIAL_IDS.has(raw.materialId as MaterialPresetId)
    ? (raw.materialId as MaterialPresetId)
    : fallback.materialId;

  const texturePreset: TexturePreset = TEXTURE_IDS.has(raw.texturePreset as TexturePreset)
    ? (raw.texturePreset as TexturePreset)
    : fallback.texturePreset;

  const modelMode: ModelMode = raw.modelMode === 'parametric' ? 'parametric' : 'sample';

  return {
    version: SPEC_VERSION,
    modelMode,
    sizeId,
    usesCustomSize: Boolean(raw.usesCustomSize),
    dimensions: {
      width: finiteOrFallback(raw.dimensions?.width, fallback.dimensions.width),
      depth: finiteOrFallback(raw.dimensions?.depth, fallback.dimensions.depth),
      height: finiteOrFallback(raw.dimensions?.height, fallback.dimensions.height),
    },
    materialId,
    texturePreset,
    parameters: {
      postThickness: finiteOrFallback(raw.parameters?.postThickness, fallback.parameters.postThickness),
      beamThickness: finiteOrFallback(raw.parameters?.beamThickness, fallback.parameters.beamThickness),
      slatThickness: finiteOrFallback(raw.parameters?.slatThickness, fallback.parameters.slatThickness),
      slatSpacing: finiteOrFallback(raw.parameters?.slatSpacing, fallback.parameters.slatSpacing),
    },
    loadScenarioId: typeof raw.loadScenarioId === 'string' ? raw.loadScenarioId : fallback.loadScenarioId,
  };
};

const HASH_PREFIX = '#cfg=';

const safeBtoa: ((value: string) => string) | null =
  typeof btoa === 'function' ? btoa : null;
const safeAtob: ((value: string) => string) | null =
  typeof atob === 'function' ? atob : null;

/**
 * Encode a spec into a compact, URL-safe base64 string. We strip padding
 * to keep the resulting hash as small as practical.
 */
export const encodeSpecToHash = (spec: PergolaSpec): string => {
  if (!safeBtoa) return '';
  try {
    const json = JSON.stringify(spec);
    const encoded = safeBtoa(unescape(encodeURIComponent(json)));
    return `${HASH_PREFIX}${encoded.replace(/=+$/, '')}`;
  } catch {
    return '';
  }
};

export const decodeSpecFromHash = (hash: string): PergolaSpec | null => {
  if (!hash || !hash.startsWith(HASH_PREFIX)) return null;
  if (!safeAtob) return null;
  try {
    const payload = hash.slice(HASH_PREFIX.length);
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = decodeURIComponent(escape(safeAtob(padded)));
    return sanitizePergolaSpec(JSON.parse(decoded));
  } catch {
    return null;
  }
};

export const specsAreEqual = (a: PergolaSpec, b: PergolaSpec): boolean =>
  JSON.stringify(a) === JSON.stringify(b);
