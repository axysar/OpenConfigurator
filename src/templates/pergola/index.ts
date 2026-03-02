import type { ConfiguratorTemplateModule } from '../types';
import PergolaTemplate from './PergolaTemplate';

export const pergolaTemplate: ConfiguratorTemplateModule = {
  id: 'pergola',
  name: 'Pergola Configurator',
  tagline: 'Outdoor Living',
  description:
    'Parametric pergola configuration with material presets, structural sizing, and real-time engineering metrics.',
  Component: PergolaTemplate,
};
