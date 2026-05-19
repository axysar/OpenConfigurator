import { Html, Line } from '@react-three/drei';
import type { PergolaDimensions } from '../lib/pergolaMath';

interface DimensionLabelsProps {
  dimensions: PergolaDimensions;
  visible: boolean;
}

const LabelTag = ({ text }: { text: string }): JSX.Element => (
  <div
    style={{
      background: 'rgba(10, 20, 38, 0.88)',
      color: '#8fd0ff',
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      fontFamily: "'Space Grotesk', sans-serif",
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      border: '1px solid rgba(143, 208, 255, 0.4)',
      backdropFilter: 'blur(6px)',
      letterSpacing: '0.04em',
    }}
  >
    {text}
  </div>
);

export const DimensionLabels = ({
  dimensions,
  visible,
}: DimensionLabelsProps): JSX.Element | null => {
  if (!visible) return null;

  const hw = dimensions.width / 2;
  const hd = dimensions.depth / 2;
  const h = dimensions.height;
  const offset = 0.4;

  return (
    <group>
      {/* Width: front edge */}
      <Html position={[0, -0.1, hd + offset]} center>
        <LabelTag text={`W ${dimensions.width.toFixed(2)} m`} />
      </Html>
      <Line
        points={[[-hw, 0, hd + offset * 0.6], [hw, 0, hd + offset * 0.6]]}
        color="#8fd0ff"
        lineWidth={1.5}
        dashed
        dashScale={8}
        dashSize={1}
        gapSize={0.5}
      />

      {/* Depth: right edge */}
      <Html position={[hw + offset, -0.1, 0]} center>
        <LabelTag text={`D ${dimensions.depth.toFixed(2)} m`} />
      </Html>
      <Line
        points={[[hw + offset * 0.6, 0, -hd], [hw + offset * 0.6, 0, hd]]}
        color="#8fd0ff"
        lineWidth={1.5}
        dashed
        dashScale={8}
        dashSize={1}
        gapSize={0.5}
      />

      {/* Height: right-front corner */}
      <Html position={[hw + offset, h / 2, hd + offset]} center>
        <LabelTag text={`H ${dimensions.height.toFixed(2)} m`} />
      </Html>
      <Line
        points={[[hw + offset * 0.6, 0, hd + offset * 0.6], [hw + offset * 0.6, h, hd + offset * 0.6]]}
        color="#8fd0ff"
        lineWidth={1.5}
        dashed
        dashScale={8}
        dashSize={1}
        gapSize={0.5}
      />
    </group>
  );
};
