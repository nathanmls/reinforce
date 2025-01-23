'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS } from '../config/roles';

const getRequiredPermission = (pathname) => {
  const path = pathname.split('/')[2]; // Get the second part of the path after /dashboard/
  
  switch (path) {
    case 'users':
      return 'canAccessUsers';
    case 'students':
      return 'canAccessStudents';
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

  useEffect(() => {
    if (!initialized) return; // Wait for auth to initialize
    
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const requiredPermission = getRequiredPermission(pathname);
    const permissions = ROLE_PERMISSIONS[userRole] || {};

    // If page requires specific permission and user doesn't have it
    if (requiredPermission && !permissions[requiredPermission]) {
      console.log('Access denied:', pathname, 'requires', requiredPermission);
      router.push('/painel/mentors'); // Redirect to mentors page which is accessible by all
    }
  }, [router, user, userRole, pathname, loading, initialized]);

  // Show nothing while loading or not initialized
  if (loading || !initialized) return null;

  // Don't render anything until we've checked permissions
  if (!user) return null;

  const requiredPermission = getRequiredPermission(pathname);
  const permissions = ROLE_PERMISSIONS[userRole] || {};

  if (requiredPermission && !permissions[requiredPermission]) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
