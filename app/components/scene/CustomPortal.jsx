'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshPortalMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const PORTAL_CONFIG = {
  width: 3,
  height: 2,
  radius: 0.04
};

export default function CustomPortal({ 
  children, 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  wireframe = false
}) {
  const portalRef = useRef();
  const lightRef = useRef();

  // Update portal effects
  useFrame((state) => {
    if (portalRef.current && lightRef.current) {
      // Animate portal light
      const time = state.clock.getElapsedTime();
      lightRef.current.intensity = 15 + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Portal Background (white border) */}
      <RoundedBox
        args={[PORTAL_CONFIG.width + 0.05, PORTAL_CONFIG.height + 0.05, 0.1]}
        radius={PORTAL_CONFIG.radius}
        position={[0, 0, -0.05]}
      >
        <meshBasicMaterial color="white" wireframe={wireframe} />
      </RoundedBox>

      {/* Portal Frame */}
      <RoundedBox
        args={[PORTAL_CONFIG.width, PORTAL_CONFIG.height, 0.1]}
        radius={PORTAL_CONFIG.radius}
      >
        <MeshPortalMaterial ref={portalRef}>
          {/* Portal Environment */}
          <color attach="background" args={['#ffffff']} />
          <fog attach="fog" args={['#ffffff', 20, 35]} />
          
          {/* Enhanced Portal Lighting */}
          <ambientLight intensity={1.5} />
          
          {/* Main dramatic light from front-top */}
          <spotLight 
            ref={lightRef}
            position={[0, 12, 8]} 
            intensity={15}
            angle={0.8}
            penumbra={0.5}
            decay={2}
            color="#ffffff"
            castShadow
          />

          {/* Enhanced fill lights from sides */}
          <pointLight
            position={[6, 6, 2]}
            intensity={4}
            color="#ffffff"
            distance={15}
          />
          <pointLight
            position={[-6, 6, 2]}
            intensity={4}
            color="#ffffff"
            distance={15}
          />
          
          {/* Back rim light */}
          <pointLight
            position={[0, 8, -5]}
            intensity={3}
            color="#ffffff"
            distance={12}
          />
          
          {/* Portal Content */}
          <group>
            {children}
          </group>
        </MeshPortalMaterial>
      </RoundedBox>

      {/* Portal Glow Effect */}
      <pointLight
        position={[0, 0, 1]}
        distance={3}
        intensity={2}
        color="#4a9eff"
      />
    </group>
  );
}
