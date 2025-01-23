'use client';

import { useMemo, useState } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { useSpring, animated } from '@react-spring/three';

export default function WallMeetTia({ width = 10, height = 8.8, holeRadius = 1, color = "#D2DBCD" }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(0, 0);
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true, 128);
    shape.holes.push(hole);

    return shape;
  }, [width, height, holeRadius]);

  // Initial position aligned with meetTia camera at (-5, -14, 8)
  const initialPosition = [-0.2, -14, 4]; // z = 4 to be in front of camera (which is at z = 8)
  const animatedPosition = [-5, -14, 7.5]; // Closer to camera when animated

  const springs = useSpring({
    position: isAnimating ? animatedPosition : initialPosition,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  return (
    <animated.mesh
      rotation={[0, Math.PI*-0.28, 0]} // Match camera rotation
      position={springs.position}
      onClick={() => setIsAnimating(!isAnimating)}
    >
      <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
      />
    </animated.mesh>
  );
}

WallMeetTia.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  holeRadius: PropTypes.number,
  color: PropTypes.string,
};
