'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshPortalMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Constants for portal configuration
const PORTAL_CONFIG = {
  width: 1.8,
  height: 2.5,
  depth: 0.03,
  radius: 0.4,
};

// GLSL Shaders as raw strings for custom effects
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform float time;
uniform float displacementScale;

void main() {
  vUv = uv;
  vNormal = normal;
  
  // Create more complex displacement with multiple waves
  vec3 pos = position;
  
  // Radial wave from center
  float dist = length(uv - 0.5);
  float radialWave = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
  
  // Combine with original displacement for more interesting effect
  pos.z += sin(pos.x * 3.0 + time * 1.5) * cos(pos.y * 2.0 + time) * displacementScale;
  pos.z += radialWave * displacementScale * 0.5;
  
  // Add some subtle x/y displacement for a more fluid look
  pos.x += sin(pos.y * 4.0 + time) * displacementScale * 0.1;
  pos.y += cos(pos.x * 4.0 + time) * displacementScale * 0.1;
  
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform vec3 glowColor;
uniform float time;

void main() {
  // Calculate distance from center for radial effect
  float dist = length(vUv - 0.5);
  
  // Create a sharper edge with smoother transition
  float edge = smoothstep(0.35, 0.5, dist);
  
  // Create animated pulse effect
  float pulse = sin(time * 1.5) * 0.5 + 0.5;
  
  // Add ripple effect
  float ripple = sin((dist * 15.0 - time) * 2.0) * 0.5 + 0.5;
  ripple *= smoothstep(0.5, 0.35, dist); // Only show ripples inside the portal
  
  // Calculate fresnel effect for edge glow
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
  
  // Mix colors based on effects
  vec3 innerColor = mix(glowColor, vec3(1.0, 1.0, 1.0), ripple * 0.3);
  vec3 finalColor = mix(innerColor, glowColor * 1.5, edge * fresnel);
  
  // Add subtle color variation
  finalColor += vec3(sin(time * 0.5) * 0.1, cos(time * 0.3) * 0.1, sin(time * 0.7) * 0.1) * (1.0 - edge);
  
  // Adjust opacity for edge fade
  float opacity = mix(0.9, 0.0, smoothstep(0.4, 0.5, dist));
  opacity = mix(opacity, opacity * (pulse * 0.5 + 0.5), edge);
  
  gl_FragColor = vec4(finalColor, opacity);
}
`;

// Helper function to create a rounded rectangle shape
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

export default function CustomPortal({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  wireframe = false,
  onHoverChange = null,
}) {
  const portalRef = useRef();
  const lightRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notify parent component about hover state changes
  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(hovered);
    }
  }, [hovered, onHoverChange]);

  // Create portal geometry using extruded shape instead of roundedBoxGeometry
  const portalGeometry = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const shape = createRoundedRectShape(
      PORTAL_CONFIG.width,
      PORTAL_CONFIG.height,
      PORTAL_CONFIG.radius
    );
    const extrudeSettings = {
      steps: 1,
      depth: PORTAL_CONFIG.depth,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Create frame geometry (slightly larger)
  const frameGeometry = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const shape = createRoundedRectShape(
      PORTAL_CONFIG.width + 0.05,
      PORTAL_CONFIG.height + 0.05,
      PORTAL_CONFIG.radius + 0.01
    );
    const extrudeSettings = {
      steps: 1,
      depth: 0.02,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const { portalScale } = useSpring({
    portalScale: hovered ? 1.02 : 1,
    config: { mass: 0.3, tension: 400, friction: 20 },
  });

  useFrame((state, delta) => {
    if (!isMounted) return;

    const time = state.clock.elapsedTime * 0.5;

    if (lightRef.current) {
      const intensity = 12 + Math.sin(time) * 1.5;
      lightRef.current.intensity = intensity;
      if (time % 2 > 1) {
        lightRef.current.color.setHSL((time * 0.05) % 1, 0.7, 0.7);
      }
    }

    if (portalRef.current) {
      portalRef.current.blend = THREE.MathUtils.lerp(
        portalRef.current.blend,
        hovered ? 0 : 0,
        0.1
      );
    }
  });

  // Don't render anything on the server
  if (typeof window === 'undefined' || !isMounted) {
    return null;
  }

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={portalScale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Background frame for portal */}
      <mesh geometry={frameGeometry} position={[0, 0, -0.001]}>
        <meshBasicMaterial color="black" />
      </mesh>

      {/* Main portal with MeshPortalMaterial */}
      <mesh geometry={portalGeometry}>
        <MeshPortalMaterial
          ref={portalRef}
          transparent={true}
          toneMapped={false}
          transmission={1}
          resolution={256}
          side={THREE.DoubleSide}
        >
          <color attach="background" args={['#B4D45A']} />
          {/* <fog attach="fog" args={['#1a1a1a', 15, 25]} /> */}

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#5A1A8A" />
          </mesh>

          <ambientLight intensity={4.8} />
          <spotLight
            ref={lightRef}
            position={[0, 5, 4]}
            intensity={8}
            angle={0.8}
            penumbra={0.5}
            decay={1.5}
            castShadow
          />

          {children}
        </MeshPortalMaterial>
      </mesh>

      {/* Point light for external glow */}
      {/* <pointLight
        position={[0, 0, 1]}
        distance={3}
        intensity={hovered ? 3 : 2}
        color="#4a9eff"
      /> */}
    </animated.group>
  );
}
