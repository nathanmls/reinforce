'use client';

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function GirlModel() {
  const { scene } = useGLTF('/models/girl-char.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Enhance material properties for better lighting
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.shadowSide = THREE.DoubleSide;
          child.material.needsUpdate = true;

          // Adjust material properties for better light response
          child.material.roughness = 0.8; // Less shiny
          child.material.metalness = 0.2; // Slight metallic quality
          child.material.envMapIntensity = 1.0; // Environment reflection
          child.material.normalScale = new THREE.Vector2(1, 1); // Normal map intensity
        }
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      rotation={[0, 0, 0]}
      scale={3.5}
      position={[0, 1.68, 0]}
      castShadow
      receiveShadow
    />
  );
}

// Preload the model
useGLTF.preload('/models/girl-char.glb');
