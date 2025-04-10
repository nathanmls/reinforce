'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mentorService } from '../services/mentorService';
import { homeworkService } from '../services/homeworkService';
import { USER_ROLES } from '../config/roles';
import dynamic from 'next/dynamic';
import ClientOnlyFirebase from '../components/ClientOnlyFirebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiPlus } from 'react-icons/fi';

// Import VoiceAssistant with dynamic import to avoid SSR issues
const VoiceAssistant = dynamic(() => import('../components/voice-assistant'), {
  ssr: false,
});

export default function AppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ClientOnlyFirebase
        fallback={<LoadingSpinner message="Initializing Reinforce App..." />}
      >
        <AppContent />
      </ClientOnlyFirebase>
    </div>
  );
}

function AppContent() {
  const { user, userRole, userProfile, loading: authLoading } = useAuth();
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const isStudent = userRole === USER_ROLES.STUDENT;
  const isManager = userRole === USER_ROLES.MANAGER;
  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;

  useEffect(() => {
    const fetchMentors = async () => {
      if (!user || authLoading) return;

      setLoading(true);
      try {
        if (isStudent) {
          // Fetch mentors assigned to this student
          const mentors = await mentorService.getMentorsByStudent(user.uid);
          setAssignedMentors(mentors);
        } else if (isManager) {
          // Fetch mentors assigned to this manager
          const mentors = await mentorService.getMentorsByManager(user.uid);
          setAssignedMentors(mentors);
        } else if (isAdmin) {
          // Fetch all mentors
          const mentors = await mentorService.getAllMentors();
          setAssignedMentors(mentors);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [user, userRole, isStudent, isManager, isAdmin, authLoading]);

  if (authLoading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Please sign in to access the Reinforce App
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          You need to be signed in to use the Reinforce learning platform.
        </p>
        <a
          href="/login"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Voice Assistant Integration */}
      <VoiceAssistant />
    </div>
  );
}
