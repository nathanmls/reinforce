/**
 * PortalModel Component
 *
 * A reusable 3D model component for portal-style character models.
 * This component handles the loading, positioning, and material configuration
 * of 3D models in the scene.
 *
 * Features:
 * - Dynamic model loading using GLTF
 * - Shadow casting and receiving
 * - Custom material properties
 * - Position, rotation, and scale controls
 * - Clipping plane support
 * - Configurable model path
 */

'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/**
 * PortalModel Component
 *
 * Renders a 3D model in the scene with configurable properties.
 *
 * Features:
 * - Automatic shadow casting and receiving
 * - Positioned to interact with the scene's lighting
 * - Configurable scale, position, and rotation
 * - Clipping plane support
 * - Customizable model path
 *
 * @returns {JSX.Element} A primitive object containing the loaded GLTF model
 */
export default function PortalModel({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  clone = false,
  wireframe = false,
  clippingPlanes = [],
  roughness = 0.7,
  metalness = 0.1,
  envMapIntensity = 0.8,
  normalScale = 1.5,
  aoMapIntensity = 0.5,
  emissiveIntensity = 0.6,
  idleAnimation = null,
  clickAnimation = null,
  onAnimationComplete = () => {},
}) {
  // Load the 3D model and animations
  const group = useRef();
  const { scene, materials, animations } = useGLTF(modelPath);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Debug the loaded model
  useEffect(() => {
    console.log(`Model loaded from ${modelPath}:`, { scene, animations });
    console.log('Animation clips:', animations.map(anim => ({ 
      name: anim.name, 
      duration: anim.duration,
      tracks: anim.tracks.length
    })));
  }, [modelPath, scene, animations]);
  
  // Use the original scene but handle materials carefully
  // Note: We were using scene.clone(true) but it caused issues with the model not displaying
  const modelScene = scene;
  
  // Debug the scene structure and animations - using a ref to ensure it only runs once
  const hasLogged = useRef(false);
  useEffect(() => {
    // Only log once in development to avoid console spam
    if (process.env.NODE_ENV === 'development' && !hasLogged.current) {
      hasLogged.current = true;
      
      // Collect mesh information
      let meshCount = 0;
      let skinnedMeshCount = 0;
      const meshNames = [];
      
      scene.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
          if (meshNames.length < 5) { // Limit to 5 mesh names to avoid flooding
            meshNames.push(child.name || 'unnamed');
          }
        }
        if (child.isSkinnedMesh) {
          skinnedMeshCount++;
        }
      });
      
      // Log model information in a structured way
      console.groupCollapsed(`🔍 Model: ${modelPath.split('/').pop()}`);
      console.log(`Total meshes: ${meshCount}, Skinned meshes: ${skinnedMeshCount}`);
      console.log(`Sample mesh names: ${meshNames.join(', ')}${meshNames.length < meshCount ? '...' : ''}`);
      console.groupEnd();
    }
  }, [scene, modelPath]);
  
  // Set up animations - use the group ref
  const { actions, names, mixer } = useAnimations(animations, group);
  
  // Monitor animation system and ensure it's running
  useEffect(() => {
    if (!mixer) return;
    
    console.log('Animation mixer initialized with animations:', names);
    
    // Log when animations are available
    if (names.length > 0) {
      console.log('Available animations:', names.join(', '));
      
      // Debug each animation
      names.forEach(name => {
        if (actions[name]) {
          console.log(`Animation ${name} duration:`, actions[name].getClip().duration);
        }
      });
    } else {
      console.warn('No animations found in the model!');
    }
    
    // Create an animation loop to keep the mixer updating
    let lastTime = 0;
    let animationFrameId;
    
    const animate = (time) => {
      // Calculate delta time in seconds (clamped to avoid large jumps)
      const deltaTime = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      
      // Update the mixer with the actual time delta
      if (deltaTime > 0) {
        mixer.update(deltaTime);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate);
    
    // Clean up animation frame on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mixer, names, actions]);

  // Configure shadows and materials
  useEffect(() => {
    if (!modelScene) return;

    // Flag to track if we need to force a texture update
    let needsTextureUpdate = false;
    
    // Apply material settings to all meshes in the scene
    // This ensures proper rendering in the portal
    
    // Keep track of processed materials to avoid duplicate processing
    const processedMaterials = new Set();

    modelScene.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;

        // Apply material properties
        if (child.material) {
          // Handle material arrays (some meshes have multiple materials)
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              if (!processedMaterials.has(mat.uuid)) {
                const clonedMat = mat.clone();
                processedMaterials.add(mat.uuid);
                return clonedMat;
              }
              return mat;
            });
          } else if (!processedMaterials.has(child.material.uuid)) {
            // Clone the material to avoid shared state issues
            child.material = child.material.clone();
            processedMaterials.add(child.material.uuid);
            
            // Apply wireframe setting if needed
            if (wireframe) {
              child.material.wireframe = true;
            }
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
            child.material.roughness = roughness;
            child.material.metalness = metalness;
            child.material.envMapIntensity = envMapIntensity;

            // Normal map handling with configurable effect
            if (child.material.normalMap) {
              child.material.normalScale.set(normalScale, normalScale);
              child.material.normalMap.needsUpdate = true;
            }

            // AO map handling with configurable effect
            if (child.material.aoMap) {
              child.material.aoMapIntensity = aoMapIntensity;
              child.material.aoMap.needsUpdate = true;
            }

            // Enhanced emissive properties
            if (child.material.emissiveMap) {
              child.material.emissive.set(1, 1, 1);
              child.material.emissiveIntensity = emissiveIntensity;
              child.material.emissiveMap.needsUpdate = true;
            }

            // Ensure map is properly loaded
            if (child.material.map) {
              child.material.map.needsUpdate = true;
              child.material.map.colorSpace = THREE.SRGBColorSpace;
              needsTextureUpdate = true;
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
  }, [
    modelScene, 
    clone, 
    wireframe, 
    clippingPlanes, 
    roughness, 
    metalness, 
    envMapIntensity,
    normalScale,
    aoMapIntensity,
    emissiveIntensity
  ]);
    
  // Set up idle animation when component mounts or animation state changes
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    
    console.log('Setting up animations with:', { idleAnimation, clickAnimation });
    
    // Set up idle animation if specified and not in clicked state
    if (idleAnimation && actions[idleAnimation] && !isClicked) {
      // Stop all animations first
      Object.values(actions).forEach(action => {
        if (action) action.stop();
      });
      
      // Configure and play idle animation
      const idleAction = actions[idleAnimation];
      idleAction.reset();
      idleAction.setLoop(THREE.LoopRepeat);
      idleAction.play();
      
      console.log(`Playing idle animation: ${idleAnimation}`);
    }
    
    // Clean up animations on unmount
    return () => {
      Object.values(actions).forEach(action => {
        if (action) action.stop();
      });
    };
  }, [actions, idleAnimation, isClicked]);
  
  // Handle click to play animation - SIMPLIFIED VERSION
  const handleClick = () => {
    console.log('🔍 CLICK DETECTED: Animation click handler');
    
    // Basic validation
    if (!actions || !clickAnimation || isClicked) {
      console.log('⚠️ Cannot play animation - invalid state');
      return;
    }
    
    // Set clicked state
    setIsClicked(true);
    
    try {
      // ULTRA SIMPLE APPROACH: Just play the animation directly
      console.log(`▶️ Playing animation: ${clickAnimation}`);
      
      // Stop all current animations
      Object.values(actions).forEach(action => action.stop());
      
      // Get the waving animation and configure it
      const wavingAction = actions[clickAnimation];
      wavingAction.reset();
      wavingAction.setLoop(THREE.LoopOnce);
      wavingAction.clampWhenFinished = true;
      wavingAction.timeScale = 0.5;
      
      // Play it
      wavingAction.play();
      
      // Set a timeout to return to idle based on the animation duration
      const animDuration = wavingAction.getClip().duration;
      console.log(`⏱ Animation duration: ${animDuration} seconds`);
      
      // Wait for animation to complete, then return to idle
      setTimeout(() => {
        console.log('🔄 Animation complete, returning to idle');
        
        // Stop the waving animation
        wavingAction.stop();
        
        // Reset and play idle animation if available
        if (idleAnimation && actions[idleAnimation]) {
          const idleAction = actions[idleAnimation];
          idleAction.reset();
          idleAction.setLoop(THREE.LoopRepeat);
          idleAction.play();
          console.log(`▶️ Playing idle animation: ${idleAnimation}`);
        }
        
        // Reset clicked state
        setIsClicked(false);
        
        // Call the completion callback
        onAnimationComplete();
      }, (animDuration * 1000) + 100); // Animation duration + small buffer
    } catch (error) {
      console.error('🚨 Animation error:', error);
      setIsClicked(false);
    }
  };

  return (
    <group 
      ref={group} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={handleClick}
    >
      {/* Using our specially processed scene for animations */}
      <primitive object={modelScene} />
      
      {/* Add a debug box to visualize the model's bounding box - uncomment if needed */}
      {/* <Box args={[1, 1, 1]} position={[0, 0, 0]} visible={false}>
        <meshBasicMaterial wireframe color="red" transparent opacity={0.2} />
      </Box> */}
    </group>
  );
}

PortalModel.propTypes = {
  modelPath: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  clone: PropTypes.bool,
  wireframe: PropTypes.bool,
  clippingPlanes: PropTypes.array,
  roughness: PropTypes.number,
  metalness: PropTypes.number,
  envMapIntensity: PropTypes.number,
  normalScale: PropTypes.number,
  aoMapIntensity: PropTypes.number,
  emissiveIntensity: PropTypes.number,
  idleAnimation: PropTypes.string,
  clickAnimation: PropTypes.string,
  onAnimationComplete: PropTypes.func,
};

/**
 * Utility method to preload a model for better performance
 * This can be called statically before the component is rendered
 * @param {string} modelPath - Path to the model to preload
 */
PortalModel.preloadModel = (modelPath) => {
  if (modelPath) {
    useGLTF.preload(modelPath);
  }
};

// Preload common models
PortalModel.preloadModel('/models/rp-tia.glb');
PortalModel.preloadModel('/models/tia-rpm-fbx.fbx');
