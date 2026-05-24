import { lazy } from 'react';
import type { ConfiguratorTemplateModule } from './types';
import { pergolaTemplate } from './pergola';

const LazyKitchenTemplate = lazy(() =>
  import('./kitchen/KitchenTemplate').then((mod) => ({ default: mod.default })),
);

const kitchenTemplateLazy: ConfiguratorTemplateModule = {
  id: 'kitchen',
  name: 'Kitchen Configurator',
  tagline: 'Interior Design',
  description: 'Kitchen cabinet layout with door styles, finishes, countertop materials, and pricing.',
  Component: LazyKitchenTemplate,
};

export const TEMPLATE_REGISTRY: ConfiguratorTemplateModule[] = [
  pergolaTemplate,
  kitchenTemplateLazy,
];

export const DEFAULT_TEMPLATE_ID = pergolaTemplate.id;

export const getTemplateById = (id: string): ConfiguratorTemplateModule =>
  TEMPLATE_REGISTRY.find((template) => template.id === id) ?? pergolaTemplate;
