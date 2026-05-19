import type { ConfiguratorTemplateModule } from './types';
import { pergolaTemplate } from './pergola';
import { kitchenTemplate } from './kitchen';

export const TEMPLATE_REGISTRY: ConfiguratorTemplateModule[] = [
  pergolaTemplate,
  kitchenTemplate,
];

export const DEFAULT_TEMPLATE_ID = pergolaTemplate.id;

export const getTemplateById = (id: string): ConfiguratorTemplateModule =>
  TEMPLATE_REGISTRY.find((template) => template.id === id) ?? pergolaTemplate;
