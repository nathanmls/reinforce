'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import TiaModel from './scene/TiaModel';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

// Simple solid color background
const PortalBackground = () => {
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#5A1A8A" side={THREE.DoubleSide} />
    </mesh>
  );
};

// Simple solid color floor
const SolidFloor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color="#B4D45A" />
    </mesh>
  );
};

// Mouse-responsive camera movement
const MouseFollowCamera = ({ intensity = 0.5, smoothing = 10 }) => {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const initialCameraPosition = useRef(new THREE.Vector3(0, 1.5, 4)); // Default camera position
  const targetPosition = useRef(new THREE.Vector3());
  const isInitialized = useRef(false);
  
  // Handle mouse movement and initialize camera only once
  useEffect(() => {
    // Only set the initial position once, not on every hot reload
    if (!isInitialized.current) {
      // Store the current camera position as the base position
      initialCameraPosition.current.copy(camera.position);
      isInitialized.current = true;
      
      // Store this position in sessionStorage to persist across hot reloads
      try {
        sessionStorage.setItem('tiaCharCameraPosition', JSON.stringify({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        }));
      } catch (e) {
        console.warn('Could not save camera position to sessionStorage');
      }
    } else {
      // On hot reload, try to restore the camera position from sessionStorage
      try {
        const savedPosition = sessionStorage.getItem('tiaCharCameraPosition');
        if (savedPosition) {
          const pos = JSON.parse(savedPosition);
          initialCameraPosition.current.set(pos.x, pos.y, pos.z);
        }
      } catch (e) {
        console.warn('Could not restore camera position from sessionStorage');
      }
    }
    
    const handleMouseMove = (event) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera]);
  
  // Update camera position based on mouse movement
  useFrame(() => {
    // Calculate target position based on mouse
    targetPosition.current.set(
      initialCameraPosition.current.x + mousePosition.x * intensity,
      initialCameraPosition.current.y + mousePosition.y * intensity * 0.5,
      initialCameraPosition.current.z
    );
    
    // Smoothly interpolate to the target position
    camera.position.lerp(targetPosition.current, 1 / smoothing);
    
    // Always look at the center of the scene
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

// Static lighting setup
const SceneLighting = () => {
  return (
    <>
      {/* Base ambient light */}
      <ambientLight intensity={0.5} />
      
      {/* Main directional light for shadows */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />
      
      {/* Spotlight for focused lighting */}
      <spotLight 
        position={[0, 5, 4]} 
        intensity={2.5}
        angle={0.6}
        penumbra={0.5}
        distance={20}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      
      {/* Accent light for color */}
      <pointLight 
        position={[3, 2, 0]} 
        intensity={1.5}
        color="#B4D45A"
        distance={8}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      
      {/* Fill light from the back */}
      <pointLight 
        position={[-3, 3, -3]} 
        intensity={0.8}
        color="#ffffff"
        distance={10}
      />
    </>
  );
};

/**
 * TiaCharacter Component
 * 
 * This component will handle the Tia character animations based on voice activity.
 * Currently implements a simple breathing animation, but is prepared for future
 * jaw bone and body animations based on AI audio waveform.
 * 
 * @param {Object} props
 * @param {boolean} props.isActive - Whether voice is currently active
 * @param {number} props.intensity - Intensity of the voice activity (0-1)
 * @param {Object} props.audioData - Audio data for future jaw animation (optional)
 */
const TiaCharacter = ({ isActive = false, intensity = 1, audioData = null }) => {
  const groupRef = useRef();
  const modelRef = useRef();
  
  // Simple breathing animation that runs continuously
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Add subtle breathing animation
      const breathingScale = 1 + Math.sin(time * 0.5) * 0.01;
      
      // Add more movement when voice is active
      const activeScale = isActive ? 1 + intensity * 0.05 : 1;
      const finalScale = breathingScale * activeScale;
      
      groupRef.current.scale.set(finalScale, finalScale, finalScale);
      
      // Future implementation: Jaw bone animation based on audio waveform
      // if (isActive && audioData && modelRef.current) {
      //   // Access jaw bone in the model
      //   // const jawBone = modelRef.current.getObjectByName('jaw');
      //   // if (jawBone) {
      //   //   // Map audio amplitude to jaw opening
      //   //   jawBone.rotation.x = Math.min(0.5, audioData.amplitude * 2);
      //   // }
      // }
    }
  });

  return (
    <group ref={groupRef}>
      <TiaModel 
        ref={modelRef}
        position={[0, -1.5, 0]} 
        rotation={[0, 0, 0]}
        scale={2.5}
        receiveShadow
      />
    </group>
  );
};

const TiaCharScene = ({ isActive = false, intensity = 1 }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 4], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ 
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        shadowMap: { 
          enabled: true, 
          type: THREE.PCFSoftShadowMap 
        }
      }}
    >
      {/* Background */}
      <PortalBackground />
      
      {/* Static lighting setup */}
      <SceneLighting />
      
      {/* Solid color floor */}
      <SolidFloor />
      
      {/* Contact shadows for better grounding */}
      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.6}
        scale={5}
        blur={2}
        far={2}
        resolution={256}
        color="#000000"
      />
      
      {/* Mouse-responsive camera */}
      <MouseFollowCamera intensity={0.8} smoothing={8} />
      
      {/* Tia character with animation setup */}
      <Suspense fallback={null}>
        <TiaCharacter 
          isActive={isActive} 
          intensity={intensity} 
          // audioData will be passed in the future for jaw animation
          // audioData={audioData}
        />
      </Suspense>
      
      {/* Environment map for better reflections */}
      <Environment preset="sunset" />
    </Canvas>
  );
};

export default TiaCharScene;
