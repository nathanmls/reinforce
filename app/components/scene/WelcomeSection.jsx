"use client";

import { animated, useSpring } from "@react-spring/three";
import { RoundedBox } from "@react-three/drei";
import { useState } from "react";
import BoyModel from "./BoyModel";
import { RainbowFloor } from "./RainbowFloor";
import ClientOnlyTextPlane from "./ClientOnlyTextPlane";
import { useScroll } from "@/context/ScrollContext";
import { useEffect } from "react";

// Define each element with its position and scale properties
const WELCOME_ELEMENTS = [
  {
    id: "boy",
    component: BoyModel,
    position: [-4, -7.7, 0],
    rotation: [0, Math.PI * 0.5, 0],
    props: {
      wireframe: false,
    },
  },
  {
    id: "learn-text",
    component: ClientOnlyTextPlane,
    position: [-4, -5.5, 0],
    rotation: [0, Math.PI * 0.5, 0],
    props: {
      text: "Learn with friends",
      textColor: "#000000",
      backgroundColor: "rgba(240, 240, 240, 1)",
      width: 2,
      height: 0.5,
      fontSize: 100,
      fontWeight: "bold",
      borderRadius: 25,
      borderColor: "rgba(171, 39, 210, 0.8)",
      borderWidth: 3,
    },
  },
  {
    id: "screen",
    component: RoundedBox,
    position: [-2, -7, -3],
    rotation: [0, Math.PI * 0.11, 0],
    props: {
      args: [3, 2, 0.1],
      radius: 0.05,
      smoothness: 4,
      bevelSegments: 4,
      creaseAngle: 0.4,
      children: <meshStandardMaterial color="#333333" />,
    },
  },
  {
    id: "screen-text",
    component: ClientOnlyTextPlane,
    position: [-2, -5, -2.9], // Slightly in front of the screen
    rotation: [0, Math.PI * 0.11, 0],
    props: {
      text: ["Tire Dúvidas", "com um Professor"],
      textColor: "#000000",
      backgroundColor: "rgba(240, 240, 240, 1)",
      width: 2,
      height: 1,
      fontSize: 80,
      fontWeight: "bold",
      borderRadius: 25,
      borderColor: "rgba(171, 39, 210, 0.8)",
      borderWidth: 3,
    },
  },
];

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
        {/* Render elements with special handling for hover interactions */}
        {WELCOME_ELEMENTS.map((element) => {
          const Component = element.component;

          // Special handling for BoyModel to pass wireframe prop and add hover events
          if (element.id === "boy") {
            return (
              <animated.group
                key={element.id}
                position={element.position}
                rotation={element.rotation}
                scale={scaleValue}
                onPointerOver={handleBoyPointerOver}
                onPointerOut={handleBoyPointerOut}
              >
                <Component wireframe={isExplorationMode} />
              </animated.group>
            );
          }

          // Special handling for learn-text to show only on hover
          if (element.id === "learn-text") {
            return (
              <animated.group
                key={element.id}
                position={element.position}
                rotation={element.rotation}
                scale={learnTextSpring.scale}
                opacity={learnTextSpring.opacity}
              >
                <Component {...element.props} />
              </animated.group>
            );
          }

          // Special handling for screen to add hover events
          if (element.id === "screen") {
            return (
              <animated.group
                key={element.id}
                position={element.position}
                rotation={element.rotation}
                scale={scaleValue}
                onPointerOver={handleScreenPointerOver}
                onPointerOut={handleScreenPointerOut}
              >
                <Component {...element.props} />
              </animated.group>
            );
          }

          // Special handling for screen-text to show only on hover
          if (element.id === "screen-text") {
            return (
              <animated.group
                key={element.id}
                position={element.position}
                rotation={element.rotation}
                scale={screenTextSpring.scale}
                opacity={screenTextSpring.opacity}
              >
                <Component {...element.props} />
              </animated.group>
            );
          }

          // For other components
          return (
            <animated.group
              key={element.id}
              position={element.position}
              rotation={element.rotation}
              scale={scaleValue}
            >
              <Component {...element.props} />
            </animated.group>
          );
        })}

        {/* Rainbow floor is always visible */}
      </animated.group>
      <RainbowFloor />
    </>
  );
};

export default WelcomeSection;
