'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

function FloorRoom({ wireframe = false }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    // Draw outer shape with rounded corner in bottom left
    shape.moveTo(-4.5, -5); // Start at the bottom, after the rounded corner
    shape.lineTo(5, -5); // Bottom right
    shape.lineTo(5, 5); // Up right
    shape.lineTo(-5, 5); // Top left
    shape.lineTo(-5, -4.5); // Down to the corner
    shape.quadraticCurveTo(-5, -5, -4.5, -5); // Create rounded corner

    // Create circular hole
    const hole = new THREE.Path();
    hole.absarc(0, 0, 2, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    // Extrusion settings
    const extrudeSettings = {
      steps: 8,
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelOffset: 0,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
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
