'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function PedroModel({ opacity = 1 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshPhongMaterial
        color="#48bb78" // Green - knowledgeable and wise
        emissive="#38a169"
        specular="#ffffff"
        shininess={50}
        wireframe={true}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
}
