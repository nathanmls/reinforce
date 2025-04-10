'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function SofiaModel({ opacity = 1 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshPhongMaterial
        color="#ed64a6" // Pink - creative and inspiring
        emissive="#d53f8c"
        specular="#ffffff"
        shininess={50}
        wireframe={true}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
}
