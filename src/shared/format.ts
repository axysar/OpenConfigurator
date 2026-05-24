/**
 * Locale-friendly formatters used across the configurator UI.
 * Centralizing these makes unit display consistent in every panel.
 */

export const fmtMeters = (value: number, decimals = 2): string =>
  `${value.toFixed(decimals)} m`;

export const fmtMillimeters = (valueM: number): string =>
  `${Math.round(valueM * 1000)} mm`;

export const fmtArea = (value: number, decimals = 2): string =>
  `${value.toFixed(decimals)} m²`;

export const fmtVolume = (value: number, decimals = 3): string =>
  `${value.toFixed(decimals)} m³`;

export const fmtWeight = (value: number): string => `${Math.round(value)} kg`;

export const fmtCurrency = (value: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString()}`;
  }
};

export const fmtPercent = (value: number, decimals = 0): string =>
  `${value.toFixed(decimals)}%`;

export const fmtSectionMm = (widthM: number, depthM: number): string =>
  `${Math.round(widthM * 1000)} × ${Math.round(depthM * 1000)} mm`;
