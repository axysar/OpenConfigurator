/**
 * Embed / iframe integration layer.
 *
 * When OpenConfigurator is loaded inside an iframe (Shopify product page,
 * WooCommerce, Webflow, etc.) the host page communicates via postMessage.
 *
 * ## Inbound commands (host → configurator)
 *   { type: 'oc:setSpec', spec: PergolaSpec }
 *   { type: 'oc:getSpec' }
 *   { type: 'oc:getQuote' }
 *   { type: 'oc:screenshot' }
 *
 * ## Outbound events (configurator → host)
 *   { type: 'oc:specChanged', spec }
 *   { type: 'oc:quoteChanged', quote }
 *   { type: 'oc:ready' }
 *   { type: 'oc:specResponse', spec }
 *   { type: 'oc:quoteResponse', quote }
 *   { type: 'oc:screenshotResponse', dataUrl }
 */

type AnyPayload = Record<string, unknown>;

export interface EmbedCommand {
  type: string;
  [key: string]: unknown;
}

type CommandHandler = (data: AnyPayload) => void;

const handlers = new Map<string, CommandHandler>();

const isInsideIframe = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
};

const postToHost = (payload: AnyPayload): void => {
  if (typeof window === 'undefined') return;
  try {
    window.parent.postMessage(payload, '*');
  } catch {
    /* cross-origin edge case */
  }
};

const onMessage = (event: MessageEvent): void => {
  const data = event.data as AnyPayload | null;
  if (!data || typeof data.type !== 'string') return;
  const handler = handlers.get(data.type);
  if (handler) handler(data);
};

export const embedApi = {
  get isEmbedded(): boolean {
    return isInsideIframe();
  },

  /** Register a handler for an inbound command type. */
  on(type: string, handler: CommandHandler): () => void {
    handlers.set(type, handler);
    return () => {
      handlers.delete(type);
    };
  },

  /** Send an event from the configurator to the host page. */
  emit(type: string, payload: AnyPayload = {}): void {
    postToHost({ type, ...payload });
  },

  /** Call once at startup. */
  init(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('message', onMessage);
    if (isInsideIframe()) {
      postToHost({ type: 'oc:ready' });
    }
  },

  destroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('message', onMessage);
    handlers.clear();
  },
};
