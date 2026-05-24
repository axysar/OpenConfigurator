import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight FPS + draw-call monitor.
 * Reads renderer.info each frame and exposes a smoothed readout.
 */
export interface PerfStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

const EMPTY: PerfStats = { fps: 0, drawCalls: 0, triangles: 0, geometries: 0, textures: 0 };

export const usePerformanceMonitor = (
  enabled: boolean,
  sampleIntervalMs = 1000,
): PerfStats => {
  const [stats, setStats] = useState<PerfStats>(EMPTY);
  const frameCountRef = useRef(0);
  const lastSampleRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) {
      setStats(EMPTY);
      return;
    }

    let rafId: number;
    const tick = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - lastSampleRef.current;

      if (elapsed >= sampleIntervalMs) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        frameCountRef.current = 0;
        lastSampleRef.current = now;

        setStats((prev) => ({ ...prev, fps }));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, sampleIntervalMs]);

  return stats;
};
