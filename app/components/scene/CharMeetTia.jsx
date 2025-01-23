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
export default function CharMeetTia({ position = [0, -9.5, -3], rotation = [0, 0, 0], scale = 3.5 }) {
  // Load the 3D model
  const { scene } = useGLTF('/models/TiaChar.glb');
  const modelRef = useRef();

  // Configure shadows and materials
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
          child.material.roughness = 0.8;  // Less shiny
          child.material.metalness = 0.2;  // Slight metallic quality
          child.material.envMapIntensity = 1.0;  // Environment reflection
          child.material.normalScale = new THREE.Vector2(1, 1);  // Normal map intensity
        }
      }
    });
  }, [scene]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      rotation={rotation}
      scale={scale}
      position={position}
      castShadow
      receiveShadow
    />
  );
}

CharMeetTia.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number
};

// Preload the model to improve performance
useGLTF.preload('/models/TiaChar.glb');
