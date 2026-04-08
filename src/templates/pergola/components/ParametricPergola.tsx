import { useEffect, useMemo } from 'react';
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
      {[...model.posts, ...model.beams, ...model.slats].map((part) => (
        <mesh
          key={part.id}
          position={part.position}
          scale={part.size}
          castShadow
          receiveShadow={false}
          geometry={unitBoxGeometry}
          material={frameMaterial}
        />
      ))}

      {model.glassPanels.map((panel) => (
        <mesh
          key={panel.id}
          position={panel.position}
          scale={panel.size}
          castShadow={false}
          receiveShadow={false}
          geometry={unitBoxGeometry}
          material={glassMaterial}
        />
      ))}
    </group>
  );
};
