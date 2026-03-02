import type { ConfiguratorTemplateModule } from './types';
import { pergolaTemplate } from './pergola';

export const TEMPLATE_REGISTRY: ConfiguratorTemplateModule[] = [pergolaTemplate];

export const DEFAULT_TEMPLATE_ID = pergolaTemplate.id;

export const getTemplateById = (id: string): ConfiguratorTemplateModule =>
  TEMPLATE_REGISTRY.find((template) => template.id === id) ?? pergolaTemplate;
