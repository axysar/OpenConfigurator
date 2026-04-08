/**
 * Region / climate driven structural load presets.
 *
 * The pergola structural solver previously used a single 0.8 kPa roof load.
 * This module exposes a small catalog of design scenarios so users can pick
 * the loading appropriate for their installation environment. Numbers are
 * representative for a residential pergola and are intended for early-design
 * feedback, not for permitted engineering submission.
 */
export interface LoadScenario {
  id: string;
  label: string;
  description: string;
  /** Combined design roof load in kPa (snow + service + small wind uplift). */
  roofLoadKPa: number;
  /** Lateral / wind pressure factor used to widen safety margins on posts. */
  lateralFactor: number;
}

export const LOAD_SCENARIOS: LoadScenario[] = [
  {
    id: 'standard',
    label: 'Standard Residential',
    description: 'Mild climate with negligible snow and light service load.',
    roofLoadKPa: 0.8,
    lateralFactor: 1.0,
  },
  {
    id: 'coastal',
    label: 'Coastal / High Wind',
    description: 'Higher lateral factor for sustained coastal wind exposure.',
    roofLoadKPa: 1.0,
    lateralFactor: 1.35,
  },
  {
    id: 'alpine',
    label: 'Alpine / Snow',
    description: 'Increased gravity load for moderate snow accumulation.',
    roofLoadKPa: 1.6,
    lateralFactor: 1.1,
  },
  {
    id: 'heavy_snow',
    label: 'Heavy Snow Belt',
    description: 'High snow load for cold-belt installations.',
    roofLoadKPa: 2.4,
    lateralFactor: 1.15,
  },
];

export const getLoadScenario = (id: string): LoadScenario =>
  LOAD_SCENARIOS.find((scenario) => scenario.id === id) ?? LOAD_SCENARIOS[0];
