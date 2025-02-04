'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const FirebaseContext = createContext({
  isInitialized: false,
  hasError: false,
  error: null,
  isBlocked: false
});

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
  const [state, setState] = useState({
    isInitialized: false,
    hasError: false,
    error: null,
    isBlocked: false
  });

  useEffect(() => {
    const checkFirebaseServices = async () => {
      try {
        // Check if Firebase services are initialized
        if (!auth || !db || !storage) {
          setState({
            isInitialized: true,
            hasError: true,
            error: new Error('Firebase services failed to initialize'),
            isBlocked: false
          });
          return;
        }

        // Try to enable offline persistence
        try {
          await enableIndexedDbPersistence(db);
        } catch (err) {
          // These errors are okay and expected in some cases
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.info('Multiple tabs open, persistence enabled in another tab');
          } else if (err.code === 'unimplemented') {
            // The current browser doesn't support persistence
            console.info('Current browser doesn\'t support persistence');
          }
        }

        // Set up auth state listener to confirm services are working
        const unsubscribe = onAuthStateChanged(auth, 
          () => {
            setState({
              isInitialized: true,
              hasError: false,
              error: null,
              isBlocked: false
            });
          },
          (error) => {
            setState({
              isInitialized: true,
              hasError: true,
              error,
              isBlocked: error.code === 'auth/network-request-failed'
            });
          }
        );

        return () => unsubscribe();
      } catch (error) {
        setState({
          isInitialized: true,
          hasError: true,
          error,
          isBlocked: error.message.includes('network') || error.message.includes('blocked')
        });
      }
    };

    checkFirebaseServices();
  }, []);

  return (
    <FirebaseContext.Provider value={state}>
      {children}
    </FirebaseContext.Provider>
  );
}
