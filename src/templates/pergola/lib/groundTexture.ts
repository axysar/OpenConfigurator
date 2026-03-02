import * as THREE from 'three';

const SIZE = 512;
let grassTextureCache: THREE.Texture | null = null;

export const createGrassTexture = (): THREE.Texture => {
  if (grassTextureCache) {
    return grassTextureCache;
  }

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.colorSpace = THREE.SRGBColorSpace;
    grassTextureCache = fallback;
    return fallback;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, SIZE);
  gradient.addColorStop(0, '#6da85d');
  gradient.addColorStop(0.45, '#5d954d');
  gradient.addColorStop(1, '#487b3f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 28000; i += 1) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const alpha = Math.random() * 0.24;
    ctx.fillStyle = `rgba(14, 39, 11, ${alpha})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const height = Math.random() * 6 + 1;
    const width = Math.random() * 1.4 + 0.3;

    ctx.fillStyle = `rgba(140, 190, 112, ${Math.random() * 0.25 + 0.08})`;
    ctx.fillRect(x, y, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 28);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  grassTextureCache = texture;
  return texture;
};
