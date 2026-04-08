export type ModelMode = 'sample' | 'parametric';

export type SizePresetId = 'compact' | 'urban' | 'family' | 'grand' | 'pavilion';

export type MaterialPresetId =
  | 'graphite_matte'
  | 'ivory_satin'
  | 'champagne_alloy'
  | 'walnut_wood'
  | 'carbon_steel';

export type TexturePreset = 'none' | 'brushed' | 'oak' | 'slate';

export interface PergolaDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface PergolaSizePreset extends PergolaDimensions {
  id: SizePresetId;
  label: string;
}

export interface MaterialPreset {
  id: MaterialPresetId;
  label: string;
  swatch: string;
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  structuralModulusGPa: number;
  allowableStressMPa: number;
  densityKgM3: number;
}

export interface PergolaParameters {
  postThickness: number;
  beamThickness: number;
  slatThickness: number;
  slatSpacing: number;
}

export interface BoxPart {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
}

export interface PergolaMetrics {
  footprintM2: number;
  perimeterM: number;
  clearHeightM: number;
  shadeCoveragePct: number;
  slatCount: number;
  postCount: number;
  bayCountX: number;
  bayCountZ: number;
  sectionCount: number;
  beamWidthM: number;
  beamDepthM: number;
  postThicknessM: number;
  maxClearSpanM: number;
  designLoadKPa: number;
  structuralUtilizationPct: number;
  frameVolumeM3: number;
  estimatedWeightKg: number;
}

export interface PergolaModel {
  posts: BoxPart[];
  beams: BoxPart[];
  slats: BoxPart[];
  glassPanels: BoxPart[];
  metrics: PergolaMetrics;
}

interface BeamSectionDesign {
  width: number;
  depth: number;
  stressUtilization: number;
  deflectionUtilization: number;
}

interface StructuralSystem {
  bayCountX: number;
  bayCountZ: number;
  spanX: number;
  spanZ: number;
  beamWidth: number;
  beamDepth: number;
  postThickness: number;
  governingUtilization: number;
}

const STRUCTURAL_RULES = {
  roofLoadKPa: 0.8,
  deflectionLimitRatio: 240,
  beamAspectRatio: 1.8,
  maxBeamWidth: 0.24,
  maxBeamDepth: 0.34,
  maxBayCount: 10,
  postSafetyFactor: 2.0,
};

export interface BuildPergolaOptions {
  /** Override the default roof load (kPa) for snow/wind scenarios. */
  roofLoadKPa?: number;
  /** Multiplier applied to the post safety factor for lateral load. */
  lateralFactor?: number;
}

export const SIZE_PRESETS: PergolaSizePreset[] = [
  { id: 'compact', label: 'Compact 3x3m', width: 3, depth: 3, height: 2.5 },
  { id: 'urban', label: 'Urban 3x4m', width: 3, depth: 4, height: 2.6 },
  { id: 'family', label: 'Family 4x4m', width: 4, depth: 4, height: 2.7 },
  { id: 'grand', label: 'Grand 4x6m', width: 4, depth: 6, height: 2.85 },
  { id: 'pavilion', label: 'Pavilion 5x7m', width: 5, depth: 7, height: 3 },
];

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'graphite_matte',
    label: 'Graphite Matte',
    swatch: '#616874',
    color: '#616874',
    metalness: 0.14,
    roughness: 0.68,
    clearcoat: 0.04,
    clearcoatRoughness: 0.72,
    structuralModulusGPa: 69,
    allowableStressMPa: 95,
    densityKgM3: 2700,
  },
  {
    id: 'ivory_satin',
    label: 'Ivory Satin',
    swatch: '#ece7dc',
    color: '#ece7dc',
    metalness: 0.08,
    roughness: 0.53,
    clearcoat: 0.16,
    clearcoatRoughness: 0.44,
    structuralModulusGPa: 69,
    allowableStressMPa: 95,
    densityKgM3: 2700,
  },
  {
    id: 'champagne_alloy',
    label: 'Champagne Alloy',
    swatch: '#beb39e',
    color: '#beb39e',
    metalness: 0.54,
    roughness: 0.34,
    clearcoat: 0.12,
    clearcoatRoughness: 0.3,
    structuralModulusGPa: 69,
    allowableStressMPa: 100,
    densityKgM3: 2700,
  },
  {
    id: 'walnut_wood',
    label: 'Walnut Wood',
    swatch: '#8f5a36',
    color: '#8f5a36',
    metalness: 0.05,
    roughness: 0.76,
    clearcoat: 0.03,
    clearcoatRoughness: 0.8,
    structuralModulusGPa: 11,
    allowableStressMPa: 16,
    densityKgM3: 650,
  },
  {
    id: 'carbon_steel',
    label: 'Carbon Steel',
    swatch: '#2e3237',
    color: '#2e3237',
    metalness: 0.35,
    roughness: 0.46,
    clearcoat: 0.09,
    clearcoatRoughness: 0.56,
    structuralModulusGPa: 200,
    allowableStressMPa: 160,
    densityKgM3: 7850,
  },
];

