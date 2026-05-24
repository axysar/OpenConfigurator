import { describe, expect, it } from 'vitest';
import { aiConfigure, aiRecommend } from '@core/aiAssistant';

describe('AI assistant (local fallback)', () => {
  it('parses "large rustic" into pavilion + walnut wood', async () => {
    const result = await aiConfigure({
      prompt: 'I want a large rustic pergola for my backyard',
      currentSpec: {},
      templateId: 'pergola',
    });

    expect(result.specPatch['materialId']).toBe('walnut_wood');
    expect((result.specPatch['dimensions'] as { width: number }).width).toBeGreaterThanOrEqual(5);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('parses "small modern budget" correctly', async () => {
    const result = await aiConfigure({
      prompt: 'small modern budget friendly',
      currentSpec: {},
      templateId: 'pergola',
    });

    expect(result.specPatch['materialId']).toBe('graphite_matte');
    expect((result.specPatch['dimensions'] as { width: number }).width).toBeLessThanOrEqual(3.5);
  });

  it('parses "coastal wind steel industrial"', async () => {
    const result = await aiConfigure({
      prompt: 'industrial steel coastal wind',
      currentSpec: {},
      templateId: 'pergola',
    });

    expect(result.specPatch['materialId']).toBe('carbon_steel');
    expect(result.specPatch['loadScenarioId']).toBe('coastal');
  });

  it('returns low confidence for unrecognized prompt', async () => {
    const result = await aiConfigure({
      prompt: 'xyzzy foobar baz',
      currentSpec: {},
      templateId: 'pergola',
    });

    expect(result.confidence).toBeLessThan(0.5);
  });

  it('generates recommendations based on spec', async () => {
    const recs = await aiRecommend(
      { materialId: 'carbon_steel', dimensions: { width: 4, depth: 4 } },
      'pergola',
    );

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.id && r.title && r.description)).toBe(true);
  });
});
