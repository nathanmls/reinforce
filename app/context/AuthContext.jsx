'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { USER_ROLES } from '../config/roles';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  const updateUserProfile = async (uid) => {
    try {
      // Check if we're in a browser environment and if db is initialized
      if (!isBrowser || !db) {
        console.warn('Firestore not available or not in browser environment');
        return;
      }

      // Create a reference to the users collection
      const usersCollection = collection(db, 'users');
      if (!usersCollection) {
        console.error('Failed to get users collection reference');
        return;
      }

      // Get the user document
      const userDoc = await getDoc(doc(usersCollection, uid));
      const userData = userDoc.data();

      if (userData) {
        setUserProfile(userData);
        setUserRole(userData.role || USER_ROLES.STUDENT);
      } else {
        console.warn('User document not found in Firestore');
        setUserProfile(null);
        setUserRole(USER_ROLES.STUDENT);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    // Don't run this effect on the server
    if (!isBrowser) return;

    // Don't run this effect if Firebase auth is not available
    if (!auth) {
      console.warn('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('Auth state changed - User found:', user.uid);
          setUser(user);

          // Only try to update the user profile if Firestore is available
          if (db) {
            await updateUserProfile(user.uid);
          } else {
            console.warn('Firestore not initialized, skipping profile update');
          }

          setError(null);
        } else {
          console.log('Auth state changed - No user');
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
          setError(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      // Check if we're in a browser environment and if auth is initialized
      if (!isBrowser || !auth) {
        throw new Error('Firebase auth not available');
      }

      setError(null);
      setLoading(true);

      // Set persistence before signing in
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      // Check if we're in a browser environment and if auth is initialized
      if (!isBrowser || !auth) {
        throw new Error('Firebase auth not available');
      }

      setError(null);
      setLoading(true);

      // Set persistence before signing up
      await setPersistence(auth, browserLocalPersistence);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      if (db) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: USER_ROLES.STUDENT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.warn(
          'Firestore not initialized, skipping user document creation'
        );
      }

      setUserRole(USER_ROLES.STUDENT);
      await updateUserProfile(result.user.uid);
      return result;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        userProfile,
        loading,
        error,
        updateUserProfile,
        login,
        signup,
        logout,
        isAdmin: userRole === USER_ROLES.ADMINISTRATOR,
        isManager: userRole === USER_ROLES.MANAGER,
        isStudent: userRole === USER_ROLES.STUDENT,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
