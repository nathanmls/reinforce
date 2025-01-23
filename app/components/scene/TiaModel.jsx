/**
 * TiaModel Component
 * 
 * A 3D model component for Tia, the virtual mentor character.
 * This component handles the loading, positioning, and animation
 * of Tia's 3D model in the scene.
 * 
 * Features:
 * - Dynamic model loading using GLTF
 * - Shadow casting and receiving
 * - Custom material properties
 * - Position and rotation controls
 */

'use client';

import { useRef, useEffect } from 'react';
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * TiaModel Component
 * 
 * Renders Tia's 3D model in the Welcome section of the scene.
 * The model is positioned to appear as if she's sitting on the floor,
 * creating a welcoming and approachable presence.
 * 
 * Features:
 * - Automatic shadow casting and receiving
 * - Positioned to interact with the scene's lighting
 * - Scaled to match other character models
 * 
 * @returns {JSX.Element} A primitive object containing the loaded GLTF model
 */
export default function TiaModel({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1.2, 
  clone = false,
  wireframe = false 
}) {
  // Load the 3D model
  const { scene } = useGLTF('/models/TiaChar.glb');
  const modelRef = useRef();

  // Create a cloned scene if needed
  const modelScene = clone ? scene.clone(true) : scene;

  // Configure shadows and materials
  useEffect(() => {
    if (!modelScene) return;

    modelScene.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          // Clone material if needed
          if (clone || wireframe) {
            child.material = child.material.clone();
          }

          // Set basic material properties
          child.material.side = THREE.DoubleSide; 
          child.material.shadowSide = THREE.DoubleSide;
          child.material.wireframe = wireframe;
          
          // Handle specific material types
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // PBR material properties
            child.material.roughness = 0.5; 
            child.material.metalness = 0.1; 
            child.material.envMapIntensity = 1.2; 
            
            // Normal map handling
            if (child.material.normalMap) {
              child.material.normalScale = new THREE.Vector2(0.8, 0.8); 
            }

            // AO map handling
            if (child.material.aoMap) {
              child.material.aoMapIntensity = 0.5; 
            }

            // Emissive handling
            if (child.material.emissiveMap) {
              child.material.emissive = new THREE.Color(0xffffff);
              child.material.emissiveIntensity = 0.2;
            }

            // Increase overall material brightness
            if (child.material.color) {
              const color = child.material.color.clone();
              color.multiplyScalar(1.2); 
              child.material.color = color;
            }
          }

          // Ensure material updates
          child.material.needsUpdate = true;
        }
      }
    });
  }, [modelScene, clone, wireframe]);

  return (
    <primitive
      ref={modelRef}
      object={modelScene}
      rotation={rotation}
      scale={scale}
      position={position}
      castShadow
      receiveShadow
    />
  );
}

TiaModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number,
  clone: PropTypes.bool,
  wireframe: PropTypes.bool
};

// Preload the model to improve performance
useGLTF.preload('/models/TiaChar.glb');
