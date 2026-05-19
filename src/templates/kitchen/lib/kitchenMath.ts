/**
 * Kitchen cabinet configurator math engine.
 *
 * This is a minimal but complete second template that proves the
 * template-driven architecture scales. It generates a row of base
 * cabinets + wall cabinets with configurable unit widths, counter depth,
 * and material pricing.
 */
import { clamp } from '@shared/math';

export type CabinetStyle = 'shaker' | 'slab' | 'raised_panel';
export type CountertopMaterial = 'granite' | 'quartz' | 'laminate' | 'butcher_block';
export type CabinetFinish = 'white' | 'gray' | 'navy' | 'natural_oak' | 'espresso';

export interface KitchenSpec {
  wallLength: number;
  cabinetDepth: number;
  counterHeight: number;
  wallCabinetHeight: number;
  unitWidth: number;
  style: CabinetStyle;
  countertop: CountertopMaterial;
  finish: CabinetFinish;
}

export interface CabinetUnit {
  id: string;
  type: 'base' | 'wall';
  position: [number, number, number];
  size: [number, number, number];
}

export interface KitchenMetrics {
  baseUnits: number;
  wallUnits: number;
  totalUnits: number;
  linearMeters: number;
  counterAreaM2: number;
  estimatedCost: number;
}

export interface KitchenModel {
  units: CabinetUnit[];
  countertop: CabinetUnit | null;
  metrics: KitchenMetrics;
}

export const CABINET_STYLES: Array<{ id: CabinetStyle; label: string }> = [
  { id: 'shaker', label: 'Shaker' },
  { id: 'slab', label: 'Modern Slab' },
  { id: 'raised_panel', label: 'Raised Panel' },
];

export const COUNTERTOP_MATERIALS: Array<{ id: CountertopMaterial; label: string; pricePerM2: number; color: string }> = [
  { id: 'granite', label: 'Granite', pricePerM2: 450, color: '#4a4a4a' },
  { id: 'quartz', label: 'Quartz', pricePerM2: 520, color: '#e8e4df' },
  { id: 'laminate', label: 'Laminate', pricePerM2: 120, color: '#d4c8b8' },
  { id: 'butcher_block', label: 'Butcher Block', pricePerM2: 280, color: '#b8844c' },
];

export const CABINET_FINISHES: Array<{ id: CabinetFinish; label: string; swatch: string; priceMultiplier: number }> = [
  { id: 'white', label: 'Classic White', swatch: '#f0f0f0', priceMultiplier: 1.0 },
  { id: 'gray', label: 'Warm Gray', swatch: '#8c8c8c', priceMultiplier: 1.05 },
  { id: 'navy', label: 'Navy Blue', swatch: '#2c3e6b', priceMultiplier: 1.12 },
  { id: 'natural_oak', label: 'Natural Oak', swatch: '#c4a06a', priceMultiplier: 1.2 },
  { id: 'espresso', label: 'Espresso', swatch: '#3e2723', priceMultiplier: 1.15 },
];

export const DEFAULT_KITCHEN_SPEC: KitchenSpec = {
  wallLength: 3.6,
  cabinetDepth: 0.6,
  counterHeight: 0.9,
  wallCabinetHeight: 0.72,
  unitWidth: 0.6,
  style: 'shaker',
  countertop: 'quartz',
  finish: 'white',
};

const BASE_PRICE_PER_UNIT = 280;
const WALL_PRICE_PER_UNIT = 180;
const STYLE_MULTIPLIER: Record<CabinetStyle, number> = {
  shaker: 1.0,
  slab: 0.9,
  raised_panel: 1.25,
};

export const buildKitchenModel = (spec: KitchenSpec): KitchenModel => {
  const wallLength = clamp(spec.wallLength, 1.2, 8);
  const depth = clamp(spec.cabinetDepth, 0.45, 0.75);
  const counterH = clamp(spec.counterHeight, 0.8, 1.0);
  const wallH = clamp(spec.wallCabinetHeight, 0.4, 0.9);
  const unitW = clamp(spec.unitWidth, 0.3, 0.9);

  const baseCount = Math.max(1, Math.floor(wallLength / unitW));
  const actualUnitW = wallLength / baseCount;

  const units: CabinetUnit[] = [];

  for (let i = 0; i < baseCount; i++) {
    const x = -wallLength / 2 + actualUnitW / 2 + i * actualUnitW;
    units.push({
      id: `base-${i}`,
      type: 'base',
      position: [x, counterH / 2, 0],
      size: [actualUnitW - 0.01, counterH, depth],
    });
  }

  const wallCabinetBottom = counterH + 0.45;
  for (let i = 0; i < baseCount; i++) {
    const x = -wallLength / 2 + actualUnitW / 2 + i * actualUnitW;
    units.push({
      id: `wall-${i}`,
      type: 'wall',
      position: [x, wallCabinetBottom + wallH / 2, 0],
      size: [actualUnitW - 0.01, wallH, depth * 0.55],
    });
  }

  const counterAreaM2 = wallLength * depth;
  const countertopMat = COUNTERTOP_MATERIALS.find((m) => m.id === spec.countertop) ?? COUNTERTOP_MATERIALS[0];
  const finishMat = CABINET_FINISHES.find((f) => f.id === spec.finish) ?? CABINET_FINISHES[0];
  const styleMult = STYLE_MULTIPLIER[spec.style] ?? 1;

  const baseCost = baseCount * BASE_PRICE_PER_UNIT * styleMult * finishMat.priceMultiplier;
  const wallCost = baseCount * WALL_PRICE_PER_UNIT * styleMult * finishMat.priceMultiplier;
  const counterCost = counterAreaM2 * countertopMat.pricePerM2;
  const estimatedCost = baseCost + wallCost + counterCost;

  const countertop: CabinetUnit = {
    id: 'countertop',
    type: 'base',
    position: [0, counterH + 0.015, 0],
    size: [wallLength, 0.03, depth + 0.04],
  };

  return {
    units,
    countertop,
    metrics: {
      baseUnits: baseCount,
      wallUnits: baseCount,
      totalUnits: baseCount * 2,
      linearMeters: wallLength,
      counterAreaM2,
      estimatedCost,
    },
  };
};
