'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Define the interface for the component props
interface TiaChatInterfaceProps {
  messages: Array<{
    role: string;
    message: string;
    tentative?: boolean;
    timeInCallSecs?: number;
  }>;
  onSendMessage: (message: { message: string }) => void;
  typingSpeed?: number;
}

// Import TiaChatInterface with dynamic import to ensure client-side only rendering
// Use any type to avoid type mismatches with the imported component
const TiaChatInterface = dynamic(() => import('./TiaChatInterface'), {
  ssr: false,
});

/**
 * ClientOnlyTiaChatInterface Component
 *
 * A wrapper component that ensures TiaChatInterface is only rendered on the client side
 * to avoid "window is not defined" errors in Next.js.
 *
 * @param props - Props to pass to the TiaChatInterface component
 * @returns The TiaChatInterface component or null during server-side rendering
 */
const ClientOnlyTiaChatInterface = ({
  messages = [],
  onSendMessage,
  typingSpeed = 30,
}: TiaChatInterfaceProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <TiaChatInterface
      messages={messages}
      onSendMessage={onSendMessage}
      typingSpeed={typingSpeed}
    />
  );
};

export default ClientOnlyTiaChatInterface;
