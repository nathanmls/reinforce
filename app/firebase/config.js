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

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Enable persistence
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });
}

export { app, auth, db, storage };
