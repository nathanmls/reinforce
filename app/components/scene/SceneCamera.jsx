// app/components/scene/SceneCamera.jsx
'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { forwardRef } from 'react';

const SceneCamera = forwardRef(({ position = [0, 0, 5] }, ref) => {
  return (
    <PerspectiveCamera
      makeDefault
      ref={ref}
      position={position}
      fov={50}
      near={0.1}
      far={1000}
    />
  );
});

SceneCamera.displayName = 'SceneCamera';

export default SceneCamera;
