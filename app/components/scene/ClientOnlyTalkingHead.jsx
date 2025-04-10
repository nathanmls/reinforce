'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

// Dynamically import TalkingHeadAvatar with SSR disabled
const TalkingHeadAvatar = dynamic(
  () => import('./TalkingHeadAvatar'),
  { 
    ssr: false,
    loading: () => null 
  }
);

// Fallback component in case of errors
const ErrorFallback = (props) => {
  // Forward all props to the error component
  if (props.onAnimationComplete) {
    // Simulate speech completion if text is provided
    if (props.text) {
      setTimeout(() => {
        props.onAnimationComplete();
      }, props.text.length * 50); // Rough estimate: 50ms per character
    }
  }
  
  // Return null - the TalkingHeadAvatar component will handle the fallback rendering
  return null;
};

/**
 * ClientOnlyTalkingHead Component
 * 
 * A client-side only wrapper for the TalkingHeadAvatar component.
 * This ensures the component only renders on the client side,
 * preventing "window is not defined" errors in Next.js.
 */
export default function ClientOnlyTalkingHead(props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={() => <ErrorFallback {...props} />}>
      <TalkingHeadAvatar {...props} />
    </ErrorBoundary>
  );
}
