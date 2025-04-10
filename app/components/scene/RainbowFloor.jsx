// RainbowFloor.jsx
'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '../../context/ScrollContext';
import PropTypes from 'prop-types';

const RAINBOW_ARCS = [
  { file: '/models/Arc02.glb', y: -10.2 },
  { file: '/models/Arc03.glb', y: -10.1 },
  { file: '/models/Arc04.glb', y: -10 },
  { file: '/models/Arc05.glb', y: -9.9 },
  { file: '/models/Arc06.glb', y: -9.8 },
  { file: '/models/Arc07.glb', y: -9.7 },
];

const FALLBACK_COLORS = ['#FFD12A', '#FF8A00', '#FF5C5C', '#C7DF88', '#AB27D2'];

function ArcModel({ file, position, index, isActive, pulseHeight = 2 }) {
  const arcRef = useRef();
  const { scene } = useGLTF(file);
  const baseY = position[1];
  const [yOffset, setYOffset] = useState(0);
  const [emissiveIntensity, setEmissiveIntensity] = useState(0);
  const originalMaterials = useRef([]);

  // Save original materials on first load
  useEffect(() => {
    if (scene) {
      const materials = [];
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Store original material properties
          materials.push({
            mesh: child,
            originalColor: child.material.color.clone(),
            originalEmissive: child.material.emissive
              ? child.material.emissive.clone()
              : new THREE.Color(0x000000),
          });
        }
      });
      originalMaterials.current = materials;
    }
  }, [scene]);

  // Handle pulsing animation with enhanced effects
  useEffect(() => {
    if (isActive) {
      const delay = index * 150; // Stagger the animations

      // Start animation sequence
      const animationTimeout = setTimeout(() => {
        // Phase 1: Quick rise
        setYOffset(pulseHeight * 0.7);
        setEmissiveIntensity(0.5);

        // Phase 2: Peak and glow
        setTimeout(() => {
          setYOffset(pulseHeight);
          setEmissiveIntensity(1.0);

          // Phase 3: Gradual return to normal
          setTimeout(() => {
            setYOffset(pulseHeight * 0.5);
            setEmissiveIntensity(0.3);

            setTimeout(() => {
              setYOffset(0);
              setEmissiveIntensity(0);
            }, 300);
          }, 200);
        }, 200);
      }, delay);

      return () => clearTimeout(animationTimeout);
    }
  }, [isActive, index, pulseHeight]);

  // Apply material changes based on emissive intensity
  useEffect(() => {
    if (originalMaterials.current.length > 0) {
      originalMaterials.current.forEach(
        ({ mesh, originalColor, originalEmissive }) => {
          if (mesh.material) {
            // Create a new emissive color based on the original color but brighter
            const emissiveColor = originalColor
              .clone()
              .multiplyScalar(emissiveIntensity);

            // Apply the emissive color
            if (mesh.material.emissive) {
              mesh.material.emissive.copy(emissiveColor);
              mesh.material.emissiveIntensity = emissiveIntensity;

              // Optional: slightly boost the base color too
              const boostedColor = originalColor
                .clone()
                .multiplyScalar(1 + emissiveIntensity * 0.2);
              mesh.material.color.copy(boostedColor);
            }
          }
        }
      );
    }
  }, [emissiveIntensity]);

  // Update position with smooth animation
  useFrame(() => {
    if (arcRef.current) {
      // Smoothly interpolate y position for pulse effect
      arcRef.current.position.y = THREE.MathUtils.lerp(
        arcRef.current.position.y,
        baseY + yOffset,
        0.1
      );
    }
  });

  return (
    <primitive
      ref={arcRef}
      object={scene.clone()}
      position={position}
      scale={[1.6, 1.6, 1.6]}
    />
  );
}

ArcModel.propTypes = {
  file: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  pulseHeight: PropTypes.number,
};

// Fallback to original circle geometry if models fail to load
function FallbackCircle({ radius, y, color }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.2, radius, 64]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

