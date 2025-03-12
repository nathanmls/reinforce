'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MouseFollowCamera - Adds subtle camera movement that follows the mouse position
 * 
 * This component tracks mouse movement and applies subtle adjustments to the camera
 * position and rotation to create an interactive parallax effect without disrupting existing
 * camera animations.
 * 
 * @param {Object} props
 * @param {number} props.intensity - How strongly the camera follows the mouse (0-1)
 * @param {number} props.smoothing - How smoothly the camera transitions (higher = smoother)
 * @param {boolean} props.enabled - Whether the effect is enabled
 * @param {number} props.rotationIntensity - How strongly the camera rotation follows the mouse (0-1)
 */
export default function MouseFollowCamera({
  intensity = 0.1,
  smoothing = 8,
  enabled = true,
  rotationIntensity = 0.3
}) {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseOffset = useRef(new THREE.Vector3());
  const rotationOffset = useRef(new THREE.Euler());
  const lastBasePosition = useRef(new THREE.Vector3());
  const lastBaseRotation = useRef(new THREE.Euler());
  const isMounted = useRef(false);

  // Initialize on first render
  useEffect(() => {
    if (camera && !isMounted.current) {
      lastBasePosition.current.copy(camera.position);
      lastBaseRotation.current.copy(camera.rotation);
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
  }, [camera, enabled]);

  // Apply camera movement and rotation on each frame
  useFrame(() => {
    if (!enabled || !isMounted.current) return;

    // Calculate the base camera position (without our mouse effect)
    // by removing the previous mouse offset
    const basePosition = new THREE.Vector3().copy(camera.position).sub(mouseOffset.current);
    
    // Update our reference to the base position (from animations)
    lastBasePosition.current.copy(basePosition);
    
    // Calculate new mouse offset for position
    const targetOffset = new THREE.Vector3(
      mousePosition.x * intensity,
      mousePosition.y * intensity,
      0
    );
    
    // Smoothly interpolate the mouse offset for position
    mouseOffset.current.lerp(targetOffset, 1 / smoothing);
    
    // Apply the offset to the camera's current position
    camera.position.copy(basePosition).add(mouseOffset.current);
    
    // Handle camera rotation - but instead of directly setting rotation,
    // we'll use lookAt to maintain the original animation's orientation
    if (rotationIntensity > 0) {
      // Create a look target that's slightly offset from the camera's forward direction
      // based on mouse position
      const lookTarget = new THREE.Vector3();
      
      // Get the camera's current forward direction
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      
      // Calculate a point in front of the camera to look at
      lookTarget.copy(camera.position).add(
        forward.multiplyScalar(10) // Look 10 units ahead
      );
      
      // Add mouse-based offset to the look target
      lookTarget.x += mousePosition.x * rotationIntensity * 2;
      lookTarget.y += mousePosition.y * rotationIntensity * 2;
      
      // Smoothly look at the target
      // We'll create a temporary camera to calculate the desired rotation
      const tempCamera = camera.clone();
      tempCamera.lookAt(lookTarget);
      
      // Extract the rotation as a quaternion
      const targetQuaternion = tempCamera.quaternion;
      
      // Smoothly interpolate to the new rotation
      camera.quaternion.slerp(targetQuaternion, 1 / (smoothing * 2));
    }
  });

  // This component doesn't render anything
  return null;
}
