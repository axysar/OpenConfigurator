import { useState } from 'react';
import { Html } from '@react-three/drei';
import type { PergolaMetrics } from '../lib/pergolaMath';

interface PartHotspotsProps {
  metrics: PergolaMetrics;
  visible: boolean;
  height: number;
}

interface HotspotDef {
  id: string;
  label: string;
  position: [number, number, number];
  info: (m: PergolaMetrics) => string;
}

const createHotspots = (metrics: PergolaMetrics, height: number): HotspotDef[] => [
  {
    id: 'post',
    label: 'Post',
    position: [0, height * 0.35, 0],
    info: () => `${Math.round(metrics.postThicknessM * 1000)} mm section • ${metrics.postCount} posts total`,
  },
  {
    id: 'beam',
    label: 'Beam',
    position: [0, height - 0.1, 0],
    info: () => `${Math.round(metrics.beamWidthM * 1000)}×${Math.round(metrics.beamDepthM * 1000)} mm • ${metrics.bayCountX}×${metrics.bayCountZ} bays`,
  },
  {
    id: 'slat',
    label: 'Slats',
    position: [0, height - 0.25, 0],
    info: () => `${metrics.slatCount} slats • ${metrics.shadeCoveragePct.toFixed(0)}% shade coverage`,
  },
  {
    id: 'footprint',
    label: 'Footprint',
    position: [0, 0.05, 0],
    info: () => `${metrics.footprintM2.toFixed(1)} m² • ${metrics.perimeterM.toFixed(1)} m perimeter`,
  },
];

const HotspotDot = ({
  hotspot,
  metrics,
}: {
  hotspot: HotspotDef;
  metrics: PergolaMetrics;
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Html position={hotspot.position} center>
      <div
        className="hotspot-container"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-label={`Info: ${hotspot.label}`}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
      >
        <div className="hotspot-dot" aria-hidden>
          <span className="hotspot-ping" />
        </div>
        {open && (
          <div className="hotspot-popup" role="tooltip">
            <strong>{hotspot.label}</strong>
            <span>{hotspot.info(metrics)}</span>
          </div>
        )}
      </div>
    </Html>
  );
};

export const PartHotspots = ({
  metrics,
  visible,
  height,
}: PartHotspotsProps): JSX.Element | null => {
  if (!visible) return null;

  const hotspots = createHotspots(metrics, height);

  return (
    <group>
      {hotspots.map((hs) => (
        <HotspotDot key={hs.id} hotspot={hs} metrics={metrics} />
      ))}
    </group>
  );
};
