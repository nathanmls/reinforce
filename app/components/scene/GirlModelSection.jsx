"use client";

import { animated } from "@react-spring/three";
import GirlModel from "./GirlModel";
import CarpetModel from "./CarpetModel";

const GirlModelSection = ({ girlModelSpring, isExplorationMode }) => {
  return (
    <animated.group
      position={girlModelSpring.position}
      scale={girlModelSpring.scale}
      opacity={girlModelSpring.opacity}
    >
      <group>
        <GirlModel wireframe={isExplorationMode} />
        {/* Carpet model for the girl to stand on */}
        <CarpetModel 
          position={[0, -0.5, 0]} 
          rotation={[0, 0, 0]} 
          scale={2.5} 
          wireframe={isExplorationMode} 
        />
      </group>
    </animated.group>
  );
};

export default GirlModelSection;
