import type { ComponentType } from 'react';

export interface ConfiguratorTemplateModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  Component: ComponentType;
}
