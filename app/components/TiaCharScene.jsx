'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment } from '@react-three/drei';
import TiaModel from './scene/TiaModel';
import { Suspense, useRef, useMemo, useEffect } from 'react';
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

// Animated lighting effects
const AnimatedLights = ({ isActive }) => {
  const spotlightRef = useRef();
  const pointLightRef = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (spotlightRef.current) {
      // Animate spotlight intensity based on activity
      const baseIntensity = isActive ? 2.5 : 1.8;
      spotlightRef.current.intensity = baseIntensity + Math.sin(time * 1.5) * 0.3;
      
      // Subtle color changes
      if (time % 4 > 3) {
        spotlightRef.current.color.setHSL(time * 0.05 % 1, 0.7, 0.7);
      }
    }
    
    if (pointLightRef.current) {
      // Animate point light for accent lighting
      pointLightRef.current.intensity = 1 + Math.sin(time * 2) * 0.3;
      pointLightRef.current.position.x = Math.sin(time * 0.5) * 2;
      pointLightRef.current.position.z = Math.cos(time * 0.5) * 2;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.8} />
      <spotLight 
        ref={spotlightRef}
        position={[0, 5, 4]} 
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight 
        ref={pointLightRef}
        position={[3, 2, 0]} 
        intensity={1.5}
        color="#B4D45A"
        distance={6}
      />
    </>
  );
};

// This component will be rendered inside the Canvas
const AnimatedTia = ({ isActive = false, intensity = 1 }) => {
  const groupRef = useRef();
  
  // Animate Tia based on voice activity - now safely inside a component rendered by Canvas
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Add subtle breathing animation
      const breathingScale = 1 + Math.sin(time * 0.5) * 0.01;
      
      // Add more movement when voice is active
      const activeScale = isActive ? 1 + intensity * 0.05 : 1;
      const finalScale = breathingScale * activeScale;
      
      groupRef.current.scale.set(finalScale, finalScale, finalScale);
      
      // Add subtle rotation when active
      if (isActive) {
        groupRef.current.rotation.y += 0.002 * intensity;
      } else {
        // Subtle idle rotation
        groupRef.current.rotation.y += 0.0005;
      }
    }
  });

  return (
      <group ref={groupRef}>
        <TiaModel 
          position={[0, -1.2, 0]} 
          rotation={[0, 0, 0]} 
          scale={2.5} 
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
    >
      {/* Background */}
      <PortalBackground />
      
      {/* Lighting setup for Tia */}
      <AnimatedLights isActive={isActive} />
      
      {/* Solid color floor */}
      <SolidFloor />
      
      {/* Tia character */}
      <Suspense fallback={null}>
        <AnimatedTia isActive={isActive} intensity={intensity} />
      </Suspense>
      
      {/* Environment map for better reflections */}
      <Environment preset="sunset" />
      
      {/* Camera controls with limited rotation */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
    </Canvas>
  );
};

export default TiaCharScene;
