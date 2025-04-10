'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the HomeMainScene component with SSR disabled
const DynamicHomeMainScene = dynamic(() => import('./HomeMainScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * A wrapper component that ensures HomeMainScene is only rendered on the client side
 * with SSR disabled to avoid "window is not defined" errors.
 *
 * Instead of using ref forwarding, we pass the ref as a regular prop named sceneRef
 */
const ClientHomeMainScene = ({ sceneRef, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <DynamicHomeMainScene {...props} sceneRef={sceneRef} />;
};

export default ClientHomeMainScene;
