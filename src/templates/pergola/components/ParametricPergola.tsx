import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  buildPergolaModel,
  type BuildPergolaOptions,
  type MaterialPreset,
  type PergolaDimensions,
  type PergolaParameters,
} from '../lib/pergolaMath';

interface ParametricPergolaProps {
  dimensions: PergolaDimensions;
  parameters: PergolaParameters;
  materialPreset: MaterialPreset;
  texture: THREE.Texture | null;
  buildOptions?: BuildPergolaOptions;
}

const materialFrom = (
  materialPreset: MaterialPreset,
  texture: THREE.Texture | null,
): THREE.MeshPhysicalMaterial => {
  const material = new THREE.MeshPhysicalMaterial({
    color: materialPreset.color,
    metalness: materialPreset.metalness,
    roughness: materialPreset.roughness,
    clearcoat: materialPreset.clearcoat,
    clearcoatRoughness: materialPreset.clearcoatRoughness,
  });

  material.map = texture;
  if (texture) {
    material.roughness = Math.min(0.95, materialPreset.roughness + 0.08);
    material.metalness = Math.max(0.02, materialPreset.metalness - 0.08);
  }
  material.needsUpdate = true;

  return material;
};

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
    const part = parts[i];
    _pos.set(part.position[0], part.position[1], part.position[2]);
    _scale.set(part.size[0], part.size[1], part.size[2]);
    _matrix.compose(_pos, _quat, _scale);
    mesh.setMatrixAt(i, _matrix);
  }
  mesh.count = parts.length;
  mesh.instanceMatrix.needsUpdate = true;
};

export const ParametricPergola = ({
  dimensions,
  parameters,
  materialPreset,
  texture,
  buildOptions,
}: ParametricPergolaProps): JSX.Element => {
  const model = useMemo(
    () => buildPergolaModel(dimensions, parameters, materialPreset, buildOptions),
    [dimensions, materialPreset, parameters, buildOptions],
  );

  const frameMaterial = useMemo(
    () => materialFrom(materialPreset, texture),
    [materialPreset, texture],
  );
  const unitBoxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#cae5ff',
        roughness: 0.08,
        metalness: 0.05,
        transmission: 0.72,
        opacity: 0.72,
        transparent: true,
        thickness: 0.35,
      }),
    [],
  );

  const allFrameParts = useMemo(
    () => [...model.posts, ...model.beams, ...model.slats],
    [model.posts, model.beams, model.slats],
  );

  const maxFrameCount = Math.max(allFrameParts.length, 1);
  const maxGlassCount = Math.max(model.glassPanels.length, 1);

  const frameRef = useRef<THREE.InstancedMesh | null>(null);
  const glassRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    applyInstances(frameRef, allFrameParts);
  }, [allFrameParts]);

  useEffect(() => {
    applyInstances(glassRef, model.glassPanels);
  }, [model.glassPanels]);

  useEffect(
    () => () => {
      frameMaterial.dispose();
      unitBoxGeometry.dispose();
      glassMaterial.dispose();
    },
    [frameMaterial, glassMaterial, unitBoxGeometry],
  );

  return (
    <group>
      <instancedMesh
        ref={frameRef}
        args={[unitBoxGeometry, frameMaterial, maxFrameCount]}
        castShadow
        receiveShadow={false}
        frustumCulled={false}
      />
      {model.glassPanels.length > 0 && (
        <instancedMesh
          ref={glassRef}
          args={[unitBoxGeometry, glassMaterial, maxGlassCount]}
          castShadow={false}
          receiveShadow={false}
          frustumCulled={false}
        />
      )}
    </group>
  );
};
