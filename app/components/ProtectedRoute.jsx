'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS } from '../config/roles';

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const getRequiredPermission = (pathname) => {
  // Only run this on the client side
  if (!isBrowser || !pathname) return null;

  const path = pathname.split('/')[2]; // Get the second part of the path after /dashboard/

  switch (path) {
    case 'users':
      return 'canAccessUsers';
    case 'students':
      return 'canAccessStudents';
    case 'homework':
      return 'canAccessHomework';
    case 'mentors':
      return 'canAccessMentors';
    case 'plan':
      return 'canAccessDashboard'; // Only admins and managers can access plan
    case undefined: // Dashboard page
      return 'canAccessDashboard';
    default:
      return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const { user, userRole, loading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip this effect on server-side rendering
    if (!isBrowser) return;

    // Wait for auth to initialize
    if (!initialized) return;

    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Get required permission for current path
    const requiredPermission = getRequiredPermission(pathname);

    // Get user permissions based on role
    const permissions =
      userRole && ROLE_PERMISSIONS[userRole] ? ROLE_PERMISSIONS[userRole] : {};

    // If page requires specific permission and user doesn't have it
    if (requiredPermission && !permissions[requiredPermission]) {
      console.log('Access denied:', pathname, 'requires', requiredPermission);
      router.push('/painel'); // Redirect to main dashboard which should be accessible by all
    }

    // Mark permission check as complete
    setIsChecking(false);
  }, [router, user, userRole, pathname, loading, initialized]);

  // Show nothing while loading, checking permissions, or not initialized
  if (loading || isChecking || !initialized) {
    return null;
  }

  // Don't render anything if no user
  if (!user) {
    return null;
  }

  // Final permission check before rendering
  const requiredPermission = getRequiredPermission(pathname);
  const permissions =
    userRole && ROLE_PERMISSIONS[userRole] ? ROLE_PERMISSIONS[userRole] : {};

  if (requiredPermission && !permissions[requiredPermission]) {
    return null;
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;