export const TEXTURE_LABELS: Record<TexturePreset, string> = {
  none: 'Solid Finish',
  brushed: 'Brushed Metal',
  oak: 'Natural Oak',
  slate: 'Slate Composite',
};

export const DEFAULT_PARAMETERS: PergolaParameters = {
  postThickness: 0.14,
  beamThickness: 0.12,
  slatThickness: 0.035,
  slatSpacing: 0.22,
};

export const MODEL_FORMULA =
  'Beam checks use M = wL^2/8 and deflection = 5wL^4/(384EI); bays and pole count auto-increase until section limits are met.';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const designBeamSection = (
  spanM: number,
  tributaryWidthM: number,
  minBeamWidthM: number,
  elasticModulusPa: number,
  allowableStressPa: number,
  roofLoadKPa: number,
): BeamSectionDesign => {
  const span = Math.max(spanM, 0.2);
  const tributary = Math.max(tributaryWidthM, 0.2);
  const lineLoadNPerM = roofLoadKPa * 1000 * tributary;

  const maxMomentNm = (lineLoadNPerM * span * span) / 8;
  const allowableDeflectionM = span / STRUCTURAL_RULES.deflectionLimitRatio;

  const minBeamDepthM = Math.max(minBeamWidthM * 1.2, 0.09);
  let beamWidth = Math.max(minBeamWidthM, 0.06);
  let beamDepth = Math.max(minBeamDepthM, beamWidth * 1.2);

  for (let index = 0; index < 7; index += 1) {
    const depthFromStress = Math.sqrt(
      (6 * maxMomentNm) / (Math.max(allowableStressPa, 1e4) * Math.max(beamWidth, 1e-6)),
    );

    const depthFromDeflection = Math.cbrt(
      (5 * lineLoadNPerM * Math.pow(span, 4)) /
        (32 * Math.max(elasticModulusPa, 1e7) * Math.max(beamWidth, 1e-6) * Math.max(allowableDeflectionM, 1e-6)),
    );

    beamDepth = Math.max(minBeamDepthM, depthFromStress, depthFromDeflection, beamWidth * 1.2);
    beamWidth = Math.max(minBeamWidthM, beamDepth / STRUCTURAL_RULES.beamAspectRatio);
  }

  const inertia = (beamWidth * Math.pow(beamDepth, 3)) / 12;
  const bendingStressPa =
    (6 * maxMomentNm) / (Math.max(beamWidth, 1e-6) * Math.max(Math.pow(beamDepth, 2), 1e-8));

  const beamDeflectionM =
    (5 * lineLoadNPerM * Math.pow(span, 4)) /
    (384 * Math.max(elasticModulusPa, 1e7) * Math.max(inertia, 1e-9));

  return {
    width: beamWidth,
    depth: beamDepth,
    stressUtilization: bendingStressPa / Math.max(allowableStressPa, 1e4),
    deflectionUtilization: beamDeflectionM / Math.max(allowableDeflectionM, 1e-6),
  };
};

