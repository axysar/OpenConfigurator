import { storage } from '@shared/index';
import { sanitizePergolaSpec, type PergolaSpec } from './pergolaSpec';

const SAVED_KEY = 'oc.pergola.saved';
const RECENT_KEY = 'oc.pergola.recent';

export interface SavedConfig {
  id: string;
  name: string;
  createdAt: number;
  spec: PergolaSpec;
}

const generateId = (): string =>
  `cfg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const loadSavedConfigs = (): SavedConfig[] => {
  const raw = storage.get<SavedConfig[]>(SAVED_KEY, []);
  return raw
    .filter((entry) => entry && typeof entry.id === 'string' && entry.spec)
    .map((entry) => ({
      ...entry,
      spec: sanitizePergolaSpec(entry.spec),
    }));
};

export const persistSavedConfigs = (configs: SavedConfig[]): void => {
  storage.set(SAVED_KEY, configs);
};

export const addSavedConfig = (name: string, spec: PergolaSpec): SavedConfig[] => {
  const list = loadSavedConfigs();
  const trimmed = name.trim() || `Configuration ${list.length + 1}`;
  const next: SavedConfig = {
    id: generateId(),
    name: trimmed,
    createdAt: Date.now(),
    spec: sanitizePergolaSpec(spec),
  };
  const updated = [next, ...list].slice(0, 12);
  persistSavedConfigs(updated);
  return updated;
};

export const removeSavedConfig = (id: string): SavedConfig[] => {
  const updated = loadSavedConfigs().filter((entry) => entry.id !== id);
  persistSavedConfigs(updated);
  return updated;
};

export const loadRecentSpec = (): PergolaSpec | null => {
  const raw = storage.get<PergolaSpec | null>(RECENT_KEY, null);
  return raw ? sanitizePergolaSpec(raw) : null;
};

export const persistRecentSpec = (spec: PergolaSpec): void => {
  storage.set(RECENT_KEY, spec);
};
