'use client';

import { animated, useSpring } from '@react-spring/three';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types'; // Import PropTypes
import GirlModel from './GirlModel';
import { useScroll } from '/app/context/ScrollContext';
import useSceneAnimationSprings from './SceneAnimationSprings';

// Carpet cylinder component
const CarpetCylinder = ({ position, scale, color, wireframe }) => {
  const cylinderRef = useRef();

  return (
    <mesh position={position} ref={cylinderRef}>
      <cylinderGeometry args={[scale * 1, scale * 1, 0.1, 64]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={1}
      />
    </mesh>
  );
};

// Orbiting Model Component
const OrbitingModel = ({ modelPath, radius, speed, position, rotation }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);
  const { welcomeProgress } = useScroll();

  const { scaleValue } = useSpring({
    scaleValue: welcomeProgress > 0.4 ? 0.6 : 0,
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    },
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const elapsedTime = clock.getElapsedTime();
      const angle = elapsedTime * speed;

      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.z = Math.sin(angle) * radius;
    }
  });

  return (
    <animated.group
      ref={groupRef}
      scale={scaleValue}
      position={[0, 3, 0]}
      rotation={rotation}
    >
      <primitive object={scene.clone()} rotation={[0, Math.PI * -0.2, 0]} />
    </animated.group>
  );
};

OrbitingModel.propTypes = {
  modelPath: PropTypes.string.isRequired,
  radius: PropTypes.number.isRequired,
  speed: PropTypes.number,
};

const GirlModelSection = ({ girlModelSpring }) => {
  // Define cylinder color
  const cylinderColor = new THREE.Color('#D2DBCD');

  return (
    <animated.group
      position={girlModelSpring.position}
      scale={girlModelSpring.scale}
      rotation={girlModelSpring.rotation}
    >
      <group>
        <GirlModel />
        <group rotation={[0.3, 0, 0.3]}>
          {/* Orbiting Models */}
          <OrbitingModel
            modelPath="/models/abc.glb"
            radius={2}
            speed={0.5}
            rotation={[Math.PI * -0.06, 0, Math.PI * -0.05]}
          />
          <OrbitingModel
            modelPath="/models/book.glb"
            radius={-2}
            speed={0.5}
            rotation={[Math.PI * 0.1, 0, Math.PI * 0.1]}
          />
        </group>

        {/* Cylinder below the carpet */}
        <CarpetCylinder
          position={[0, 0.03, 0]}
          scale={1.9}
          color={cylinderColor}
          wireframe={false}
        />
      </group>
    </animated.group>
  );
};

export default GirlModelSection;
