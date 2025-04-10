// app/hooks/useGroupPositionUpdate.js
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useGroupPositionUpdate = (
  groupRef,
  heroProgress,
  comingSoonProgress
) => {
  useFrame(() => {
    if (!groupRef.current) return;

    // Group position (always update regardless of exploration mode)
    const targetGroupY =
      comingSoonProgress < 1
        ? THREE.MathUtils.lerp(0, -9.5, heroProgress)
        : -9.5;
    groupRef.current.position.y +=
      (targetGroupY - groupRef.current.position.y) * 0.1;
  });
};
