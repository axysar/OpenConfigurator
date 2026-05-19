/**
 * Observability & Production Operations Module
 *
 * Provides:
 * - Error tracking integration (Sentry-compatible)
 * - Performance monitoring with Web Vitals
 * - Feature flags (runtime toggles)
 * - Health check endpoint data
 * - Deployment metadata
 */

// ---- Error Tracking (Sentry-compatible) ----

export interface ErrorTracker {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
  setUser(user: { id: string; email?: string }): void;
  setTag(key: string, value: string): void;
}

let _errorTracker: ErrorTracker | null = null;

export const initErrorTracking = (dsn: string): void => {
  if (typeof window === 'undefined' || !dsn) return;

  _errorTracker = {
    captureException(error, context) {
      console.error('[OC Error Tracking]', error, context);
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Sentry) {
        const sentry = (window as unknown as Record<string, unknown>).Sentry as {
          captureException: (e: Error, ctx?: Record<string, unknown>) => void;
        };
        sentry.captureException(error, context);
      }
    },
    captureMessage(message, level = 'info') {
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log']('[OC]', message);
    },
    setUser(user) {
      if ((window as unknown as Record<string, unknown>).Sentry) {
        const sentry = (window as unknown as Record<string, unknown>).Sentry as {
          setUser: (u: Record<string, unknown>) => void;
        };
        sentry.setUser(user);
      }
    },
    setTag(key, value) {
      if ((window as unknown as Record<string, unknown>).Sentry) {
        const sentry = (window as unknown as Record<string, unknown>).Sentry as {
          setTag: (k: string, v: string) => void;
        };
        sentry.setTag(key, value);
      }
    },
  };

  window.addEventListener('unhandledrejection', (event) => {
    _errorTracker?.captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledrejection' },
    );
  });
};

export const getErrorTracker = (): ErrorTracker | null => _errorTracker;

// ---- Web Vitals ----

export interface WebVitals {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export const measureWebVitals = (): Promise<Partial<WebVitals>> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.performance) {
      resolve({});
      return;
    }

    const vitals: Partial<WebVitals> = {};

    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      vitals.ttfb = navEntries[0].responseStart;
    }

    const paintEntries = performance.getEntriesByType('paint');
    for (const entry of paintEntries) {
      if (entry.name === 'first-contentful-paint') {
        vitals.fcp = entry.startTime;
      }
    }

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          vitals.lcp = entries[entries.length - 1].startTime;
        }
        lcpObserver.disconnect();
        resolve(vitals);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      setTimeout(() => {
        lcpObserver.disconnect();
        resolve(vitals);
      }, 5000);
    } catch {
      resolve(vitals);
    }
  });
};

// ---- Feature Flags ----

export interface FeatureFlags {
  [key: string]: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  'ai_assistant': false,
  'ar_preview': false,
  'cloud_persistence': false,
  'collaboration': false,
  'advanced_rendering': false,
  'enterprise_rbac': false,
  'ecommerce_cart': false,
};

let _flags: FeatureFlags = { ...DEFAULT_FLAGS };

export const initFeatureFlags = (overrides?: FeatureFlags): void => {
  if (overrides) {
    _flags = { ...DEFAULT_FLAGS, ...overrides };
  }

  if (typeof window !== 'undefined') {
    const urlFlags = new URLSearchParams(window.location.search);
    for (const [key, value] of urlFlags.entries()) {
      if (key.startsWith('ff_')) {
        _flags[key.slice(3)] = value === 'true' || value === '1';
      }
    }
  }
};

export const isFeatureEnabled = (flag: string): boolean =>
  _flags[flag] ?? false;

export const getFeatureFlags = (): Readonly<FeatureFlags> => ({ ..._flags });

export const setFeatureFlag = (flag: string, enabled: boolean): void => {
  _flags[flag] = enabled;
};

// ---- Health Check ----

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  buildTime: string;
  uptime: number;
  checks: Record<string, boolean>;
}

const startTime = Date.now();

export const getHealthStatus = (): HealthStatus => {
  const checks: Record<string, boolean> = {
    dom: typeof document !== 'undefined',
    webgl: checkWebGL(),
    localStorage: checkLocalStorage(),
  };

  const allHealthy = Object.values(checks).every(Boolean);

  return {
    status: allHealthy ? 'healthy' : checks.webgl ? 'degraded' : 'unhealthy',
    version: '4.0.0',
    buildTime: '__BUILD_TIME__',
    uptime: Date.now() - startTime,
    checks,
  };
};

const checkWebGL = (): boolean => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const checkLocalStorage = (): boolean => {
  try {
    const key = '__oc_health__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
