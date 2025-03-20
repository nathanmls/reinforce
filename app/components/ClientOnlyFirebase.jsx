'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';

/**
 * A wrapper component that ensures Firebase-dependent components 
 * are only rendered on the client side and when Firebase is properly initialized.
 */
export default function ClientOnlyFirebase({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    // Check if Firebase is initialized
    if (db && auth) {
      setIsFirebaseReady(true);
    } else {
      console.warn('Firebase services not initialized properly');
      setIsFirebaseReady(false);
    }
  }, []);

  // Show fallback if not mounted or Firebase isn't ready
  if (!isMounted || !isFirebaseReady) {
    return fallback;
  }

  // Render children only when mounted and Firebase is ready
  return children;
}
