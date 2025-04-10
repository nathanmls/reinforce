'use client';

import { useRef, useEffect } from 'react';
import { useTexture, Circle } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function CarpetModel({
  position = [0, -0.05, 0],
  rotation = [0, 0, 0],
  scale = 1.5,
  wireframe = false,
}) {
  const carpetRef = useRef();
  // const texture = useTexture('/images/round-carpet-texture.jpg');

  useEffect(() => {
    if (carpetRef.current) {
      // Apply texture settings
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;

      // Apply material settings
      if (carpetRef.current.material) {
        carpetRef.current.material.side = THREE.DoubleSide;
        carpetRef.current.material.shadowSide = THREE.DoubleSide;
        carpetRef.current.material.wireframe = wireframe;
        carpetRef.current.material.needsUpdate = true;

        // Adjust material properties for better shadows
        carpetRef.current.material.metalness = 0.1;
        carpetRef.current.material.roughness = 0.8;
      }

      // Apply shadow settings
      carpetRef.current.castShadow = true;
      carpetRef.current.receiveShadow = true;
    }
  }, [texture, wireframe]);

  return (
    <Circle
      ref={carpetRef}
      args={[1, 64]} // radius, segments
      position={position}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to lay flat on the ground
      scale={scale}
    >
      <meshStandardMaterial
        // map={texture}
        color="#ffffff"
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </Circle>
  );
}

CarpetModel.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  wireframe: PropTypes.bool,
};
