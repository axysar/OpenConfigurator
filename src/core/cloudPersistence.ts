/**
 * Cloud Persistence & User Accounts
 *
 * Provides a backend-agnostic persistence layer. The default implementation
 * uses a REST API contract that can be backed by Supabase, Firebase, or any
 * custom backend. Falls back gracefully to localStorage when offline or
 * when no backend is configured.
 *
 * API contract:
 *   GET    /api/configs              → list user's saved configs
 *   GET    /api/configs/:id          → get a single config
 *   POST   /api/configs              → create a new config
 *   PUT    /api/configs/:id          → update a config
 *   DELETE /api/configs/:id          → delete a config
 *   GET    /api/configs/shared/:slug → get a shared config (public)
 *   POST   /api/configs/:id/share    → generate a share slug
 *
 *   POST   /api/auth/login           → OAuth callback
 *   GET    /api/auth/me              → current user profile
 *   POST   /api/auth/logout          → clear session
 */

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'github' | 'email';
}

export interface CloudConfig {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  spec: Record<string, unknown>;
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudPersistenceAdapter {
  isAvailable(): boolean;
  getUser(): Promise<CloudUser | null>;
  login(provider: 'google' | 'github'): Promise<CloudUser>;
  logout(): Promise<void>;
  listConfigs(): Promise<CloudConfig[]>;
  getConfig(id: string): Promise<CloudConfig | null>;
  saveConfig(templateId: string, name: string, spec: Record<string, unknown>): Promise<CloudConfig>;
  updateConfig(id: string, name: string, spec: Record<string, unknown>): Promise<CloudConfig>;
  deleteConfig(id: string): Promise<void>;
  getSharedConfig(slug: string): Promise<CloudConfig | null>;
  shareConfig(id: string): Promise<string>;
}

const API_BASE = typeof window !== 'undefined'
  ? (window as unknown as Record<string, unknown>).__OC_API_BASE__ as string | undefined
  : undefined;

const fetchJson = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const base = API_BASE ?? '/api';
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
};

export const createRestAdapter = (): CloudPersistenceAdapter => ({
  isAvailable: () => Boolean(API_BASE),

  getUser: () => fetchJson<CloudUser | null>('/auth/me').catch(() => null),

  login: async (provider) => {
    if (typeof window !== 'undefined') {
      window.location.href = `${API_BASE ?? '/api'}/auth/${provider}`;
    }
    return fetchJson<CloudUser>('/auth/me');
  },

  logout: () => fetchJson('/auth/logout', { method: 'POST' }),

  listConfigs: () => fetchJson<CloudConfig[]>('/configs'),

  getConfig: (id) => fetchJson<CloudConfig | null>(`/configs/${encodeURIComponent(id)}`),

  saveConfig: (templateId, name, spec) =>
    fetchJson<CloudConfig>('/configs', {
      method: 'POST',
      body: JSON.stringify({ templateId, name, spec }),
    }),

  updateConfig: (id, name, spec) =>
    fetchJson<CloudConfig>(`/configs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name, spec }),
    }),

  deleteConfig: (id) =>
    fetchJson(`/configs/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => undefined),

  getSharedConfig: (slug) =>
    fetchJson<CloudConfig | null>(`/configs/shared/${encodeURIComponent(slug)}`).catch(() => null),

  shareConfig: (id) =>
    fetchJson<{ slug: string }>(`/configs/${encodeURIComponent(id)}/share`, {
      method: 'POST',
    }).then((res) => res.slug),
});

export const createOfflineAdapter = (): CloudPersistenceAdapter => ({
  isAvailable: () => false,
  getUser: async () => null,
  login: async () => { throw new Error('Cloud persistence not configured'); },
  logout: async () => {},
  listConfigs: async () => [],
  getConfig: async () => null,
  saveConfig: async () => { throw new Error('Cloud persistence not configured'); },
  updateConfig: async () => { throw new Error('Cloud persistence not configured'); },
  deleteConfig: async () => {},
  getSharedConfig: async () => null,
  shareConfig: async () => { throw new Error('Cloud persistence not configured'); },
});

let _adapter: CloudPersistenceAdapter | null = null;

export const getCloudAdapter = (): CloudPersistenceAdapter => {
  if (!_adapter) {
    _adapter = API_BASE ? createRestAdapter() : createOfflineAdapter();
  }
  return _adapter;
};
