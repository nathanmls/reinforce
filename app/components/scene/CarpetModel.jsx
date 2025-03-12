'use client';

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function CarpetModel({ position = [0, -0.05, 0], rotation = [0, 0, 0], scale = 1.5, wireframe = false }) {
  // Using the ShadowModel as a base for our carpet
  const { scene } = useGLTF('/models/Carpet.glb');
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

          // Set a nice carpet color
          child.material.color = new THREE.Color('#E6D2BC');
          
          child.material.side = THREE.DoubleSide;
          child.material.shadowSide = THREE.DoubleSide;
          child.material.wireframe = wireframe;
          child.material.needsUpdate = true;
          
          // Adjust material properties for better shadows
          if ('metalness' in child.material) {
            child.material.metalness = 0.1;
            child.material.roughness = 0.8;
          }
        }
      }
    });

    // Cleanup
    return () => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [scene, wireframe]);

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      position={position} 
      rotation={rotation}
      scale={scale}
    />
  );
}

CarpetModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  wireframe: PropTypes.bool
};

// Preload the model
useGLTF.preload('/models/Carpet.glb');
