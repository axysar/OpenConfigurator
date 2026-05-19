import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SmoothCameraProps {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  speed?: number;
}

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentPos = new THREE.Vector3();
const _currentLook = new THREE.Vector3();

export const SmoothCamera = ({
  targetPosition,
  targetLookAt,
  controlsRef,
  speed = 4,
}: SmoothCameraProps): null => {
  const { camera, invalidate } = useThree();
  const isAnimating = useRef(false);

  useEffect(() => {
    _targetPos.set(...targetPosition);
    _targetLook.set(...targetLookAt);
    isAnimating.current = true;
    invalidate();
  }, [targetPosition, targetLookAt, invalidate]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    const t = 1 - Math.pow(0.001, delta * speed);

    _currentPos.copy(camera.position);
    _currentPos.lerp(_targetPos, t);
    camera.position.copy(_currentPos);

    if (controlsRef.current) {
      _currentLook.copy(controlsRef.current.target);
      _currentLook.lerp(_targetLook, t);
      controlsRef.current.target.copy(_currentLook);
      controlsRef.current.update();
    }

    camera.updateProjectionMatrix();

    if (_currentPos.distanceTo(_targetPos) < 0.01 && _currentLook.distanceTo(_targetLook) < 0.01) {
      camera.position.copy(_targetPos);
      if (controlsRef.current) {
        controlsRef.current.target.copy(_targetLook);
        controlsRef.current.update();
      }
      isAnimating.current = false;
    }

    invalidate();
  });

  return null;
};
