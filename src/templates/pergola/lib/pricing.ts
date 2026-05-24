import type { MaterialPreset, PergolaMetrics } from './pergolaMath';

/**
 * A simple, transparent pricing engine for the pergola configurator.
 *
 * The intent is not to deliver a binding quote — it provides a believable
 * "estimated investment" panel based on:
 *   - frame mass × material price-per-kg
 *   - footprint × installation rate
 *   - shade slat surface × labor multiplier
 *   - regional/load uplift
 *
 * Values are illustrative and easy to retune by editing this file.
 */
export interface MaterialPricing {
  pricePerKg: number;
  laborPerSqM: number;
  finishPerSqM: number;
}

export const MATERIAL_PRICING: Record<string, MaterialPricing> = {
  graphite_matte: { pricePerKg: 11, laborPerSqM: 95, finishPerSqM: 22 },
  ivory_satin: { pricePerKg: 11, laborPerSqM: 95, finishPerSqM: 26 },
  champagne_alloy: { pricePerKg: 14, laborPerSqM: 105, finishPerSqM: 32 },
  walnut_wood: { pricePerKg: 8, laborPerSqM: 130, finishPerSqM: 38 },
  carbon_steel: { pricePerKg: 6, laborPerSqM: 115, finishPerSqM: 24 },
};

const DEFAULT_PRICING: MaterialPricing = {
  pricePerKg: 10,
  laborPerSqM: 100,
  finishPerSqM: 25,
};

const TEXTURE_UPLIFT: Record<string, number> = {
  none: 0,
  brushed: 240,
  oak: 320,
  slate: 360,
};

export interface QuoteLine {
  id: string;
  label: string;
  amount: number;
  detail?: string;
}

export interface PergolaQuote {
  lines: QuoteLine[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface QuoteOptions {
  texturePresetId: string;
  loadFactor: number;
  taxRate?: number;
}

export const buildPergolaQuote = (
  metrics: PergolaMetrics,
  material: MaterialPreset,
  options: QuoteOptions,
): PergolaQuote => {
  const pricing = MATERIAL_PRICING[material.id] ?? DEFAULT_PRICING;
  const textureUplift = TEXTURE_UPLIFT[options.texturePresetId] ?? 0;

  const frameCost = metrics.estimatedWeightKg * pricing.pricePerKg;
  const laborCost = metrics.footprintM2 * pricing.laborPerSqM;
  const finishCost = metrics.footprintM2 * pricing.finishPerSqM + textureUplift;
  const engineeringCost = 285 * options.loadFactor;
  const deliveryCost = 180 + metrics.estimatedWeightKg * 0.6;

  const lines: QuoteLine[] = [
    {
      id: 'frame',
      label: `${material.label} frame`,
      amount: frameCost,
      detail: `${Math.round(metrics.estimatedWeightKg)} kg × $${pricing.pricePerKg}/kg`,
    },
    {
      id: 'labor',
      label: 'Installation & assembly',
      amount: laborCost,
      detail: `${metrics.footprintM2.toFixed(1)} m² × $${pricing.laborPerSqM}/m²`,
    },
    {
      id: 'finish',
      label: 'Finish & texture',
      amount: finishCost,
      detail: textureUplift > 0 ? `Includes texture uplift $${textureUplift}` : `$${pricing.finishPerSqM}/m²`,
    },
    {
      id: 'engineering',
      label: 'Engineering review',
      amount: engineeringCost,
      detail: options.loadFactor > 1 ? 'Higher review fee for upgraded loading' : 'Standard review',
    },
    {
      id: 'delivery',
      label: 'Delivery & handling',
      amount: deliveryCost,
    },
  ];

  const subtotal = lines.reduce((acc, line) => acc + line.amount, 0);
  const taxRate = options.taxRate ?? 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return { lines, subtotal, tax, total };
};
