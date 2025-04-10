'use client';

import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function BoyModel({ wireframe = false }) {
  const { scene } = useGLTF('/models/FriendChar.glb');
  const modelRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          // Clone material if in wireframe mode
          if (wireframe) {
            child.material = child.material.clone();
          }

          child.material.side = THREE.DoubleSide;
          child.material.shadowSide = THREE.DoubleSide;
          child.material.wireframe = wireframe;
          child.material.needsUpdate = true;

          // Enhance material properties
          child.material.roughness = 0.8;
          child.material.metalness = 0.2;
          child.material.envMapIntensity = 1.0;
          child.material.normalScale = new THREE.Vector2(1, 1);
        }
      }
    });
  }, [scene, wireframe]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={3.5}
      castShadow
      receiveShadow
    />
  );
}

BoyModel.propTypes = {
  wireframe: PropTypes.bool,
};

useGLTF.preload('/models/FriendChar.glb');
