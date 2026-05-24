import { describe, expect, it } from 'vitest';
import { SCENE_ENVIRONMENTS, getSceneEnvironment } from '@templates/pergola/lib/sceneEnvironments';

describe('scene environments', () => {
  it('has at least 4 presets', () => {
    expect(SCENE_ENVIRONMENTS.length).toBeGreaterThanOrEqual(4);
  });

  it('returns the correct environment by id', () => {
    const sunset = getSceneEnvironment('sunset');
    expect(sunset.id).toBe('sunset');
    expect(sunset.sunIntensity).toBeLessThan(1);
  });

  it('falls back to day for unknown id', () => {
    const fallback = getSceneEnvironment('mars');
    expect(fallback.id).toBe('day');
  });

  it('all environments have valid sun positions', () => {
    for (const env of SCENE_ENVIRONMENTS) {
      expect(env.sunPosition).toHaveLength(3);
      expect(env.fogNear).toBeLessThan(env.fogFar);
    }
  });
});
