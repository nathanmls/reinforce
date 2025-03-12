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

import { useRef, useEffect, useState } from 'react';
import { useGLTF, useTexture } from "@react-three/drei";
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
  const { scene, materials } = useGLTF('/models/TiaChar.glb');
  const modelRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);

  // Create a cloned scene if needed
  const modelScene = clone ? scene.clone(true) : scene;

  // Configure shadows and materials
  useEffect(() => {
    if (!modelScene) return;

    // Flag to track if we need to force a texture update
    let needsTextureUpdate = false;

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
          child.material.needsUpdate = true; // Force material update
          
          // Handle specific material types
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Adjust PBR material properties for more natural appearance
            child.material.roughness = 0.7;  // Higher roughness for less shine
            child.material.metalness = 0.1;  // Lower metalness for more natural appearance
            child.material.envMapIntensity = 0.8;  // Reduced environment reflection
            
            // Normal map handling with stronger effect
            if (child.material.normalMap) {
              child.material.normalScale.set(1.5, 1.5); 
              child.material.normalMap.needsUpdate = true;
            }

            // AO map handling with reduced effect for brighter appearance
            if (child.material.aoMap) {
              child.material.aoMapIntensity = 0.5;
              child.material.aoMap.needsUpdate = true;
            }

            // Enhanced emissive properties
            if (child.material.emissiveMap) {
              child.material.emissive.set(1, 1, 1);
              child.material.emissiveIntensity = 0.6;
              child.material.emissiveMap.needsUpdate = true;
            }

            // Ensure map is properly loaded
            if (child.material.map) {
              child.material.map.needsUpdate = true;
              child.material.map.colorSpace = THREE.SRGBColorSpace;
              needsTextureUpdate = true;
            }

            // Preserve original material color without brightening
            if (child.material.color) {
              // No color adjustment needed
              // The original color from the model will be used
            }
          }
        }
      }
    });

    // Force a texture update if needed
    if (needsTextureUpdate) {
      THREE.TextureLoader.prototype.crossOrigin = '';
      setIsLoaded(true);
    }
  }, [modelScene, clone, wireframe, clippingPlanes]);

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={modelScene} />
      {/* Removed local lighting to prevent overexposure */}
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