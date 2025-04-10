'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the TextPlane component with SSR disabled
const TextPlane = dynamic(() => import('./TextPlane'), { ssr: false });

/**
 * ClientOnlyTextPlane is a wrapper component that ensures the TextPlane component
 * is only rendered on the client-side to avoid "window is not defined" errors.
 */
export default function ClientOnlyTextPlane(props) {
  return (
    <Suspense fallback={null}>
      <TextPlane {...props} />
    </Suspense>
  );
}
