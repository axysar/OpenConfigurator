import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { storage } from '@shared/index';

/**
 * Minimal i18n system. Each locale is a flat key-value map.
 * Translation keys use dot-separated namespaces:
 *   "shell.title", "pergola.step1.heading", "lead.submit"
 */

export type Locale = 'en' | 'es' | 'de' | 'fr' | 'ar';
export type TranslationMap = Record<string, string>;

const STORAGE_KEY = 'oc.locale';

const EN: TranslationMap = {
  'shell.brand': 'OpenConfigurator',
  'shell.title': 'General 3D Configurator Platform',
  'shell.template': 'Template',
  'shell.light': '☀ Light',
  'shell.dark': '☾ Dark',
  'pergola.hero.eyebrow': 'Pergola Studio 3D',
  'pergola.hero.title': 'Configurator',
  'pergola.hero.subtitle': 'Interactive GLB + mathematical pergola editor with live engineering, pricing, and exports.',
  'pergola.step.model': 'Model & Size',
  'pergola.step.material': 'Materials',
  'pergola.step.structure': 'Structure',
  'pergola.step.engineering': 'Engineering',
  'pergola.step.quote': 'Quote & Export',
  'pergola.model.sampleGlb': 'Sample GLB',
  'pergola.model.mathematical': 'Mathematical',
  'pergola.model.width': 'Width',
  'pergola.model.depth': 'Depth',
  'pergola.model.height': 'Height',
  'pergola.model.reapply': 'Reapply Selected Preset',
  'pergola.model.customDims': 'Using custom dimensions',
  'pergola.material.frame': 'Frame Material',
  'pergola.material.texture': 'Texture Style',
  'pergola.structure.formula': 'Live formula',
  'pergola.structure.hint': 'Physics model uses roof load + deflection and stress checks to auto-size beams and add bays/posts.',
  'pergola.structure.switchNote': 'Switch to Mathematical mode to edit structural variables live.',
  'pergola.structure.reset': 'Reset Structural Parameters',
  'pergola.engineering.loadScenario': 'Loading Scenario',
  'pergola.engineering.compliance': 'Compliance Snapshot',
  'pergola.engineering.metrics': 'Engineering Metrics',
  'pergola.quote.heading': 'Estimated Investment',
  'pergola.quote.bom': 'Bill of Materials',
  'pergola.quote.export': 'Export & Share',
  'pergola.quote.savedHeading': 'Saved Configurations',
  'pergola.quote.saveCurrent': '＋ Save current',
  'pergola.quote.noSaved': 'No saved configurations yet.',
  'pergola.quote.subtotal': 'Subtotal',
  'pergola.quote.tax': 'Tax (estimated)',
  'pergola.quote.total': 'Total',
  'undo': '↶ Undo',
  'redo': '↷ Redo',
  'reset': '⟲ Reset',
  'lead.heading': 'Request a Quote',
  'lead.name': 'Name *',
  'lead.email': 'Email *',
  'lead.phone': 'Phone',
  'lead.notes': 'Notes',
  'lead.submit': 'Get a Quote',
  'lead.privacy': 'Your configuration is automatically attached. We never share your data.',
  'lead.success': 'Thank you!',
  'lead.successDetail': 'Your quote request has been submitted. We will follow up within 1 business day.',
};