const resolveStructuralSystem = (
  dimensions: PergolaDimensions,
  minPostThicknessM: number,
  minBeamWidthM: number,
  materialPreset: MaterialPreset,
  roofLoadKPa: number,
  lateralFactor: number,
): StructuralSystem => {
  const width = dimensions.width;
  const depth = dimensions.depth;
  const height = dimensions.height;

  const elasticModulusPa = materialPreset.structuralModulusGPa * 1_000_000_000;
  const allowableStressPa = materialPreset.allowableStressMPa * 1_000_000;

  const baseSpanTarget = clamp(2.5 + materialPreset.structuralModulusGPa * 0.007, 2.5, 3.9);

  let bayCountX = Math.max(1, Math.ceil(width / baseSpanTarget));
  let bayCountZ = Math.max(1, Math.ceil(depth / baseSpanTarget));

  let sectionX: BeamSectionDesign = {
    width: minBeamWidthM,
    depth: minBeamWidthM * 1.2,
    stressUtilization: 0,
    deflectionUtilization: 0,
  };

  let sectionZ: BeamSectionDesign = { ...sectionX };

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const spanX = Math.max(0.4, (width - minPostThicknessM) / bayCountX);
    const spanZ = Math.max(0.4, (depth - minPostThicknessM) / bayCountZ);

    sectionX = designBeamSection(spanX, spanZ, minBeamWidthM, elasticModulusPa, allowableStressPa, roofLoadKPa);
    sectionZ = designBeamSection(spanZ, spanX, minBeamWidthM, elasticModulusPa, allowableStressPa, roofLoadKPa);

    const requiredBeamWidth = Math.max(sectionX.width, sectionZ.width, minBeamWidthM);
    const requiredBeamDepth = Math.max(
      sectionX.depth,
      sectionZ.depth,
      Math.max(minBeamWidthM * 1.2, 0.09),
    );

    const exceedsLimits =
      requiredBeamWidth > STRUCTURAL_RULES.maxBeamWidth ||
      requiredBeamDepth > STRUCTURAL_RULES.maxBeamDepth;

    if (!exceedsLimits) {
      break;
    }

    const ratioX = Math.max(
      sectionX.width / STRUCTURAL_RULES.maxBeamWidth,
      sectionX.depth / STRUCTURAL_RULES.maxBeamDepth,
    );

    const ratioZ = Math.max(
      sectionZ.width / STRUCTURAL_RULES.maxBeamWidth,
      sectionZ.depth / STRUCTURAL_RULES.maxBeamDepth,
    );

    if (ratioX >= ratioZ && bayCountX < STRUCTURAL_RULES.maxBayCount) {
      bayCountX += 1;
    } else if (bayCountZ < STRUCTURAL_RULES.maxBayCount) {
      bayCountZ += 1;
    } else {
      break;
    }
  }

  const spanX = Math.max(0.4, (width - minPostThicknessM) / bayCountX);
  const spanZ = Math.max(0.4, (depth - minPostThicknessM) / bayCountZ);

  sectionX = designBeamSection(spanX, spanZ, minBeamWidthM, elasticModulusPa, allowableStressPa, roofLoadKPa);
  sectionZ = designBeamSection(spanZ, spanX, minBeamWidthM, elasticModulusPa, allowableStressPa, roofLoadKPa);

  const beamWidth = clamp(
    Math.max(sectionX.width, sectionZ.width, minBeamWidthM),
    minBeamWidthM,
    STRUCTURAL_RULES.maxBeamWidth,
  );

  const beamDepth = clamp(
    Math.max(sectionX.depth, sectionZ.depth, Math.max(minBeamWidthM * 1.2, 0.09)),
    Math.max(minBeamWidthM * 1.2, 0.09),
    STRUCTURAL_RULES.maxBeamDepth,
  );

  const tributaryAreaPerPost = spanX * spanZ;
  const postLoadN = roofLoadKPa * 1000 * tributaryAreaPerPost;

  const lateralAdjustedSafety = STRUCTURAL_RULES.postSafetyFactor * lateralFactor;
  const allowableCompressionPa = Math.max(allowableStressPa * 0.35, 2_000_000);
  const postByCompression = Math.sqrt(
    (postLoadN * lateralAdjustedSafety) / allowableCompressionPa,
  );

  const postByBuckling = Math.pow(
    (12 * postLoadN * lateralAdjustedSafety * Math.pow(Math.max(height, 2), 2)) /
      (Math.PI * Math.PI * Math.max(elasticModulusPa, 1e7)),
    0.25,
  );

  const postThickness = clamp(
    Math.max(minPostThicknessM, postByCompression, postByBuckling),
    minPostThicknessM,
    0.32,
  );

  const governingUtilization = Math.max(
    sectionX.stressUtilization,
    sectionX.deflectionUtilization,
    sectionZ.stressUtilization,
    sectionZ.deflectionUtilization,
  );

  return {
    bayCountX,
    bayCountZ,
    spanX,
    spanZ,
    beamWidth,
    beamDepth,
    postThickness,
    governingUtilization,
  };
};

