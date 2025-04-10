'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  try {
    // Initialize or get existing app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Enable auth persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Auth persistence failed, falling back to default:', error);
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Set services to null if initialization fails
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export { app, auth, db, storage };
