/**
 * Advanced Rendering Module
 *
 * High-quality rendering features for sales collateral and marketing:
 * - HDRI environment lighting
 * - High-resolution (4K) screenshot export
 * - Turntable video frame capture for GIF/MP4 generation
 * - PBR material enhancement settings
 */

export interface RenderQualityPreset {
  id: string;
  label: string;
  dpr: number;
  width: number;
  height: number;
  antialias: boolean;
  shadowMapSize: number;
  toneMapping: 'aces' | 'reinhard' | 'linear';
  toneMappingExposure: number;
}

export const RENDER_PRESETS: RenderQualityPreset[] = [
  {
    id: 'preview',
    label: 'Preview (720p)',
    dpr: 1,
    width: 1280,
    height: 720,
    antialias: true,
    shadowMapSize: 1024,
    toneMapping: 'aces',
    toneMappingExposure: 1.0,
  },
  {
    id: 'standard',
    label: 'Standard (1080p)',
    dpr: 1,
    width: 1920,
    height: 1080,
    antialias: true,
    shadowMapSize: 2048,
    toneMapping: 'aces',
    toneMappingExposure: 1.0,
  },
  {
    id: 'high',
    label: 'High Quality (2K)',
    dpr: 2,
    width: 2560,
    height: 1440,
    antialias: true,
    shadowMapSize: 2048,
    toneMapping: 'aces',
    toneMappingExposure: 0.95,
  },
  {
    id: 'ultra',
    label: 'Ultra (4K)',
    dpr: 2,
    width: 3840,
    height: 2160,
    antialias: true,
    shadowMapSize: 4096,
    toneMapping: 'aces',
    toneMappingExposure: 0.9,
  },
];

export const getRenderPreset = (id: string): RenderQualityPreset =>
  RENDER_PRESETS.find((p) => p.id === id) ?? RENDER_PRESETS[1];

/**
 * Capture a high-resolution screenshot by temporarily resizing the
 * canvas to the target resolution, rendering one frame, and restoring.
 */
export const captureHighRes = (
  gl: { domElement: HTMLCanvasElement; render: (scene: unknown, camera: unknown) => void; setSize: (w: number, h: number) => void; setPixelRatio: (r: number) => void },
  scene: unknown,
  camera: unknown,
  preset: RenderQualityPreset,
): string | null => {
  const canvas = gl.domElement;
  const origWidth = canvas.width;
  const origHeight = canvas.height;
  const origDpr = window.devicePixelRatio;

  try {
    gl.setPixelRatio(preset.dpr);
    gl.setSize(preset.width, preset.height);
    gl.render(scene, camera);
    const dataUrl = canvas.toDataURL('image/png');

    gl.setPixelRatio(Math.min(origDpr, 2));
    gl.setSize(origWidth / origDpr, origHeight / origDpr);

    return dataUrl;
  } catch {
    return null;
  }
};

/**
 * Turntable frame capture — rotates the camera around the target
 * and captures N frames. Returns an array of PNG data URLs that
 * can be assembled into a GIF or MP4 on the client or server.
 */
export interface TurntableConfig {
  frameCount: number;
  preset: RenderQualityPreset;
  radius: number;
  height: number;
  targetY: number;
}

export const captureTurntableFrames = (
  gl: { domElement: HTMLCanvasElement; render: (scene: unknown, camera: unknown) => void; setSize: (w: number, h: number) => void; setPixelRatio: (r: number) => void },
  scene: unknown,
  camera: { position: { set: (x: number, y: number, z: number) => void }; lookAt: (x: number, y: number, z: number) => void; updateProjectionMatrix: () => void },
  config: TurntableConfig,
): string[] => {
  const frames: string[] = [];
  const canvas = gl.domElement;
  const origWidth = canvas.width;
  const origHeight = canvas.height;
  const origDpr = window.devicePixelRatio;

  gl.setPixelRatio(config.preset.dpr);
  gl.setSize(config.preset.width, config.preset.height);

  for (let i = 0; i < config.frameCount; i++) {
    const angle = (i / config.frameCount) * Math.PI * 2;
    const x = Math.cos(angle) * config.radius;
    const z = Math.sin(angle) * config.radius;

    camera.position.set(x, config.height, z);
    camera.lookAt(0, config.targetY, 0);
    camera.updateProjectionMatrix();
    gl.render(scene, camera);

    frames.push(canvas.toDataURL('image/png'));
  }

  gl.setPixelRatio(Math.min(origDpr, 2));
  gl.setSize(origWidth / origDpr, origHeight / origDpr);

  return frames;
};

/**
 * HDRI environment URLs — these are loaded at runtime via drei's
 * Environment component. The URLs point to public CDN-hosted HDRIs.
 * For self-hosted deployments, place .hdr files in /public/hdri/.
 */
export const HDRI_ENVIRONMENTS: Array<{ id: string; label: string; path: string }> = [
  { id: 'studio', label: 'Product Studio', path: '/hdri/studio.hdr' },
  { id: 'outdoor', label: 'Outdoor Garden', path: '/hdri/outdoor.hdr' },
  { id: 'sunset', label: 'Sunset Terrace', path: '/hdri/sunset.hdr' },
  { id: 'warehouse', label: 'Industrial', path: '/hdri/warehouse.hdr' },
];
