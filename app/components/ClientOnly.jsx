'use client';

import { useEffect, useState } from 'react';

/**
 * A wrapper component that ensures its children are only rendered on the client side.
 * This is useful for components that use browser-specific APIs.
 */
export default function ClientOnly({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return children;
}
