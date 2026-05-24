import type { ConfiguratorTemplateModule } from '@core/types';
import KitchenTemplate from './KitchenTemplate';

export const kitchenTemplate: ConfiguratorTemplateModule = {
  id: 'kitchen',
  name: 'Kitchen Configurator',
  tagline: 'Interior Design',
  description:
    'Kitchen cabinet layout configurator with door styles, finishes, countertop materials, and real-time pricing.',
  Component: KitchenTemplate,
};
