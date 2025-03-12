'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';
import ClientOnlyText from './ClientOnlyText';

/**
 * DialogBalloon - A 3D speech bubble component for Three.js scenes
 * 
 * @param {Object} props
 * @param {Array} props.position - [x,y,z] position of the dialog balloon
 * @param {Array} props.rotation - [x,y,z] rotation of the dialog balloon
 * @param {number} props.scale - Scale factor for the dialog balloon
 * @param {string} props.text - The text to display in the balloon
 * @param {string} props.color - Background color of the balloon
 * @param {string} props.textColor - Color of the text
 * @param {boolean} props.animated - Whether the balloon should animate
 * @param {number} props.width - Width of the text area
 * @param {number} props.height - Height of the text area
 */
export default function DialogBalloon({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  text = "Hello! I'm Tia, your AI mentor.",
  color = "#ffffff",
  textColor = "#000000",
  animated = true,
  width = 1.5,
  height = 0.6,
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create a speech bubble shape with a pointer
  const bubbleShape = useRef(new THREE.Shape());
  
  useEffect(() => {
    // Create rounded rectangle with pointer
    const shape = bubbleShape.current;
    const w = width;
    const h = height;
    const r = 0.1; // corner radius
    
    // Start at top left
    shape.moveTo(-w/2 + r, -h/2);
    
    // Top edge
    shape.lineTo(w/2 - r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    
    // Right edge
    shape.lineTo(w/2, h/2 - r);
    shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    
    // Bottom edge with pointer
    shape.lineTo(0.1, h/2);
    // Pointer
    shape.lineTo(0, h/2 + 0.2);
    shape.lineTo(-0.1, h/2);
    
    // Continue bottom edge
    shape.lineTo(-w/2 + r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    
    // Left edge
    shape.lineTo(-w/2, -h/2 + r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    
  }, [width, height]);

  // Animation springs
  const { balloonScale, balloonY } = useSpring({
    balloonScale: hovered ? 1.05 : 1,
    balloonY: animated ? 0.05 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Animate the balloon
  useFrame((state) => {
    if (!isMounted || !groupRef.current) return;
    
    if (animated) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  // Don't render on server
  if (!isMounted) return null;

  return (
    <animated.group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={rotation}
      scale={balloonScale.to(s => s * scale)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Speech bubble background */}
      <mesh>
        <shapeGeometry args={[bubbleShape.current]} />
        <meshStandardMaterial 
          color={color} 
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Text content */}
      <ClientOnlyText
        position={[0, 0, 0.01]}
        fontSize={0.08}
        maxWidth={width * 0.85}
        lineHeight={1.2}
        textAlign="center"
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </ClientOnlyText>
    </animated.group>
  );
}
