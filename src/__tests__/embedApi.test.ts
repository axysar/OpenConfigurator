// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { embedApi } from '@core/embedApi';

describe('embedApi', () => {
  beforeEach(() => {
    embedApi.init();
  });

  afterEach(() => {
    embedApi.destroy();
  });

  it('registers and invokes command handlers', () => {
    const handler = vi.fn();
    embedApi.on('oc:getSpec', handler);

    const event = new MessageEvent('message', {
      data: { type: 'oc:getSpec' },
    });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].type).toBe('oc:getSpec');
  });

  it('ignores messages without a type field', () => {
    const handler = vi.fn();
    embedApi.on('oc:getSpec', handler);

    window.dispatchEvent(new MessageEvent('message', { data: { foo: 'bar' } }));
    window.dispatchEvent(new MessageEvent('message', { data: null }));
    window.dispatchEvent(new MessageEvent('message', { data: 42 }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribes handlers correctly', () => {
    const handler = vi.fn();
    const unsub = embedApi.on('oc:test', handler);
    unsub();

    window.dispatchEvent(new MessageEvent('message', { data: { type: 'oc:test' } }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops listening after destroy', () => {
    const handler = vi.fn();
    embedApi.on('oc:test', handler);
    embedApi.destroy();

    window.dispatchEvent(new MessageEvent('message', { data: { type: 'oc:test' } }));
    expect(handler).not.toHaveBeenCalled();
  });
});
