/**
 * Template Marketplace Architecture
 *
 * Each template declares a manifest describing its capabilities,
 * version, author, and dependencies. The manifest is used for:
 *   - Template registry validation
 *   - Lazy-loading via dynamic import
 *   - Marketplace listing / discovery
 *   - Version compatibility checks
 */

export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  icon?: string;
  thumbnail?: string;
  minPlatformVersion: string;
  features: TemplateFeatureFlags;
}

export interface TemplateFeatureFlags {
  has3DScene: boolean;
  hasPricing: boolean;
  hasBom: boolean;
  hasEngineering: boolean;
  hasRules: boolean;
  hasExport: boolean;
  hasPdfSpecSheet: boolean;
}

export const PLATFORM_VERSION = '4.0.0';

const satisfiesVersion = (required: string, current: string): boolean => {
  const [rMajor] = required.split('.').map(Number);
  const [cMajor] = current.split('.').map(Number);
  return cMajor >= rMajor;
};

export const validateManifest = (manifest: TemplateManifest): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!manifest.id || typeof manifest.id !== 'string') errors.push('Missing or invalid id');
  if (!manifest.name || typeof manifest.name !== 'string') errors.push('Missing or invalid name');
  if (!manifest.version) errors.push('Missing version');
  if (!manifest.author) errors.push('Missing author');
  if (!manifest.category) errors.push('Missing category');
  if (!manifest.minPlatformVersion) errors.push('Missing minPlatformVersion');

  if (manifest.minPlatformVersion && !satisfiesVersion(manifest.minPlatformVersion, PLATFORM_VERSION)) {
    errors.push(`Template requires platform v${manifest.minPlatformVersion}, current is v${PLATFORM_VERSION}`);
  }

  if (!manifest.features || typeof manifest.features !== 'object') {
    errors.push('Missing features flags');
  }

  return { valid: errors.length === 0, errors };
};

export const PERGOLA_MANIFEST: TemplateManifest = {
  id: 'pergola',
  name: 'Pergola Configurator',
  version: '3.0.0',
  author: 'OpenConfigurator',
  tagline: 'Outdoor Living',
  description: 'Parametric pergola configuration with structural engineering, pricing, and exports.',
  category: 'Outdoor Structures',
  tags: ['pergola', 'outdoor', 'structural', 'engineering'],
  minPlatformVersion: '1.0.0',
  features: {
    has3DScene: true,
    hasPricing: true,
    hasBom: true,
    hasEngineering: true,
    hasRules: true,
    hasExport: true,
    hasPdfSpecSheet: true,
  },
};

export const KITCHEN_MANIFEST: TemplateManifest = {
  id: 'kitchen',
  name: 'Kitchen Configurator',
  version: '1.0.0',
  author: 'OpenConfigurator',
  tagline: 'Interior Design',
  description: 'Kitchen cabinet layout with door styles, finishes, countertop materials, and pricing.',
  category: 'Interior Design',
  tags: ['kitchen', 'cabinets', 'interior', 'countertop'],
  minPlatformVersion: '1.0.0',
  features: {
    has3DScene: true,
    hasPricing: true,
    hasBom: false,
    hasEngineering: false,
    hasRules: false,
    hasExport: false,
    hasPdfSpecSheet: false,
  },
};
