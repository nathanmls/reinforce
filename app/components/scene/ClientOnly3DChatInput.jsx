'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3DChatInput component with SSR disabled
const ThreeDChatInput = dynamic(() => import('./ThreeDChatInput'), { ssr: false });

/**
 * ClientOnly3DChatInput is a wrapper component that ensures the ThreeDChatInput component
 * is only rendered on the client-side to avoid "window is not defined" errors.
 */
export default function ClientOnly3DChatInput(props) {
  return (
    <Suspense fallback={null}>
      <ThreeDChatInput {...props} />
    </Suspense>
  );
}
