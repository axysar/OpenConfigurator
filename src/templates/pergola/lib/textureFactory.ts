import * as THREE from 'three';
import type { TexturePreset } from './pergolaMath';

const CANVAS_SIZE = 384;
const textureCache = new Map<TexturePreset, THREE.Texture | null>();

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  return canvas;
};

const paintNoise = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha: number,
  grain: number,
): void => {
  for (let i = 0; i < width * height * grain; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const value = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgba(${value}, ${value}, ${value}, ${alpha})`;
    ctx.fillRect(x, y, 1.1, 1.1);
  }
};

const paintBrushedMetal = (ctx: CanvasRenderingContext2D): void => {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, '#9aa1a7');
  gradient.addColorStop(0.5, '#c1c6cc');
  gradient.addColorStop(1, '#7d848b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (let i = 0; i < 1100; i += 1) {
    const y = Math.random() * CANVAS_SIZE;
    const thickness = Math.random() * 0.8 + 0.35;
    const alpha = Math.random() * 0.12 + 0.06;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, y, CANVAS_SIZE, thickness);
  }

  paintNoise(ctx, CANVAS_SIZE, CANVAS_SIZE, 0.08, 0.2);
};

const paintOak = (ctx: CanvasRenderingContext2D): void => {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, '#7f4f2a');
  gradient.addColorStop(0.6, '#b0723e');
  gradient.addColorStop(1, '#6f4424');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (let i = 0; i < 320; i += 1) {
    const y = Math.random() * CANVAS_SIZE;
    const thickness = Math.random() * 3 + 0.8;
    const alpha = Math.random() * 0.2 + 0.1;
    const curve = Math.sin(y / 28) * 20;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(73, 41, 22, ${alpha})`;
    ctx.lineWidth = thickness;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      CANVAS_SIZE * 0.3,
      y + curve,
      CANVAS_SIZE * 0.7,
      y - curve,
      CANVAS_SIZE,
      y,
    );
    ctx.stroke();
  }

  paintNoise(ctx, CANVAS_SIZE, CANVAS_SIZE, 0.08, 0.16);
};

const paintSlate = (ctx: CanvasRenderingContext2D): void => {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, '#2d3748');
  gradient.addColorStop(0.45, '#434f61');
  gradient.addColorStop(1, '#1f2733');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (let i = 0; i < 450; i += 1) {
    const x = Math.random() * CANVAS_SIZE;
    const y = Math.random() * CANVAS_SIZE;
    const radius = Math.random() * 2.5 + 0.6;
    const alpha = Math.random() * 0.26 + 0.06;
    ctx.beginPath();
    ctx.fillStyle = `rgba(200, 206, 215, ${alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  paintNoise(ctx, CANVAS_SIZE, CANVAS_SIZE, 0.05, 0.2);
};

export const createPresetTexture = (preset: TexturePreset): THREE.Texture | null => {
  if (textureCache.has(preset)) {
    return textureCache.get(preset) ?? null;
  }

  if (preset === 'none') {
    textureCache.set(preset, null);
    return null;
  }

  const canvas = createCanvas();
  const context = canvas.getContext('2d');
  if (!context) {
    textureCache.set(preset, null);
    return null;
  }

  if (preset === 'brushed') {
    paintBrushedMetal(context);
  }

  if (preset === 'oak') {
    paintOak(context);
  }

  if (preset === 'slate') {
    paintSlate(context);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  textureCache.set(preset, texture);
  return texture;
};
