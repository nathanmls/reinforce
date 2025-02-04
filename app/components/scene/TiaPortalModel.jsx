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
 * - Clipping plane support
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
 * - Clipping plane support
 * 
 * @returns {JSX.Element} A primitive object containing the loaded GLTF model
 */
export default function TiaPortalModel({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1.2, 
  clone = false,
  wireframe = false,
  clippingPlanes = []
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
        
        // Apply material properties
        if (child.material) {
          // Clone material if needed
          if (clone || wireframe) {
            child.material = child.material.clone();
          }

          // Set basic material properties
          child.material.side = THREE.DoubleSide; 
          child.material.shadowSide = THREE.DoubleSide;
          child.material.wireframe = wireframe;
          child.material.clippingPlanes = clippingPlanes;
          
          // Handle specific material types
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Enhance PBR material properties for better visibility
            child.material.roughness = 0.2;  // Lower roughness for more shine
            child.material.metalness = 0.3;  // Increased metalness for better light response
            child.material.envMapIntensity = 2.0;  // Stronger environment reflection
            
            // Normal map handling with stronger effect
            if (child.material.normalMap) {
              child.material.normalScale.set(1.5, 1.5);
            }

            // AO map handling with reduced effect for brighter appearance
            if (child.material.aoMap) {
              child.material.aoMapIntensity = 0.5;
            }

            // Enhanced emissive properties
            if (child.material.emissiveMap) {
              child.material.emissive.set(1, 1, 1);
              child.material.emissiveIntensity = 0.6;
            }

            // Increase material brightness
            if (child.material.color) {
              const color = child.material.color;
              // Brighten the base color while preserving hue
              color.multiplyScalar(1.3);
            }
          }
        }
      }
    });
  }, [modelScene, clone, wireframe, clippingPlanes]);

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={modelScene} />
      {/* Add local lighting for better visibility */}
      <pointLight
        intensity={1}
        distance={10}
        position={[0, 2, 2]}
        castShadow
      />
      <pointLight
        intensity={0.5}
        distance={8}
        position={[-2, 1, -2]}
        castShadow
      />
      <hemisphereLight
        intensity={0.3}
        groundColor="#000000"
        color="#ffffff"
      />
    </group>
  );
}

TiaPortalModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  clone: PropTypes.bool,
  wireframe: PropTypes.bool,
  clippingPlanes: PropTypes.array
};

// Preload the model to improve performance
useGLTF.preload('/models/TiaChar.glb');
