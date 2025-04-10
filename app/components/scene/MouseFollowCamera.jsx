'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useDebugCamera } from '@/context/CameraDebugContext';

/**
 * MouseFollowCamera - Creates an orbiting camera effect around the GirlModel based on mouse position
 *
 * This component tracks mouse movement and makes the camera orbit around the GirlModel,
 * creating a dynamic, interactive viewing experience without disrupting existing
 * camera animations.
 *
 * @param {Object} props
 * @param {number} props.intensity - How strongly the camera orbits (0-1)
 * @param {number} props.smoothing - How smoothly the camera transitions (higher = smoother)
 * @param {boolean} props.enabled - Whether the effect is enabled
 * @param {number} props.orbitRadius - The radius of the orbit around the GirlModel
 * @param {THREE.Vector3} props.orbitCenter - The center point to orbit around (defaults to GirlModel position)
 * @param {boolean} props.showHelper - Whether to show debug helpers
 * @param {Object} props.lookTargetOffset - Offset for the look target position for each section
 */
export default function MouseFollowCamera({
  intensity = 0.5,
  smoothing = 8,
  enabled = true,
  orbitRadius = 2, // Default orbit radius
  orbitCenter = new THREE.Vector3(0, -7, 0), // Default center position (GirlModel)
  showHelper = false,
  lookTargetOffset = {
    hero: { x: 0, y: 0, z: 0 },
    welcome: { x: 0, y: 0, z: 0 },
    mentor: { x: 0, y: 0, z: 0 },
    meetTia: { x: -1, y: 0, z: -1 },
  },
  currentSection = 'hero', // Current active section
}) {
  const { camera, scene } = useThree();
  const { setCameraDebugInfo } = useDebugCamera ? useDebugCamera() : { setCameraDebugInfo: () => {} };
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef(new THREE.Vector3());
  const initialCameraPosition = useRef(new THREE.Vector3());
  const initialCameraRotation = useRef(new THREE.Euler());
  const isMounted = useRef(false);
  const orbitAngleX = useRef(0);
  const orbitAngleY = useRef(0);
  const targetOrbitAngleX = useRef(0);
  const targetOrbitAngleY = useRef(0);
  const maxOrbitAngle = useRef(Math.PI * 0.05); // Limit orbit to 5% of PI (very subtle)
  const lookTargetRef = useRef(new THREE.Vector3());
  const lookTargetHelperRef = useRef(null);

  // Create a helper object to visualize the look target
  useEffect(() => {
    if (showHelper && !lookTargetHelperRef.current) {
      // Create a small sphere to represent the look target
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
      lookTargetHelperRef.current = new THREE.Mesh(geometry, material);
      scene.add(lookTargetHelperRef.current);
    }

    return () => {
      if (lookTargetHelperRef.current) {
        scene.remove(lookTargetHelperRef.current);
        lookTargetHelperRef.current.geometry.dispose();
        lookTargetHelperRef.current.material.dispose();
        lookTargetHelperRef.current = null;
      }
    };
  }, [scene, showHelper]);

  // Initialize on first render
  useEffect(() => {
    if (camera && !isMounted.current) {
      // Store initial camera position and rotation as reference
      initialCameraPosition.current.copy(camera.position);
      initialCameraRotation.current.copy(camera.rotation);
      
      // Set initial orbit angles based on camera's position relative to orbit center
      const direction = new THREE.Vector3().subVectors(camera.position, orbitCenter);
      orbitAngleX.current = Math.atan2(direction.z, direction.x);
      orbitAngleY.current = Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z));
      
      targetOrbitAngleX.current = orbitAngleX.current;
      targetOrbitAngleY.current = orbitAngleY.current;
      
      isMounted.current = true;
    }

    // Mouse move handler
    const handleMouseMove = (event) => {
      if (!enabled) return;

      // Calculate normalized mouse position (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      setMousePosition({ x, y });
    };

    // Add and remove event listener
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, enabled, orbitCenter]);

  // Apply camera orbiting on each frame
  useFrame(() => {
    if (!enabled || !isMounted.current) return;

    // Calculate target orbit angles based on mouse position
    // Use the full intensity value the user has set (0.5)
    targetOrbitAngleX.current = mousePosition.x * Math.PI * intensity * 0.3;
    targetOrbitAngleY.current = mousePosition.y * Math.PI * intensity * 0.2;
    
    // Apply reasonable limits to prevent extreme camera movement
    const maxX = Math.PI * 0.15; // Allow more movement than before
    const maxY = Math.PI * 0.1;  // Still restrict vertical movement more
    
    // Clamp both horizontal and vertical orbiting
    targetOrbitAngleX.current = Math.max(-maxX, Math.min(maxX, targetOrbitAngleX.current));
    targetOrbitAngleY.current = Math.max(-maxY, Math.min(maxY, targetOrbitAngleY.current));
    
    // Smoothly interpolate current orbit angles
    orbitAngleX.current += (targetOrbitAngleX.current - orbitAngleX.current) / smoothing;
    orbitAngleY.current += (targetOrbitAngleY.current - orbitAngleY.current) / smoothing;
    
    // Get the base camera position from the current animation frame
    const basePosition = camera.position.clone();
    
    // Calculate orbit offset vector
    const offsetX = Math.sin(orbitAngleX.current) * orbitRadius;
    const offsetY = Math.sin(orbitAngleY.current) * orbitRadius;
    const offsetZ = (1 - Math.cos(orbitAngleX.current)) * orbitRadius;
    
    // Apply the offset to create orbiting motion
    targetPosition.current.set(
      basePosition.x + offsetX,
      basePosition.y + offsetY,
      basePosition.z + offsetZ
    );
    
    // Apply the position change with appropriate smoothing
    camera.position.lerp(targetPosition.current, 1 / smoothing);
    
    // Calculate a look target that maintains the camera's general direction
    // but adds a slight adjustment based on the orbit
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Get the current section's look target offset
    const currentOffset = lookTargetOffset[currentSection] || { x: 0, y: 0, z: 0 };
    
    // Calculate the look target with section-specific offset
    lookTargetRef.current.copy(camera.position).add(
      forward.clone().multiplyScalar(10)
    );
    
    // Apply section-specific offset
    lookTargetRef.current.x += currentOffset.x - orbitAngleX.current * 2;
    lookTargetRef.current.y += currentOffset.y - orbitAngleY.current * 2;
    lookTargetRef.current.z += currentOffset.z;
    
    // Create a temporary camera to calculate the desired rotation
    const tempCamera = camera.clone();
    tempCamera.lookAt(lookTargetRef.current);
    
    // Apply a subtle rotation adjustment
    camera.quaternion.slerp(tempCamera.quaternion, 1 / (smoothing * 1.5));
    
    // Update the helper position if it exists
    if (lookTargetHelperRef.current) {
      lookTargetHelperRef.current.position.copy(lookTargetRef.current);
    }
    
    // Update debug info if available
    if (setCameraDebugInfo) {
      setCameraDebugInfo({
        lookTarget: {
          x: lookTargetRef.current.x.toFixed(2),
          y: lookTargetRef.current.y.toFixed(2),
          z: lookTargetRef.current.z.toFixed(2),
        },
        orbitAngles: {
          x: orbitAngleX.current.toFixed(2),
          y: orbitAngleY.current.toFixed(2),
        },
        section: currentSection,
      });
    }
  });

  // This component doesn't render anything
  return null;
}
