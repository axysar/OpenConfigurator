import { describe, expect, it, vi } from 'vitest';
import { analytics, trackStepViewed, trackOptionChanged, trackExport } from '@core/analytics';

describe('analytics event bus', () => {
  it('delivers events to subscribed handlers', () => {
    const handler = vi.fn();
    const unsub = analytics.subscribe(handler);

    analytics.track('test_event', { foo: 'bar' });

    expect(handler).toHaveBeenCalledOnce();
    const event = handler.mock.calls[0][0];
    expect(event.name).toBe('test_event');
    expect(event.properties.foo).toBe('bar');
    expect(typeof event.timestamp).toBe('number');

    unsub();
  });

  it('stops delivering after unsubscribe', () => {
    const handler = vi.fn();
    const unsub = analytics.subscribe(handler);
    unsub();

    analytics.track('after_unsub', {});
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not crash when a handler throws', () => {
    const badHandler = vi.fn(() => { throw new Error('boom'); });
    const goodHandler = vi.fn();

    const unsub1 = analytics.subscribe(badHandler);
    const unsub2 = analytics.subscribe(goodHandler);

    expect(() => analytics.track('safe_event', {})).not.toThrow();
    expect(goodHandler).toHaveBeenCalledOnce();

    unsub1();
    unsub2();
  });

  it('helper functions fire correctly named events', () => {
    const handler = vi.fn();
    const unsub = analytics.subscribe(handler);

    trackStepViewed('model');
    trackOptionChanged('materialId', 'walnut_wood', 'graphite_matte');
    trackExport('json');

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler.mock.calls[0][0].name).toBe('step_viewed');
    expect(handler.mock.calls[1][0].name).toBe('option_changed');
    expect(handler.mock.calls[1][0].properties.field).toBe('materialId');
    expect(handler.mock.calls[2][0].name).toBe('export');

    unsub();
  });
});
