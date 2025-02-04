'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4WNpKyPKuZTGcFFvhJaqs-z97ILDcz0k",
  authDomain: "reinforce-338b3.firebaseapp.com",
  databaseURL: "https://reinforce-338b3-default-rtdb.firebaseio.com",
  projectId: "reinforce-338b3",
  storageBucket: "reinforce-338b3.firebasestorage.app",
  messagingSenderId: "706280654033",
  appId: "1:706280654033:web:c661fe657313912d4ab1f0",
  measurementId: "G-WFWBW7L73G",
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

const initializeFirebase = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Initialize or get existing app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Enable auth persistence
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.warn('Auth persistence failed, falling back to default:', error);
    }

  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Set services to null if initialization fails
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
};

// Initialize Firebase when the module is imported
initializeFirebase();

export { app, auth, db, storage };
