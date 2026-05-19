/**
 * Lightweight analytics event bus for configurator interactions.
 *
 * The bus is transport-agnostic — consumers register a handler
 * (Google Analytics, Mixpanel, PostHog, console logger, etc.)
 * and receive typed events. No external dependencies.
 *
 * Events track the configurator funnel:
 *   step_viewed → option_changed → quote_viewed → lead_submitted
 * plus performance signals (scene_load_time, frame_rate_sample).
 */

export interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

type AnalyticsHandler = (event: AnalyticsEvent) => void;

const handlers: Set<AnalyticsHandler> = new Set();

export const analytics = {
  /** Register an analytics handler (returns unsubscribe function). */
  subscribe(handler: AnalyticsHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },

  /** Fire an analytics event to all registered handlers. */
  track(name: string, properties: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = { name, timestamp: Date.now(), properties };
    for (const handler of handlers) {
      try {
        handler(event);
      } catch {
        /* don't let analytics crash the app */
      }
    }
  },
};

// -- Predefined event helpers --

export const trackStepViewed = (stepId: string): void =>
  analytics.track('step_viewed', { stepId });

export const trackOptionChanged = (
  field: string,
  value: unknown,
  previousValue?: unknown,
): void =>
  analytics.track('option_changed', { field, value, previousValue });

export const trackQuoteViewed = (total: number, currency: string): void =>
  analytics.track('quote_viewed', { total, currency });

export const trackExport = (format: string): void =>
  analytics.track('export', { format });

export const trackShareLink = (): void =>
  analytics.track('share_link_copied', {});

export const trackLeadSubmitted = (hasPhone: boolean): void =>
  analytics.track('lead_submitted', { hasPhone });

export const trackSceneLoadTime = (durationMs: number): void =>
  analytics.track('scene_load_time', { durationMs });

export const trackViewPresetChanged = (preset: string): void =>
  analytics.track('view_preset_changed', { preset });

export const trackRuleTriggered = (ruleId: string, message: string): void =>
  analytics.track('rule_triggered', { ruleId, message });

/**
 * Console logger handler — useful during development.
 * Call `analytics.subscribe(consoleHandler)` to enable.
 */
export const consoleHandler: AnalyticsHandler = (event) => {
  // eslint-disable-next-line no-console
  console.log(
    `%c[OC Analytics]%c ${event.name}`,
    'color: #8fd0ff; font-weight: bold',
    'color: inherit',
    event.properties,
  );
};