export const getSizePreset = (id: SizePresetId): PergolaSizePreset => {
  const size = SIZE_PRESETS.find((preset) => preset.id === id);
  return size ?? SIZE_PRESETS[2];
};

export const getMaterialPreset = (id: MaterialPresetId): MaterialPreset => {
  const preset = MATERIAL_PRESETS.find((item) => item.id === id);
  return preset ?? MATERIAL_PRESETS[0];
};

export const buildPergolaModel = (
  dimensions: PergolaDimensions,
  params: PergolaParameters,
  materialPreset?: MaterialPreset,
  options: BuildPergolaOptions = {},
): PergolaModel => {
  const width = clamp(dimensions.width, 2.5, 9);
  const depth = clamp(dimensions.depth, 2.5, 10);
  const height = clamp(dimensions.height, 2.2, 4);

  const activeMaterial = materialPreset ?? MATERIAL_PRESETS[0];

  const minPostThickness = clamp(params.postThickness, 0.09, 0.28);
  const minBeamWidth = clamp(params.beamThickness, 0.08, 0.24);
  const slatThickness = clamp(params.slatThickness, 0.02, 0.12);
  const slatSpacing = clamp(params.slatSpacing, 0.12, 0.5);

  const roofLoadKPa = options.roofLoadKPa ?? STRUCTURAL_RULES.roofLoadKPa;
  const lateralFactor = options.lateralFactor ?? 1;

  const structural = resolveStructuralSystem(
    { width, depth, height },
    minPostThickness,
    minBeamWidth,
    activeMaterial,
    roofLoadKPa,
    lateralFactor,
  );

  const postThickness = structural.postThickness;
  const beamWidth = structural.beamWidth;
  const beamDepth = structural.beamDepth;

  const postHeight = Math.max(1.7, height - beamDepth);
  const beamCenterY = height - beamDepth / 2;
  const slatY = Math.max(0.6, height - beamDepth - slatThickness / 2);
  const slatProfileDepth = clamp(beamWidth * 0.65, 0.045, 0.14);

  const lineCountX = structural.bayCountX + 1;
  const lineCountZ = structural.bayCountZ + 1;

  const minX = -width / 2 + postThickness / 2;
  const maxX = width / 2 - postThickness / 2;
  const minZ = -depth / 2 + postThickness / 2;
  const maxZ = depth / 2 - postThickness / 2;

  const xStep = lineCountX > 1 ? (maxX - minX) / (lineCountX - 1) : 0;
  const zStep = lineCountZ > 1 ? (maxZ - minZ) / (lineCountZ - 1) : 0;

  const xLines = Array.from({ length: lineCountX }, (_, index) => minX + xStep * index);
  const zLines = Array.from({ length: lineCountZ }, (_, index) => minZ + zStep * index);

  const posts: BoxPart[] = [];
  for (let xi = 0; xi < xLines.length; xi += 1) {
    for (let zi = 0; zi < zLines.length; zi += 1) {
      posts.push({
        id: `post-${xi}-${zi}`,
        position: [xLines[xi], postHeight / 2, zLines[zi]],
        size: [postThickness, postHeight, postThickness],
      });
    }
  }

  const beams: BoxPart[] = [];

  for (let zi = 0; zi < zLines.length; zi += 1) {
    for (let xi = 0; xi < xLines.length - 1; xi += 1) {
      const span = xLines[xi + 1] - xLines[xi];
      beams.push({
        id: `beam-x-${zi}-${xi}`,
        position: [(xLines[xi + 1] + xLines[xi]) / 2, beamCenterY, zLines[zi]],
        size: [Math.max(0.2, span + postThickness), beamDepth, beamWidth],
      });
    }
  }

  for (let xi = 0; xi < xLines.length; xi += 1) {
    for (let zi = 0; zi < zLines.length - 1; zi += 1) {
      const span = zLines[zi + 1] - zLines[zi];
      beams.push({
        id: `beam-z-${xi}-${zi}`,
        position: [xLines[xi], beamCenterY, (zLines[zi + 1] + zLines[zi]) / 2],
        size: [beamWidth, beamDepth, Math.max(0.2, span + postThickness)],
      });
    }
  }

  const slats: BoxPart[] = [];
  let roofClearArea = 0;
  let slatProjectedArea = 0;

  for (let zi = 0; zi < zLines.length - 1; zi += 1) {
    const bayInnerZStart = zLines[zi] + beamWidth / 2;
    const bayInnerZEnd = zLines[zi + 1] - beamWidth / 2;
    const bayClearZ = Math.max(0.2, bayInnerZEnd - bayInnerZStart);

    const rawSlatCount = Math.floor(bayClearZ / slatSpacing) + 1;
    const slatCountInBayZ = Math.max(2, rawSlatCount);
    const actualSpacing =
      slatCountInBayZ > 1 ? bayClearZ / (slatCountInBayZ - 1) : bayClearZ;

    for (let xi = 0; xi < xLines.length - 1; xi += 1) {
      const bayInnerXStart = xLines[xi] + beamWidth / 2;
      const bayInnerXEnd = xLines[xi + 1] - beamWidth / 2;
      const bayClearX = Math.max(0.2, bayInnerXEnd - bayInnerXStart);
      roofClearArea += bayClearX * bayClearZ;

      for (let si = 0; si < slatCountInBayZ; si += 1) {
        const z = bayInnerZStart + actualSpacing * si;
        slats.push({
          id: `slat-${xi}-${zi}-${si}`,
          position: [(xLines[xi] + xLines[xi + 1]) / 2, slatY, z],
          size: [bayClearX, slatThickness, slatProfileDepth],
        });
      }

      slatProjectedArea += bayClearX * slatProfileDepth * slatCountInBayZ;
    }
  }

  const glassPanels: BoxPart[] = [];
  const panelGap = Math.max(0.04, beamWidth * 0.4);
  const panelHeight = 0.014;

  for (let zi = 0; zi < zLines.length - 1; zi += 1) {
    for (let xi = 0; xi < xLines.length - 1; xi += 1) {
      const spanX = xLines[xi + 1] - xLines[xi] - beamWidth - panelGap;
      const spanZ = zLines[zi + 1] - zLines[zi] - beamWidth - panelGap;
      if (spanX <= 0.22 || spanZ <= 0.22) {
        continue;
      }

      glassPanels.push({
        id: `glass-${xi}-${zi}`,
        position: [
          (xLines[xi] + xLines[xi + 1]) / 2,
          slatY - slatThickness / 1.5,
          (zLines[zi] + zLines[zi + 1]) / 2,
        ],
        size: [spanX, panelHeight, spanZ],
      });
    }
  }

  const postVolume = posts.reduce(
    (acc, part) => acc + part.size[0] * part.size[1] * part.size[2],
    0,
  );
  const beamVolume = beams.reduce(
    (acc, part) => acc + part.size[0] * part.size[1] * part.size[2],
    0,
  );
  const slatVolume = slats.reduce(
    (acc, part) => acc + part.size[0] * part.size[1] * part.size[2],
    0,
  );

  const frameVolumeM3 = postVolume + beamVolume + slatVolume;
  const estimatedWeightKg = frameVolumeM3 * activeMaterial.densityKgM3;

  const shadeCoveragePct =
    roofClearArea > 0 ? clamp((slatProjectedArea * 100) / roofClearArea, 12, 100) : 12;

  return {
    posts,
    beams,
    slats,
    glassPanels,
    metrics: {
      footprintM2: width * depth,
      perimeterM: (width + depth) * 2,
      clearHeightM: postHeight,
      shadeCoveragePct,
      slatCount: slats.length,
      postCount: posts.length,
      bayCountX: structural.bayCountX,
      bayCountZ: structural.bayCountZ,
      sectionCount: structural.bayCountX * structural.bayCountZ,
      beamWidthM: beamWidth,
      beamDepthM: beamDepth,
      postThicknessM: postThickness,
      maxClearSpanM: Math.max(structural.spanX, structural.spanZ),
      designLoadKPa: roofLoadKPa,
      structuralUtilizationPct: clamp(structural.governingUtilization * 100, 0, 220),
      frameVolumeM3,
      estimatedWeightKg,
    },
  };
};
