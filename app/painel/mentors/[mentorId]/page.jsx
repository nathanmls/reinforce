'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const mentorStyles = {
  elementary: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    emoji: '🎓',
  },
  middle: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    emoji: '📚',
  },
  high: {
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    emoji: '🎯',
  },
  college: {
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    emoji: '🎓',
  },
};

export default function MentorChatPage() {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const style =
    mentorStyles[mentorId.replace('-chat', '')] || mentorStyles.elementary;

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className={`p-6 rounded-lg ${style.bgColor} mb-6`}>
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{style.emoji}</span>
          <div>
            <h1 className={`text-2xl font-semibold ${style.textColor}`}>
              {mentorId
                .replace('-chat', '')
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}{' '}
              School Mentor
            </h1>
            <p className="text-gray-600">
              Welcome back, {userData?.name}! How can I help you today?
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chat interface will be implemented here */}
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600">
            Chat functionality coming soon! This mentor will help you with your
            studies and academic goals.
          </p>
        </div>
      </div>
    </div>
  );
}
