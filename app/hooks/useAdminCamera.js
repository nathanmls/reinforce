'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const MOVE_SPEED = 0.1;
const ROTATION_SPEED = 0.02;

export default function useAdminCamera(camera, isExplorationMode, userRole) {
  const keys = useRef({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updateCamera = () => {
    if (userRole !== 'administrator' || !isExplorationMode) return;

    const { w, a, s, d, arrowleft, arrowright, arrowup, arrowdown } = keys.current;

    // Get camera's local axes
    const matrix = new THREE.Matrix4();
    matrix.extractRotation(camera.matrix);
    
    const forward = new THREE.Vector3(0, 0, -1).applyMatrix4(matrix);
    const right = new THREE.Vector3(1, 0, 0).applyMatrix4(matrix);
    const up = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix);

    // Handle rotations
    if (arrowleft) {
      camera.rotateOnWorldAxis(up, ROTATION_SPEED);
    }
    if (arrowright) {
      camera.rotateOnWorldAxis(up, -ROTATION_SPEED);
    }
    if (arrowup) {
      camera.rotateOnAxis(right, ROTATION_SPEED);
    }
    if (arrowdown) {
      camera.rotateOnAxis(right, -ROTATION_SPEED);
    }

    // Apply movement in local space
    const movement = new THREE.Vector3();

    if (w) movement.add(forward.multiplyScalar(MOVE_SPEED));
    if (s) movement.add(forward.multiplyScalar(-MOVE_SPEED));
    if (a) movement.add(right.multiplyScalar(-MOVE_SPEED));
    if (d) movement.add(right.multiplyScalar(MOVE_SPEED));

    camera.position.add(movement);
  };

  return updateCamera;
}
