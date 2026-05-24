import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { createPresetTexture } from '../lib/textureFactory';
import { createGrassTexture } from '../lib/groundTexture';
import { type SceneEnvironment, SCENE_ENVIRONMENTS } from '../lib/sceneEnvironments';
import {
  type BuildPergolaOptions,
  type MaterialPreset,
  type ModelMode,
  type PergolaDimensions,
  type PergolaParameters,
  type PergolaMetrics,
  type TexturePreset,
  buildPergolaModel,
} from '../lib/pergolaMath';
import { ParametricPergola } from './ParametricPergola';
import { SamplePergola } from './SamplePergola';
import { DimensionLabels } from './DimensionLabels';
import { PartHotspots } from './PartHotspots';
import { SmoothCamera } from './SmoothCamera';

export type ViewPreset = 'orbit' | 'front' | 'side' | 'top';

export interface SceneCaptureHandle {
  takeScreenshot: () => string | null;
  setViewPreset: (preset: ViewPreset) => void;
}

interface SceneCanvasProps {
  mode: ModelMode;
  dimensions: PergolaDimensions;
  parameters: PergolaParameters;
  materialPreset: MaterialPreset;
  texturePreset: TexturePreset;
  buildOptions?: BuildPergolaOptions;
  viewPreset?: ViewPreset;
  captureRef?: RefObject<SceneCaptureHandle>;
  showDimensions?: boolean;
  showHotspots?: boolean;
  autoRotate?: boolean;
  environmentId?: string;
}

const positionForPreset = (
  preset: ViewPreset,
  dimensions: PergolaDimensions,
): { position: [number, number, number]; targetY: number } => {
  const maxPlanSize = Math.max(dimensions.width, dimensions.depth);
  const distance = maxPlanSize * 1.6 + dimensions.height * 1.45;
  const targetY = dimensions.height * 0.42;
  const cameraHeight = Math.max(3.2, dimensions.height * 1.45);

  switch (preset) {
    case 'front':
      return { position: [0, dimensions.height * 0.55, distance], targetY };
    case 'side':
      return { position: [distance, dimensions.height * 0.55, 0], targetY };
    case 'top':
      return { position: [0.0001, distance * 1.4, 0.0001], targetY: 0 };
    case 'orbit':
    default:
      return { position: [distance, cameraHeight, distance], targetY };
  }
};

interface CameraFitProps {
  dimensions: PergolaDimensions;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  viewPreset: ViewPreset;
  useSmoothTransition: boolean;
}

const CameraFit = ({ dimensions, controlsRef, viewPreset, useSmoothTransition }: CameraFitProps): JSX.Element | null => {
  const { camera } = useThree();
  const { position, targetY } = useMemo(
    () => positionForPreset(viewPreset, dimensions),
    [viewPreset, dimensions],
  );
  const maxPlanSize = Math.max(dimensions.width, dimensions.depth);
  const distance = maxPlanSize * 1.6 + dimensions.height * 1.45;

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = Math.max(2.8, maxPlanSize * 0.7);
      controlsRef.current.maxDistance = distance * 3.4;
    }
    camera.near = 0.1;
    camera.far = 200;
    camera.updateProjectionMatrix();
  }, [camera, controlsRef, maxPlanSize, distance]);

  if (useSmoothTransition) {
    return (
      <SmoothCamera
        targetPosition={position}
        targetLookAt={[0, targetY, 0]}
        controlsRef={controlsRef}
        speed={5}
      />
    );
  }

  useEffect(() => {
    camera.position.set(...position);
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, targetY, 0);
      controlsRef.current.update();
    }
  }, [camera, controlsRef, position, targetY]);

  return null;
};

interface CaptureBridgeProps {
  captureRef: RefObject<SceneCaptureHandle>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  dimensions: PergolaDimensions;
}

const CaptureBridge = ({ captureRef, controlsRef, dimensions }: CaptureBridgeProps): null => {
  const { gl, scene, camera, invalidate } = useThree();

  useEffect(() => {
    if (!captureRef) return;
    const handle: SceneCaptureHandle = {
      takeScreenshot(): string | null {
        try {
          gl.render(scene, camera);
          return gl.domElement.toDataURL('image/png');
        } catch {
          return null;
        }
      },
      setViewPreset(preset: ViewPreset): void {
        const { position: pos, targetY } = positionForPreset(preset, dimensions);
        camera.position.set(...pos);
        camera.lookAt(0, targetY, 0);
        camera.updateProjectionMatrix();
        if (controlsRef.current) {
          controlsRef.current.target.set(0, targetY, 0);
          controlsRef.current.update();
        }
        invalidate();
      },
    };
    (captureRef as { current: SceneCaptureHandle | null }).current = handle;
  }, [captureRef, controlsRef, gl, scene, camera, dimensions, invalidate]);

  return null;
};

