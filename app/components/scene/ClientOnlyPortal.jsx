'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the CustomPortal component with SSR disabled
const CustomPortal = dynamic(
  () => import('./CustomPortal'),
  { ssr: false }
);

/**
 * ClientOnlyPortal is a wrapper component that ensures the CustomPortal component
 * is only rendered on the client-side to avoid "window is not defined" errors.
 */
export default function ClientOnlyPortal(props) {
  return (
    <Suspense fallback={null}>
      <CustomPortal {...props} />
    </Suspense>
  );
}
