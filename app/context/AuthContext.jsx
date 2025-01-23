'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  const updateUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
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
    if (typeof window === 'undefined') return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('Auth state changed - User found:', user.uid);
          setUser(user);
          await updateUserProfile(user.uid);
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
      setError(null);
      setLoading(true);
      
      // Set persistence before signing up
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: USER_ROLES.STUDENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
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
    <AuthContext.Provider value={{
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
      initialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};
