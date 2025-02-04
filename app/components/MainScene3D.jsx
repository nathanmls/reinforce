'use client';

import { forwardRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import HomeMainScene from './HomeMainScene';

const MainScene3D = forwardRef((props, ref) => {
  // Add debug log to check ref
  useEffect(() => {
    console.log('[MainScene3D] Received ref:', ref);
  }, [ref]);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ 
          position: [-5, -7, 8],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        shadows
      >
        <Suspense fallback={null}>
          <HomeMainScene ref={ref} />
        </Suspense>
      </Canvas>
    </div>
  );
});

MainScene3D.displayName = 'MainScene3D';

export default MainScene3D;