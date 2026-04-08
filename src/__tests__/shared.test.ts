import { describe, expect, it } from 'vitest';
import { clamp, lerp, remap, roundTo, fmtCurrency, fmtMeters } from '@shared/index';

describe('shared math utilities', () => {
  it('clamps values into a range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it('lerps and remaps numbers correctly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(remap(5, 0, 10, 100, 200)).toBe(150);
  });

  it('rounds to a number of decimals', () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(1.235, 2)).toBe(1.24);
  });
});

describe('shared formatters', () => {
  it('formats meters with two decimals', () => {
    expect(fmtMeters(3.456)).toBe('3.46 m');
  });

  it('formats currency with the default locale', () => {
    const result = fmtCurrency(1234);
    expect(result.length).toBeGreaterThan(0);
    // The locale-aware result will contain the digits 1, 2, 3, 4 in order
    expect(result.replace(/\D/g, '')).toContain('1234');
  });
});
