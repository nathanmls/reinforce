'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

function FloorRoom({ wireframe = false }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Draw outer square
    shape.moveTo(-5, -5);
    shape.lineTo(5, -5);
    shape.lineTo(5, 5);
    shape.lineTo(-5, 5);
    shape.lineTo(-5, -5);

    // Create circular hole
    const hole = new THREE.Path();
    hole.absarc(0, 0,2, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    >
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#AB27D2"
        side={THREE.DoubleSide}
        shadowSide={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
        wireframe={wireframe}
      />
    </mesh>
  );
}

export default FloorRoom;
