'use client';

import * as THREE from 'three';
import PropTypes from 'prop-types';

const RAINBOW_LAYERS = [
  { radius: 4, color: '#DFBD7D', y: -9.51 },
  { radius: 6, color: '#E9B380', y: -9.52 },
  { radius: 8, color: '#F39E75', y: -9.53 },
  { radius: 10, color: '#FB718A', y: -9.54 },
  { radius: 12, color: '#E74EB5', y: -9.55 },
  { radius: 14, color: '#5741A2', y: -9.56 },
  { radius: 16, color: '#002B7D', y: -9.57 }
];

export function RainbowFloor({ segments = 32 }) {
  return (
    <>
      {RAINBOW_LAYERS.map(({ radius, color, y }, index) => (
        <mesh
          key={`rainbow-layer-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, y, 0]}
        >
          <circleGeometry args={[radius, segments]} />
          <meshStandardMaterial
            color={color}
            side={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}
    </>
  );
}

RainbowFloor.propTypes = {
  segments: PropTypes.number
};
