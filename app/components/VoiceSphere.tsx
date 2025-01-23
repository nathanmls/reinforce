'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface VoiceSphereProps {
  intensity: number;
}

export function VoiceSphere({ intensity }: VoiceSphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sphereRef.current) {
      const scale = 1 + intensity * 0.5;
      sphereRef.current.scale.set(scale, scale, scale);
      sphereRef.current.rotation.x += 0.01;
      sphereRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 32, 32]}>
      <meshPhongMaterial
        color="#4b0082"
        emissive="#320755"
        specular="#ffffff"
        shininess={50}
        wireframe={true}
      />
    </Sphere>
  );
}
