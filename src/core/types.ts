import type { ComponentType } from 'react';

/**
 * Public contract for a configurator template.
 *
 * A template is a self-contained configurator (e.g. pergola, kitchen,
 * door system) registered in the global registry. The shell is responsible
 * for rendering the template inside a chrome that provides theme,
 * undo history, save/load and export functionality.
 */
export interface ConfiguratorTemplateModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Optional thumbnail / icon for picker UIs. */
  icon?: string;
  Component: ComponentType;
}