const Ground = ({ texture, color }: { texture: THREE.Texture; color: string }): JSX.Element => (
  <group>
    <mesh position={[0, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial map={texture} color={color} roughness={0.97} metalness={0.02} />
    </mesh>
    <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[16, 90]} />
      <meshStandardMaterial color="#7ba05f" roughness={0.95} metalness={0.01} />
    </mesh>
  </group>
);

export const SceneCanvas = ({
  mode,
  dimensions,
  parameters,
  materialPreset,
  texturePreset,
  buildOptions,
  viewPreset = 'orbit',
  captureRef,
  showDimensions = false,
  showHotspots = false,
  autoRotate = false,
  environmentId = 'day',
}: SceneCanvasProps): JSX.Element => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const hasInteracted = useRef(false);

  const env: SceneEnvironment = useMemo(
    () => SCENE_ENVIRONMENTS.find((e) => e.id === environmentId) ?? SCENE_ENVIRONMENTS[0],
    [environmentId],
  );

  const frameTexture = useMemo(() => createPresetTexture(texturePreset), [texturePreset]);
  const grassTexture = useMemo(() => createGrassTexture(), []);
  const maxPlanSize = useMemo(
    () => Math.max(dimensions.width, dimensions.depth),
    [dimensions.depth, dimensions.width],
  );

  const metrics: PergolaMetrics | null = useMemo(() => {
    if (!showHotspots) return null;
    return buildPergolaModel(dimensions, parameters, materialPreset, buildOptions).metrics;
  }, [showHotspots, dimensions, parameters, materialPreset, buildOptions]);

  const contactShadowKey = useMemo(
    () =>
      [
        mode,
        dimensions.width.toFixed(2),
        dimensions.depth.toFixed(2),
        dimensions.height.toFixed(2),
        parameters.postThickness.toFixed(3),
        parameters.beamThickness.toFixed(3),
        environmentId,
      ].join('-'),
    [mode, dimensions.width, dimensions.depth, dimensions.height, parameters.postThickness, parameters.beamThickness, environmentId],
  );

  return (
    <Canvas
      frameloop={autoRotate ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      performance={{ min: 0.7 }}
      shadows
      camera={{ position: [8, 4.2, 8], fov: 42, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
    >
      <color attach="background" args={[env.skyColor]} />
      <fog attach="fog" args={[env.fogColor, env.fogNear, env.fogFar]} />

      <Sky
        distance={450000}
        sunPosition={env.sunPosition}
        inclination={0.48}
        azimuth={0.19}
        rayleigh={env.rayleigh}
        turbidity={env.turbidity}
        mieCoefficient={0.006}
        mieDirectionalG={0.85}
      />

      <ambientLight intensity={env.ambientIntensity} />
      <hemisphereLight args={['#ffffff', '#7ea05f', 0.48]} />
      <directionalLight
        position={[10, 14, 7]}
        intensity={env.sunIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={34}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <directionalLight position={[-9, 7, -8]} intensity={env.sunIntensity * 0.32} color="#d7e7ff" />

      <Suspense fallback={null}>
        {mode === 'sample' ? (
          <SamplePergola dimensions={dimensions} materialPreset={materialPreset} texture={frameTexture} />
        ) : (
          <ParametricPergola dimensions={dimensions} parameters={parameters} materialPreset={materialPreset} texture={frameTexture} buildOptions={buildOptions} />
        )}

        <DimensionLabels dimensions={dimensions} visible={showDimensions} />
        {metrics && <PartHotspots metrics={metrics} visible={showHotspots} height={dimensions.height} />}
        <Ground texture={grassTexture} color={env.groundColor} />
        <ContactShadows
          key={contactShadowKey}
          position={[0, 0.015, 0]}
          frames={1}
          resolution={256}
          blur={1.45}
          opacity={0.35}
          width={Math.max(9, maxPlanSize * 2.2)}
          height={Math.max(9, maxPlanSize * 2.2)}
          far={Math.max(8, maxPlanSize * 1.7)}
          color="#1d3a20"
        />
      </Suspense>

      <CameraFit
        dimensions={dimensions}
        controlsRef={controlsRef}
        viewPreset={viewPreset}
        useSmoothTransition={hasInteracted.current}
      />
      {captureRef ? (
        <CaptureBridge captureRef={captureRef} controlsRef={controlsRef} dimensions={dimensions} />
      ) : null}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.09}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        onChange={() => { hasInteracted.current = true; }}
      />
    </Canvas>
  );
};
