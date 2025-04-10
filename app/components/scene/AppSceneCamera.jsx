'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AppSceneCamera - Creates a stable orbiting camera effect for the AppScene
 *
 * This component tracks mouse movement and makes the camera orbit around a center point,
 * creating a dynamic, interactive viewing experience without disrupting the scene.
 *
 * @param {Object} props
 * @param {number} props.intensity - How strongly the camera orbits (0-1)
 * @param {number} props.smoothing - How smoothly the camera transitions (higher = smoother)
 * @param {boolean} props.enabled - Whether the effect is enabled
 * @param {number} props.orbitRadius - The radius of the orbit around the center
 * @param {THREE.Vector3} props.orbitCenter - The center point to orbit around
 */
export default function AppSceneCamera({
  intensity = 0.1,
  smoothing = 8,
  enabled = true,
  orbitRadius = 1.5,
  orbitCenter = new THREE.Vector3(0, 0.5, 0),
}) {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMounted = useRef(false);
  const initialCameraPosition = useRef(new THREE.Vector3());
  const orbitAngleX = useRef(0);
  const orbitAngleY = useRef(0);
  const targetOrbitAngleX = useRef(0);
  const targetOrbitAngleY = useRef(0);
  const basePosition = useRef(new THREE.Vector3());

  // Initialize camera and set up mouse tracking
  useEffect(() => {
    if (!isMounted.current) {
      // Store initial camera position
      initialCameraPosition.current.copy(camera.position);
      basePosition.current.copy(camera.position);
      isMounted.current = true;
    }

    const handleMouseMove = (event) => {
      if (!enabled) return;

      // Calculate normalized mouse position (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, enabled]);

  // Apply camera orbiting on each frame
  useFrame(() => {
    if (!enabled || !isMounted.current) return;

    // Calculate target orbit angles based on mouse position
    targetOrbitAngleX.current = mousePosition.x * Math.PI * intensity;
    targetOrbitAngleY.current = mousePosition.y * Math.PI * intensity;
    
    // Apply reasonable limits to prevent extreme camera movement
    const maxX = Math.PI * 0.1;
    const maxY = Math.PI * 0.05;
    
    // Clamp both horizontal and vertical orbiting
    targetOrbitAngleX.current = Math.max(-maxX, Math.min(maxX, targetOrbitAngleX.current));
    targetOrbitAngleY.current = Math.max(-maxY, Math.min(maxY, targetOrbitAngleY.current));
    
    // Smoothly interpolate current orbit angles
    orbitAngleX.current += (targetOrbitAngleX.current - orbitAngleX.current) / smoothing;
    orbitAngleY.current += (targetOrbitAngleY.current - orbitAngleY.current) / smoothing;
    
    // Calculate the new camera position based on orbit angles
    const newPosition = new THREE.Vector3();
    
    // Start from the orbit center
    newPosition.copy(orbitCenter);
    
    // Add the base distance from center
    newPosition.x += basePosition.current.x - orbitCenter.x;
    newPosition.y += basePosition.current.y - orbitCenter.y;
    newPosition.z += basePosition.current.z - orbitCenter.z;
    
    // Apply the orbit rotation
    const offsetX = Math.sin(orbitAngleX.current) * orbitRadius;
    const offsetY = Math.sin(orbitAngleY.current) * orbitRadius * 0.5;
    const offsetZ = (1 - Math.cos(orbitAngleX.current)) * orbitRadius * 0.2;
    
    newPosition.x += offsetX;
    newPosition.y += offsetY;
    newPosition.z -= offsetZ;
    
    // Apply the position change with appropriate smoothing
    camera.position.lerp(newPosition, 1 / smoothing);
    
    // Make camera look at the orbit center
    camera.lookAt(orbitCenter);
  });

  return null;
}