FallbackCircle.propTypes = {
  radius: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export function RainbowFloor({ pulseCount: externalPulseCount }) {
  const {
    welcomeProgress,
    heroProgress,
    mentorProgress,
    meetTiaProgress,
    comingSoonProgress,
  } = useScroll();

  // Declare activeSection state FIRST
  const [activeSection, setActiveSection] = useState(null);
  const prevSectionRef = useRef(null);

  // Other state declarations AFTER
  const [shouldPulse, setShouldPulse] = useState(false);
  const [internalPulseCount, setInternalPulseCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(true);
  const pulseIntervalRef = useRef(null);
  const isWelcomeCentered = welcomeProgress >= 0.4 && welcomeProgress <= 0.6;

  // Combined pulse triggers
  useEffect(() => {
    if (externalPulseCount > 0) {
      setInternalPulseCount((prev) => prev + 1);
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 1000);
    }
  }, [externalPulseCount]);

  // Preload all models
  useEffect(() => {
    // Preload the models using useGLTF's preload method
    try {
      RAINBOW_ARCS.forEach((arc) => {
        useGLTF.preload(arc.file);
      });
      setModelsLoaded(true);
    } catch (error) {
      console.error('Failed to preload GLB models:', error);
      setModelsLoaded(false);
    }
  }, []);

  // Determine which section is currently active
  useEffect(() => {
    let currentSection = null;

    if (heroProgress > 0.1 && heroProgress < 0.9) {
      currentSection = 'hero';
    } else if (welcomeProgress > 0.1 && welcomeProgress < 0.9) {
      currentSection = 'welcome';
    } else if (mentorProgress > 0.1 && mentorProgress < 0.9) {
      currentSection = 'mentor';
    } else if (meetTiaProgress > 0.1 && meetTiaProgress < 0.9) {
      currentSection = 'meetTia';
    } else if (comingSoonProgress > 0.1 && comingSoonProgress < 0.9) {
      currentSection = 'comingSoon';
    }

    if (currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  }, [
    heroProgress,
    welcomeProgress,
    mentorProgress,
    meetTiaProgress,
    comingSoonProgress,
    activeSection, // Now properly defined
  ]);

  // Trigger pulse when section changes
  useEffect(() => {
    // Skip the first render
    if (prevSectionRef.current === null) {
      prevSectionRef.current = activeSection;
      return;
    }

    // If we've changed to a new section, trigger a pulse
    if (activeSection !== prevSectionRef.current && activeSection !== null) {
      // Trigger an immediate pulse
      setInternalPulseCount((prev) => prev + 1);

      // Also set shouldPulse to true to ensure the animation runs
      setShouldPulse(true);

      // After a short delay, set it back to match the welcome section state
      setTimeout(() => {
        setShouldPulse(isWelcomeCentered);
      }, 1000);
    }

    // Update the previous section reference
    prevSectionRef.current = activeSection;
  }, [activeSection, isWelcomeCentered]);

  // Check if welcome section is centered and trigger pulse animation
  useEffect(() => {
    // Clear any existing interval when component updates
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    if (isWelcomeCentered && !shouldPulse) {
      setShouldPulse(true);

      // Set up a repeating pulse every 4 seconds
      pulseIntervalRef.current = setInterval(() => {
        setInternalPulseCount((prev) => prev + 1);
      }, 1000);
    } else if (
      !isWelcomeCentered &&
      shouldPulse &&
      activeSection !== prevSectionRef.current
    ) {
      // Only disable pulsing if we're not in a section transition
      setShouldPulse(true);
    }

    // Clean up interval on unmount
    return () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, [isWelcomeCentered, shouldPulse, activeSection]);

  // If models failed to load, use fallback circles
  if (!modelsLoaded) {
    return (
      <>
        {RAINBOW_ARCS.map(({ y }, index) => (
          <FallbackCircle
            key={`rainbow-fallback-${index}`}
            radius={4 + index * 2}
            y={y}
            color={FALLBACK_COLORS[index]}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {RAINBOW_ARCS.map(({ file, y }, index) => (
        <ArcModel
          key={`rainbow-arc-${index}`}
          file={file}
          position={[0, y, 0]}
          index={index}
          isActive={shouldPulse || internalPulseCount > 0}
          pulseHeight={0.3}
        />
      ))}
      <mesh position={[0, -10, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 1, 32]} />
        <meshStandardMaterial
          color={'#DFBD7D'}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0}
        />
      </mesh>
    </>
  );
}

RainbowFloor.propTypes = {
  pulseCount: PropTypes.number,
};
