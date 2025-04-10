'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';

export default function WallMeetTia({
  width = 10,
  height = 8.8,
  holeRadius = 1,
  color = '#D2DBCD',
  wireframe = false,
}) {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(0, 0);
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true, 64);
    shape.holes.push(hole);

    return shape;
  }, [width, height, holeRadius]);

  return (
    <group>
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
          wireframe={wireframe}
        />
      </mesh>

      {/* Static white ring */}
      <mesh position={[0, 0, 0.1]}>
        <torusGeometry args={[holeRadius - 0.04, 0.04, 32, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
          toneMapped={false}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

WallMeetTia.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  holeRadius: PropTypes.number,
  color: PropTypes.string,
  wireframe: PropTypes.bool,
};
