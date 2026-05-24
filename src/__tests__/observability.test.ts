import { describe, expect, it } from 'vitest';
import {
  initFeatureFlags,
  isFeatureEnabled,
  getFeatureFlags,
  setFeatureFlag,
  getHealthStatus,
} from '@core/observability';
import { validateManifest, PERGOLA_MANIFEST, KITCHEN_MANIFEST } from '@core/templateManifest';

describe('feature flags', () => {
  it('all flags default to false', () => {
    initFeatureFlags();
    expect(isFeatureEnabled('ai_assistant')).toBe(false);
    expect(isFeatureEnabled('ar_preview')).toBe(false);
    expect(isFeatureEnabled('cloud_persistence')).toBe(false);
  });

  it('accepts overrides', () => {
    initFeatureFlags({ ai_assistant: true });
    expect(isFeatureEnabled('ai_assistant')).toBe(true);
    expect(isFeatureEnabled('ar_preview')).toBe(false);
  });

  it('setFeatureFlag toggles at runtime', () => {
    initFeatureFlags();
    setFeatureFlag('collaboration', true);
    expect(isFeatureEnabled('collaboration')).toBe(true);
    setFeatureFlag('collaboration', false);
    expect(isFeatureEnabled('collaboration')).toBe(false);
  });

  it('getFeatureFlags returns all flags', () => {
    initFeatureFlags();
    const flags = getFeatureFlags();
    expect(typeof flags).toBe('object');
    expect('ai_assistant' in flags).toBe(true);
  });
});

describe('health check', () => {
  it('returns valid health status', () => {
    const status = getHealthStatus();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(status.status);
    expect(status.version).toBe('4.0.0');
    expect(status.uptime).toBeGreaterThanOrEqual(0);
    expect(typeof status.checks.localStorage).toBe('boolean');
  });
});

describe('template manifest validation', () => {
  it('validates pergola manifest', () => {
    const result = validateManifest(PERGOLA_MANIFEST);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates kitchen manifest', () => {
    const result = validateManifest(KITCHEN_MANIFEST);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid manifest', () => {
    const result = validateManifest({
      id: '',
      name: '',
      version: '',
      author: '',
      tagline: '',
      description: '',
      category: '',
      tags: [],
      minPlatformVersion: '',
      features: {} as never,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
