import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  buildKitchenModel,
  COUNTERTOP_MATERIALS,
  CABINET_FINISHES,
  type KitchenSpec,
  type KitchenModel,
} from '../lib/kitchenMath';

const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();

const applyInstances = (
  ref: React.RefObject<THREE.InstancedMesh | null>,
  parts: Array<{ position: [number, number, number]; size: [number, number, number] }>,
) => {
  const mesh = ref.current;
  if (!mesh) return;
  for (let i = 0; i < parts.length; i++) {
    _pos.set(parts[i].position[0], parts[i].position[1], parts[i].position[2]);
    _scale.set(parts[i].size[0], parts[i].size[1], parts[i].size[2]);
    _matrix.compose(_pos, _quat, _scale);
    mesh.setMatrixAt(i, _matrix);
  }
  mesh.count = parts.length;
  mesh.instanceMatrix.needsUpdate = true;
};

const KitchenModel3D = ({ model, spec }: { model: KitchenModel; spec: KitchenSpec }): JSX.Element => {
  const finishDef = CABINET_FINISHES.find((f) => f.id === spec.finish) ?? CABINET_FINISHES[0];
  const counterDef = COUNTERTOP_MATERIALS.find((c) => c.id === spec.countertop) ?? COUNTERTOP_MATERIALS[0];

  const baseUnits = useMemo(() => model.units.filter((u) => u.type === 'base'), [model.units]);
  const wallUnits = useMemo(() => model.units.filter((u) => u.type === 'wall'), [model.units]);

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const cabinetMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: finishDef.swatch, roughness: 0.6, metalness: 0.05 }),
    [finishDef.swatch],
  );
  const counterMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: counterDef.color, roughness: 0.25, metalness: 0.08 }),
    [counterDef.color],
  );
  const wallCabMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: finishDef.swatch, roughness: 0.55, metalness: 0.05 }),
    [finishDef.swatch],
  );

  const baseRef = useRef<THREE.InstancedMesh | null>(null);
  const wallRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => { applyInstances(baseRef, baseUnits); }, [baseUnits]);
  useEffect(() => { applyInstances(wallRef, wallUnits); }, [wallUnits]);

  useEffect(() => () => {
    boxGeo.dispose();
    cabinetMat.dispose();
    counterMat.dispose();
    wallCabMat.dispose();
  }, [boxGeo, cabinetMat, counterMat, wallCabMat]);

  return (
    <group>
      <instancedMesh ref={baseRef} args={[boxGeo, cabinetMat, Math.max(baseUnits.length, 1)]} castShadow frustumCulled={false} />
      <instancedMesh ref={wallRef} args={[boxGeo, wallCabMat, Math.max(wallUnits.length, 1)]} castShadow frustumCulled={false} />
      {model.countertop && (
        <mesh position={model.countertop.position} scale={model.countertop.size} castShadow material={counterMat} geometry={boxGeo} />
      )}
      {/* Back wall */}
      <mesh position={[0, 1.2, -0.32]} receiveShadow>
        <boxGeometry args={[model.countertop?.size[0] ?? 3.6, 2.4, 0.02]} />
        <meshStandardMaterial color="#e8e5e0" roughness={0.9} />
      </mesh>
      {/* Floor */}
      <mesh position={[0, -0.005, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#d4cfc8" roughness={0.85} />
      </mesh>
    </group>
  );
};

const CameraSetup = ({ wallLength }: { wallLength: number }): null => {
  const { camera } = useThree();
  useEffect(() => {
    const dist = wallLength * 0.9 + 1.5;
    camera.position.set(0, 1.4, dist);
    camera.lookAt(0, 0.9, 0);
    camera.updateProjectionMatrix();
  }, [camera, wallLength]);
  return null;
};

interface KitchenSceneProps {
  spec: KitchenSpec;
}

export const KitchenScene = ({ spec }: KitchenSceneProps): JSX.Element => {
  const model = useMemo(() => buildKitchenModel(spec), [spec]);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 1.4, 4], fov: 45, near: 0.1, far: 50 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#f0ece6']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={0.9} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-2, 4, -2]} intensity={0.3} color="#dde5f0" />

      <Suspense fallback={null}>
        <KitchenModel3D model={model} spec={spec} />
        <ContactShadows position={[0, 0.01, 0.3]} frames={1} resolution={256} blur={1.8} opacity={0.3} width={10} height={6} far={4} color="#3a3530" />
      </Suspense>

      <CameraSetup wallLength={spec.wallLength} />
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} minDistance={1.5} maxDistance={8} target={[0, 0.9, 0]} />
    </Canvas>
  );
};
