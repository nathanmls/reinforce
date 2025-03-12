'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function AdvisorModel({ opacity = 1 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshPhongMaterial
        color="#38a169"
        emissive="#2f855a"
        specular="#ffffff"
        shininess={50}
        wireframe={true}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
}
