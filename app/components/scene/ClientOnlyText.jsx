'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Text component with SSR disabled
const DreiText = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Text),
  { ssr: false }
);

/**
 * ClientOnlyText is a wrapper component that ensures the Text component
 * from @react-three/drei is only rendered on the client-side to avoid
 * "window is not defined" errors with troika-worker-utils.
 */
export default function ClientOnlyText(props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <DreiText {...props} />;
}
