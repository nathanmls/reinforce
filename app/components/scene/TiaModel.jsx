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

import { useRef, forwardRef } from 'react';
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
const TiaModel = forwardRef(({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 3.5,
  wireframe = false
}, ref) => {
  const internalRef = useRef();
  
  // Use the forwarded ref if provided, otherwise use internal ref
  const modelRef = ref || internalRef;
  
  // Load the model using GLTFLoader directly
  const gltf = useLoader(GLTFLoader, '/models/TiaChar.glb', (loader) => {
    loader.manager.onError = (error) => {
      console.error('TiaModel loading error:', error);
    };
  });

  // If model fails to load, show a placeholder
  if (!gltf) {
    console.warn('TiaModel: Model not loaded');
    return (
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  }

  // Apply materials and shadows
  if (gltf.scene) {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.wireframe = wireframe;
        }
      }
    });
  }

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
});

// Add display name for better debugging
TiaModel.displayName = 'TiaModel';

TiaModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  wireframe: PropTypes.bool
};

export default TiaModel;
