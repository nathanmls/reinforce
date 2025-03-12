"use client";

import { animated } from "@react-spring/three";
import * as THREE from "three";
// import FloorRoom from "./FloorRoom";
import Room3DModel from "./Room3DModel";

const HeroSection = ({ heroSpring, isExplorationMode }) => {
  return (
    <animated.group
      position={[0, 0, 0]}
      scale={heroSpring.scale}
      opacity={heroSpring.opacity}
    >
      <group>
        {/* FloorRoom with a hole */}
        {/* <FloorRoom /> */}

        <Room3DModel position={[0, -0.45, 0]} rotation={[0, Math.PI*2, 0]} scale={2.4} wireframe={isExplorationMode} />
      </group>
    </animated.group>
  );
};

export default HeroSection;
