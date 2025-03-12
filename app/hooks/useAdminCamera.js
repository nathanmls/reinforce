'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const MOVE_SPEED = 0.1;
const ROTATION_SPEED = 0.02;
const MAX_POLAR_ANGLE = Math.PI * 0.85;
const MIN_POLAR_ANGLE = Math.PI * 0.15;

export default function useAdminCamera(camera, isExplorationMode, userRole) {
  const keys = useRef({});
  const rotationState = useRef({
    pitch: 0, // X rotation (up/down)
    yaw: 0,   // Y rotation (left/right)
  });
  
  useEffect(() => {
    if (!camera) return;

    // Initialize rotation state from camera's current rotation
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    rotationState.current = {
      pitch: euler.x,
      yaw: euler.y,
    };
    
    const handleKeyDown = (e) => {
      if (!e || !e.key) return;
      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      if (!e || !e.key) return;
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  const updateCamera = useCallback(() => {
    if (!camera || userRole !== 'administrator' || !isExplorationMode) return;

    const { w, a, s, d, arrowleft, arrowright, arrowup, arrowdown } = keys.current;

    // Update rotation state
    if (arrowleft) {
      rotationState.current.yaw += ROTATION_SPEED;
    }
    if (arrowright) {
      rotationState.current.yaw -= ROTATION_SPEED;
    }
    if (arrowup) {
      rotationState.current.pitch = Math.max(
        rotationState.current.pitch + ROTATION_SPEED,
        -MAX_POLAR_ANGLE + Math.PI / 2
      );
    }
    if (arrowdown) {
      rotationState.current.pitch = Math.min(
        rotationState.current.pitch - ROTATION_SPEED,
        -MIN_POLAR_ANGLE + Math.PI / 2
      );
    }

    // Apply rotations in the correct order (YXZ)
    const quaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(0, rotationState.current.yaw, 0, 'YXZ'))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rotationState.current.pitch, 0, 0, 'YXZ')));
    
    camera.quaternion.copy(quaternion);

    // Calculate movement direction based on camera's rotation
    const direction = new THREE.Vector3();
    
    // Forward/backward movement
    if (w || s) {
      direction.z = s ? MOVE_SPEED : -MOVE_SPEED;
    }
    
    // Left/right movement
    if (a || d) {
      direction.x = d ? MOVE_SPEED : -MOVE_SPEED;
    }

    // Apply movement in camera's local space
    if (direction.length() > 0) {
      direction.applyQuaternion(camera.quaternion);
      camera.position.add(direction);
    }
  }, [camera, isExplorationMode, userRole]);

  return updateCamera;
}
