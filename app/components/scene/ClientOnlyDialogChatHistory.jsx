'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the DialogChatHistory component with SSR disabled
const DialogChatHistory = dynamic(() => import('./DialogChatHistory'), {
  ssr: false,
});

/**
 * ClientOnlyDialogChatHistory is a wrapper component that ensures the DialogChatHistory component
 * is only rendered on the client-side to avoid "window is not defined" errors.
 */
export default function ClientOnlyDialogChatHistory(props) {
  return (
    <Suspense fallback={null}>
      <DialogChatHistory {...props} />
    </Suspense>
  );
}
