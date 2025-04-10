'use client';

import dynamic from 'next/dynamic';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const Text = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Text),
  {
    ssr: false,
  }
);

const GOLDENRATIO = 1.61803398875;

export default function PortalFrame({
  width = 4,
  height = GOLDENRATIO * 4,
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main portal frame */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* Inner portal frame (slightly smaller) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.1, height - 0.1]} />
        {children}
      </mesh>

      {/* Decorative elements */}
      <mesh position={[width / 2 - 0.1, -height / 2 + 0.1, 0.02]}>
        <ringGeometry args={[0.05, 0.08, 16]} />
        <meshBasicMaterial color="#AB27D2" />
      </mesh>
    </group>
  );
}

PortalFrame.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.node,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
