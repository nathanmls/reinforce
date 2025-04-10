'use client';

import { animated, useSpring } from '@react-spring/three';
import { RoundedBox } from '@react-three/drei';
import { useState } from 'react';
import BoyModel from './BoyModel';
import TiaModel from './TiaModel';
import { RainbowFloor } from './RainbowFloor';
import ClientOnlyTextPlane from './ClientOnlyTextPlane';
import { useScroll } from '@/context/ScrollContext';

const WelcomeSection = ({ welcomementorSpring, isExplorationMode }) => {
  const { welcomeProgress } = useScroll();
  const [isBoyHovered, setIsBoyHovered] = useState(false);
  const [isScreenHovered, setIsScreenHovered] = useState(false);

  // Create a spring animation for scaling elements
  const { scaleValue } = useSpring({
    scaleValue: welcomeProgress > 0.5 ? 0 : 1,
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    },
  });

  // Create a spring animation for the learn-text visibility
  const learnTextSpring = useSpring({
    scale: isBoyHovered ? 1 : 0,
    opacity: isBoyHovered ? 1 : 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 60,
    },
  });

  // Create a spring animation for the screen-text visibility
  const screenTextSpring = useSpring({
    scale: isScreenHovered ? 1 : 0,
    opacity: isScreenHovered ? 1 : 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 60,
    },
  });

  // Handle hover events for the BoyModel
  const handleBoyPointerOver = () => setIsBoyHovered(true);
  const handleBoyPointerOut = () => setIsBoyHovered(false);

  // Handle hover events for the Screen
  const handleScreenPointerOver = () => setIsScreenHovered(true);
  const handleScreenPointerOut = () => setIsScreenHovered(false);

  return (
    <>
      <animated.group
        position={welcomementorSpring.position}
        scale={welcomementorSpring.scale}
        opacity={welcomementorSpring.opacity}
      >
        {/* Boy model with hover interaction */}
        <animated.group
          position={[-4, -7.7, 0]}
          rotation={[0, Math.PI * 0.5, 0]}
          scale={scaleValue}
          onPointerOver={handleBoyPointerOver}
          onPointerOut={handleBoyPointerOut}
        >
          <BoyModel wireframe={isExplorationMode} />
        </animated.group>

        {/* Tia model */}
        {/* <animated.group
          position={[-4, -8.7, 0]}
          rotation={[0, Math.PI * 0.5, 0]}
          scale={scaleValue.to(s => s * 0.5)}
        >
          <TiaModel wireframe={isExplorationMode} />
        </animated.group> */}

        {/* Learn with friends text - only visible on hover */}
        <animated.group
          position={[-4, -5.5, 0]}
          rotation={[0, Math.PI * 0.3, 0]}
          scale={learnTextSpring.scale}
          opacity={learnTextSpring.opacity}
        >
          <ClientOnlyTextPlane
            textTitle="Learn with friends"
            textColor="#000000"
            backgroundColor="rgba(240, 240, 240, 1)"
            width={2}
            height={0.5}
            titleSize={180}
            fontWeight="bold"
            borderRadius={25}
            borderColor="rgba(171, 39, 210, 0.8)"
            borderWidth={3}
          />
        </animated.group>

        {/* Screen with hover interaction */}
        <animated.group
          position={[-2, -7, -3]}
          rotation={[0, Math.PI * 0.11, 0]}
          scale={scaleValue}
          onPointerOver={handleScreenPointerOver}
          onPointerOut={handleScreenPointerOut}
        >
          <RoundedBox
            args={[3, 2, 0.1]}
            radius={0.05}
            smoothness={4}
            bevelSegments={4}
            creaseAngle={0.4}
          >
            <meshStandardMaterial color="#333333" />
          </RoundedBox>
        </animated.group>

        {/* Screen text - only visible on hover */}
        <animated.group
          position={[-2, -5, -2.9]}
          rotation={[0, Math.PI * 0.11, 0]}
          scale={screenTextSpring.scale}
          opacity={screenTextSpring.opacity}
        >
          <ClientOnlyTextPlane
            textTitle="Tire Dúvidas com um Professor"
            textColor="#000000"
            backgroundColor="rgba(240, 240, 240, 1)"
            width={2}
            height={1}
            titleSize={180}
            fontWeight="bold"
            borderRadius={25}
            borderColor="rgba(171, 39, 210, 0.8)"
            borderWidth={3}
          />
        </animated.group>
      </animated.group>
      
      {/* Rainbow floor is always visible */}
      <RainbowFloor />
    </>
  );
};

export default WelcomeSection;
