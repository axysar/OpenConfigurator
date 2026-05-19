/**
 * Scene environment presets — lets users visualize their pergola
 * in different lighting conditions / contexts.
 */
export interface SceneEnvironment {
  id: string;
  label: string;
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunPosition: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
  groundColor: string;
  turbidity: number;
  rayleigh: number;
}

export const SCENE_ENVIRONMENTS: SceneEnvironment[] = [
  {
    id: 'day',
    label: 'Daylight',
    skyColor: '#b8d6ff',
    fogColor: '#b8d6ff',
    fogNear: 28,
    fogFar: 95,
    sunPosition: [12, 8, -4],
    sunIntensity: 1.08,
    ambientIntensity: 0.45,
    groundColor: '#88a978',
    turbidity: 8,
    rayleigh: 1.2,
  },
  {
    id: 'sunset',
    label: 'Golden Hour',
    skyColor: '#f5c882',
    fogColor: '#edc490',
    fogNear: 22,
    fogFar: 80,
    sunPosition: [18, 2, -6],
    sunIntensity: 0.85,
    ambientIntensity: 0.35,
    groundColor: '#9a8860',
    turbidity: 12,
    rayleigh: 2.6,
  },
  {
    id: 'overcast',
    label: 'Overcast',
    skyColor: '#c5cdd8',
    fogColor: '#bec6d2',
    fogNear: 20,
    fogFar: 70,
    sunPosition: [5, 12, 2],
    sunIntensity: 0.55,
    ambientIntensity: 0.65,
    groundColor: '#7a8f6e',
    turbidity: 18,
    rayleigh: 0.4,
  },
  {
    id: 'night',
    label: 'Night',
    skyColor: '#0c1528',
    fogColor: '#0a1220',
    fogNear: 18,
    fogFar: 60,
    sunPosition: [-8, -2, 4],
    sunIntensity: 0.08,
    ambientIntensity: 0.18,
    groundColor: '#2a3528',
    turbidity: 2,
    rayleigh: 0.1,
  },
  {
    id: 'studio',
    label: 'Studio',
    skyColor: '#e8ecf2',
    fogColor: '#e0e5ee',
    fogNear: 30,
    fogFar: 120,
    sunPosition: [6, 16, 8],
    sunIntensity: 1.35,
    ambientIntensity: 0.7,
    groundColor: '#b8c0cc',
    turbidity: 0.4,
    rayleigh: 0.05,
  },
];

export const getSceneEnvironment = (id: string): SceneEnvironment =>
  SCENE_ENVIRONMENTS.find((env) => env.id === id) ?? SCENE_ENVIRONMENTS[0];
