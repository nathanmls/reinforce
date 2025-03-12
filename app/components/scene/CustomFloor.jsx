'use client';

import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function CustomFloor({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, wireframe = false, color = "#E6D2BC" }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[2 * (Array.isArray(scale) ? scale[0] : scale), 2 * (Array.isArray(scale) ? scale[0] : scale), 0.1, 32]} />
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        shadowSide={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
        wireframe={wireframe}
      />
    </mesh>
  );
}

CustomFloor.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  wireframe: PropTypes.bool,
  color: PropTypes.string
};
