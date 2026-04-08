import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@shared/index';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'oc.theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const detectInitialTheme = (): ThemeMode => {
  const stored = storage.get<ThemeMode | null>(STORAGE_KEY, null);
  if (stored === 'dark' || stored === 'light') return stored;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

export const ThemeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [theme, setThemeState] = useState<ThemeMode>(detectInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
