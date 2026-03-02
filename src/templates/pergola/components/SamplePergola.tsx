import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { MaterialPreset, PergolaDimensions } from '../lib/pergolaMath';

interface SamplePergolaProps {
  dimensions: PergolaDimensions;
  materialPreset: MaterialPreset;
  texture: THREE.Texture | null;
}

interface OriginalMaps {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  metalnessMap: THREE.Texture | null;
  aoMap: THREE.Texture | null;
  emissiveMap: THREE.Texture | null;
}

interface MaterialUserData {
  originalMaps?: OriginalMaps;
  textureVariants?: Record<string, THREE.Texture>;
}

const getMaterialData = (material: THREE.Material): MaterialUserData =>
  material.userData as MaterialUserData;

const rememberOriginalMaps = (material: THREE.MeshStandardMaterial): void => {
  const data = getMaterialData(material);
  if (data.originalMaps) {
    return;
  }

  data.originalMaps = {
    map: material.map ?? null,
    normalMap: material.normalMap ?? null,
    roughnessMap: material.roughnessMap ?? null,
    metalnessMap: material.metalnessMap ?? null,
    aoMap: material.aoMap ?? null,
    emissiveMap: material.emissiveMap ?? null,
  };
};

const getTextureVariant = (
  material: THREE.MeshStandardMaterial,
  texture: THREE.Texture,
): THREE.Texture => {
  const data = getMaterialData(material);
  if (!data.textureVariants) {
    data.textureVariants = {};
  }

  const originalMaps = data.originalMaps;
  const channel = originalMaps?.map?.channel ?? 0;
  const key = `${texture.uuid}-ch${channel}`;

  if (data.textureVariants[key]) {
    return data.textureVariants[key];
  }

  const variant = texture.clone();
  variant.channel = channel;
  variant.wrapS = texture.wrapS;
  variant.wrapT = texture.wrapT;
  variant.repeat.copy(texture.repeat);
  variant.offset.copy(texture.offset);
  variant.rotation = texture.rotation;
  variant.center.copy(texture.center);
  variant.anisotropy = texture.anisotropy;
  variant.colorSpace = texture.colorSpace;
  variant.needsUpdate = true;

  data.textureVariants[key] = variant;
  return variant;
};

const ensureMeshMaterialsAreUnique = (mesh: THREE.Mesh): void => {
  if (mesh.userData.hasUniqueMaterial) {
    return;
  }

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => material.clone());
  } else {
    mesh.material = mesh.material.clone();
  }

  mesh.userData.hasUniqueMaterial = true;
};

const tuneMaterial = (
  material: THREE.Material,
  materialPreset: MaterialPreset,
  texture: THREE.Texture | null,
): void => {
  const standard = material as THREE.MeshStandardMaterial;
  if (!('color' in standard)) {
    return;
  }

  rememberOriginalMaps(standard);
  const data = getMaterialData(standard);

  standard.metalness = materialPreset.metalness;
  standard.roughness = materialPreset.roughness;

  if (texture) {
    const texturedColor = new THREE.Color(materialPreset.color).lerp(new THREE.Color('#ffffff'), 0.42);
    standard.color.copy(texturedColor);
    standard.map = getTextureVariant(standard, texture);
    standard.normalMap = null;
    standard.roughnessMap = null;
    standard.metalnessMap = null;
    standard.aoMap = null;
    standard.emissiveMap = null;
    standard.roughness = Math.min(0.95, materialPreset.roughness + 0.08);
    standard.metalness = Math.max(0.02, materialPreset.metalness - 0.08);
  } else {
    standard.color.set(materialPreset.color);
    standard.map = data.originalMaps?.map ?? null;
    standard.normalMap = data.originalMaps?.normalMap ?? null;
    standard.roughnessMap = data.originalMaps?.roughnessMap ?? null;
    standard.metalnessMap = data.originalMaps?.metalnessMap ?? null;
    standard.aoMap = data.originalMaps?.aoMap ?? null;
    standard.emissiveMap = data.originalMaps?.emissiveMap ?? null;
  }

  const physical = standard as THREE.MeshPhysicalMaterial;
  if ('clearcoat' in physical) {
    physical.clearcoat = materialPreset.clearcoat;
    physical.clearcoatRoughness = materialPreset.clearcoatRoughness;
  }

  standard.needsUpdate = true;
};

export const SamplePergola = ({
  dimensions,
  materialPreset,
  texture,
}: SamplePergolaProps): JSX.Element => {
  const invalidate = useThree((state) => state.invalidate);
  const gltf = useGLTF('/models/pergola.glb');

  const modelRoot = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);

  const transform = useMemo(() => {
    const box = new THREE.Box3().setFromObject(modelRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    return {
      width: Math.max(size.x, 0.001),
      height: Math.max(size.y, 0.001),
      depth: Math.max(size.z, 0.001),
      center,
      floorY: box.min.y,
    };
  }, [modelRoot]);

  useEffect(() => {
    modelRoot.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = false;
      ensureMeshMaterialsAreUnique(mesh);

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => tuneMaterial(material, materialPreset, texture));
    });

    invalidate();
  }, [invalidate, materialPreset, modelRoot, texture]);

  useEffect(
    () => () => {
      modelRoot.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const data = getMaterialData(material);
          if (data.textureVariants) {
            Object.values(data.textureVariants).forEach((variant) => variant.dispose());
            data.textureVariants = {};
          }
        });
      });
    },
    [modelRoot],
  );

  const scale = useMemo<[number, number, number]>(
    () => [
      dimensions.width / transform.width,
      dimensions.height / transform.height,
      dimensions.depth / transform.depth,
    ],
    [dimensions, transform],
  );

  return (
    <group scale={scale}>
      <primitive
        object={modelRoot}
        position={[-transform.center.x, -transform.floorY, -transform.center.z]}
      />
    </group>
  );
};

useGLTF.preload('/models/pergola.glb');
