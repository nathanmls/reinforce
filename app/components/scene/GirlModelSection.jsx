"use client";

import { animated } from "@react-spring/three";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import GirlModel from "./GirlModel";
import { useScroll } from "/app/context/ScrollContext";
import useSceneAnimationSprings from "./SceneAnimationSprings";

// Carpet cylinder component
const CarpetCylinder = ({ position, scale, color, wireframe }) => {
  const cylinderRef = useRef();

  return (
    <mesh position={position} ref={cylinderRef}>
      <cylinderGeometry args={[scale * 1, scale * 1, 0.2, 64]} />
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
const OrbitingModel = ({
  modelPath,
  position,
  radius,
  speed,
  orbitingModelSpring,
}) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);

  // Orbital movement
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime() * speed;
      groupRef.current.position.x = position[0] + Math.cos(time) * radius;
      groupRef.current.position.y = position[1];
      groupRef.current.position.z = position[2] + Math.sin(time) * radius;
    }
  });

  // Detailed logging
  useEffect(() => {
    console.log('Orbiting Model Render:', {
      modelPath,
      position,
      spring: {
        scale: orbitingModelSpring?.scale,
        opacity: orbitingModelSpring?.opacity,
      },
    });
  }, [orbitingModelSpring, modelPath]);

  // Render with explicit scale and opacity
  return (
    <animated.group
      ref={groupRef}
      scale={orbitingModelSpring?.scale ? [1, 1, 1] : [0, 0, 0]}
      opacity={orbitingModelSpring?.scale || 0}
    >
      <primitive object={scene.clone()} rotation={[0, Math.PI * -0.2, 0]} />
    </animated.group>
  );
};

const GirlModelSection = ({ girlModelSpring }) => {
  // Define cylinder color
  const cylinderColor = new THREE.Color("#D2DBCD");
  const { scrollProgress } = useScroll();
  const { orbitingModelSpring } = useSceneAnimationSprings(scrollProgress);

  return (
    <animated.group
      position={girlModelSpring.position}
      scale={girlModelSpring.scale}
      opacity={girlModelSpring.opacity}
    >
      <group>
        <GirlModel wireframe={true} />

        {/* Orbiting Models */}
        <OrbitingModel
          modelPath="/models/abc.glb"
          position={[0, 2, 0]}
          radius={2}
          speed={0.5}
          orbitingModelSpring={orbitingModelSpring}
        />
        <OrbitingModel
          modelPath="/models/book.glb"
          position={[0, 2, 0]}
          radius={-2}
          speed={0.5}
          orbitingModelSpring={orbitingModelSpring}
        />

        {/* Cylinder below the carpet */}
        <CarpetCylinder
          position={[0, 0.1, 0]}
          scale={1.9}
          color={cylinderColor}
          wireframe={false}
        />
      </group>
    </animated.group>
  );
};

export default GirlModelSection;