const ES: TranslationMap = {
  'shell.brand': 'OpenConfigurator',
  'shell.title': 'Plataforma de Configurador 3D',
  'shell.template': 'Plantilla',
  'shell.light': '☀ Claro',
  'shell.dark': '☾ Oscuro',
  'pergola.hero.eyebrow': 'Pérgola Studio 3D',
  'pergola.hero.title': 'Configurador',
  'pergola.hero.subtitle': 'Editor de pérgola interactivo con métricas de ingeniería, precios y exportaciones en tiempo real.',
  'pergola.step.model': 'Modelo y Tamaño',
  'pergola.step.material': 'Materiales',
  'pergola.step.structure': 'Estructura',
  'pergola.step.engineering': 'Ingeniería',
  'pergola.step.quote': 'Cotización',
  'pergola.model.sampleGlb': 'Modelo GLB',
  'pergola.model.mathematical': 'Matemático',
  'pergola.model.width': 'Ancho',
  'pergola.model.depth': 'Profundidad',
  'pergola.model.height': 'Altura',
  'pergola.model.reapply': 'Reaplicar Preset',
  'pergola.model.customDims': 'Usando dimensiones personalizadas',
  'pergola.material.frame': 'Material del Marco',
  'pergola.material.texture': 'Estilo de Textura',
  'pergola.structure.formula': 'Fórmula en vivo',
  'pergola.structure.hint': 'El modelo físico usa carga de techo + deflexión para dimensionar vigas y agregar pórticos/postes.',
  'pergola.structure.switchNote': 'Cambie al modo Matemático para editar variables estructurales.',
  'pergola.structure.reset': 'Restablecer Parámetros',
  'pergola.engineering.loadScenario': 'Escenario de Carga',
  'pergola.engineering.compliance': 'Estado de Cumplimiento',
  'pergola.engineering.metrics': 'Métricas de Ingeniería',
  'pergola.quote.heading': 'Inversión Estimada',
  'pergola.quote.bom': 'Lista de Materiales',
  'pergola.quote.export': 'Exportar y Compartir',
  'pergola.quote.savedHeading': 'Configuraciones Guardadas',
  'pergola.quote.saveCurrent': '＋ Guardar actual',
  'pergola.quote.noSaved': 'No hay configuraciones guardadas.',
  'pergola.quote.subtotal': 'Subtotal',
  'pergola.quote.tax': 'Impuesto (estimado)',
  'pergola.quote.total': 'Total',
  'undo': '↶ Deshacer',
  'redo': '↷ Rehacer',
  'reset': '⟲ Restablecer',
  'lead.heading': 'Solicitar Cotización',
  'lead.name': 'Nombre *',
  'lead.email': 'Correo *',
  'lead.phone': 'Teléfono',
  'lead.notes': 'Notas',
  'lead.submit': 'Solicitar Cotización',
  'lead.privacy': 'Su configuración se adjunta automáticamente. Nunca compartimos sus datos.',
  'lead.success': '¡Gracias!',
  'lead.successDetail': 'Su solicitud ha sido enviada. Le responderemos en 1 día hábil.',
};

const TRANSLATIONS: Record<Locale, TranslationMap> = {
  en: EN,
  es: ES,
  de: EN,
  fr: EN,
  ar: EN,
};

export const SUPPORTED_LOCALES: Array<{ id: Locale; label: string; dir: 'ltr' | 'rtl' }> = [
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'es', label: 'Español', dir: 'ltr' },
  { id: 'de', label: 'Deutsch', dir: 'ltr' },
  { id: 'fr', label: 'Français', dir: 'ltr' },
  { id: 'ar', label: 'العربية', dir: 'rtl' },
];

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const detectLocale = (): Locale => {
  const stored = storage.get<Locale | null>(STORAGE_KEY, null);
  if (stored && stored in TRANSLATIONS) return stored;
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.split('-')[0] as Locale;
    if (lang in TRANSLATIONS) return lang;
  }
  return 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storage.set(STORAGE_KEY, next);
    const meta = SUPPORTED_LOCALES.find((loc) => loc.id === next);
    if (meta) {
      document.documentElement.lang = next;
      document.documentElement.dir = meta.dir;
    }
  }, []);

  const dir = SUPPORTED_LOCALES.find((loc) => loc.id === locale)?.dir ?? 'ltr';

  const t = useCallback(
    (key: string): string => {
      const map = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
      return map[key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir, setLocale, t }),
    [locale, dir, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
