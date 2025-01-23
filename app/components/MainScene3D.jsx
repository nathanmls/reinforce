'use client';

import dynamic from 'next/dynamic';

// Import Canvas with no SSR
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

// Import HomeMainScene with no SSR
const HomeMainScene = dynamic(
  () => import('./HomeMainScene'),
  { ssr: false }
);

export default function MainScene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <HomeMainScene />
      </Canvas>
    </div>
  );
}