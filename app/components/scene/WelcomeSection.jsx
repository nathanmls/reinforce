"use client";

import { animated } from "@react-spring/three";
import { RoundedBox } from "@react-three/drei";
import BoyModel from "./BoyModel";
import { RainbowFloor } from "./RainbowFloor";
import ClientOnlyTextPlane from './ClientOnlyTextPlane';

const WelcomeSection = ({ 
  welcomementorSpring, 
  isExplorationMode 
}) => {
  return (
    <>
      <animated.group
        position={welcomementorSpring.position}
        scale={welcomementorSpring.scale}
        opacity={welcomementorSpring.opacity}
      >
        <group>
          {/* Portal with TiaModel, BoyModel, etc. */}
          <BoyModel wireframe={isExplorationMode} />
          
          {/* Text above Boy character */}
          <ClientOnlyTextPlane
            position={[-4, -5.5, 0]} // Positioned above the boy (who is at -4, -7.7, 0)
            rotation={[0, Math.PI*0.5, 0]} // Same rotation as the boy
            text="Learn with friends"
            textColor="#000000"
            backgroundColor="rgba(240, 240, 240, 1)" // White background with transparency
            width={2}
            height={0.5}
            fontSize={100}
            fontWeight="bold"
            borderRadius={25}
            borderColor="rgba(171, 39, 210, 0.8)" // Purple border matching your theme
            borderWidth={3}
          />
          {/* Text above The Screen */}
          <ClientOnlyTextPlane
            position={[-2, -5, -3]} // Adjusted Y position to center vertically
            rotation={[0, Math.PI*0.11, 0]}
            text={["Tire Dúvidas", "com um Professor"]} // Array of lines instead of \n
            textColor="#000000"
            backgroundColor="rgba(240, 240, 240, 1)" // White background with transparency
            width={2}
            height={1}
            fontSize={80}
            fontWeight="bold"
            borderRadius={25}
            borderColor="rgba(171, 39, 210, 0.8)" // Purple border matching your theme
            borderWidth={3}
          />
          {/* Text above Portal Tia */}
          <ClientOnlyTextPlane
            position={[1.5, -5.2, -2.5]} // Positioned above the portal
            rotation={[0, Math.PI*1.85, 0]}
            text="Mentor AI"
            textColor="#000000"
            backgroundColor="rgba(240, 240, 240, 1)" // White background with transparency
            width={2}
            height={0.5}
            fontSize={100}
            fontWeight="bold"
            borderRadius={25}
            borderColor="rgba(171, 39, 210, 0.8)" // Purple border matching your theme
            borderWidth={3}
          />

          {/* Screen with videocall with the Teacher*/}
          <RoundedBox
            args={[5.5, 3, 0.2]} // width, height, depth
            radius={0.1} // corner radius
            smoothness={4} // number of curve segments
            rotation={[0, Math.PI / 9, 0]}
            position={[-2, -7, -3]}
            scale={0.5}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#AB27D2"
              metalness={0.2}
              roughness={0.3}
              envMapIntensity={1.5}
            />
          </RoundedBox>

          {/* Rainbow floor */}
          <RainbowFloor />
        </group>
      </animated.group>
    </>
  );
};

export default WelcomeSection;
