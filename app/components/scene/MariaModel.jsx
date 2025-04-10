'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function MariaModel({ opacity = 1 }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshPhongMaterial
        color="#9f7aea" // Purple - warm and approachable
        emissive="#805ad5"
        specular="#ffffff"
        shininess={50}
        wireframe={true}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
}
