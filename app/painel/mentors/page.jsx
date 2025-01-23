'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { USER_ROLES } from '../../config/roles';

const mentors = [
  {
    id: 'elementary',
    name: 'Elementary School Mentor',
    description: 'Perfect for students aged 6-11. Helps with basic subjects and builds foundational knowledge.',
    subjects: ['Math', 'Science', 'Reading', 'Writing'],
    gradeLevel: 'Elementary School',
    image: '🎓'
  },
  {
    id: 'middle',
    name: 'Middle School Mentor',
    description: 'Designed for students aged 11-14. Focuses on developing critical thinking and study skills.',
    subjects: ['Pre-Algebra', 'Life Science', 'Literature', 'History'],
    gradeLevel: 'Middle School',
    image: '📚'
  },
  {
    id: 'high',
    name: 'High School Mentor',
    description: 'For students aged 14-18. Prepares for college and advanced subjects.',
    subjects: ['Algebra', 'Biology', 'World Literature', 'Chemistry'],
    gradeLevel: 'High School',
    image: '🎯'
  },
  {
    id: 'college',
    name: 'College Prep Mentor',
    description: 'Helps students prepare for college applications and advanced placement courses.',
    subjects: ['SAT/ACT Prep', 'Essay Writing', 'Advanced Math', 'Sciences'],
    gradeLevel: 'College Prep',
    image: '🎓'
  }
];

export default function MentorsPage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignedMentors = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userRole === USER_ROLES.STUDENT) {
            // For students, show their assigned mentor
            const assignedMentorId = userData.assignedMentor || 'elementary';
            const assignedMentor = mentors.find(m => m.id === assignedMentorId);
            if (assignedMentor) {
              setAssignedMentors([assignedMentor]);
            }
          } else {
            // For admin and managers, show all mentors
            setAssignedMentors(mentors);
          }
        }
      } catch (error) {
        console.error('Error loading assigned mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedMentors();
  }, [user, userRole]);

  const startChat = (mentorId) => {
    // Update chat routing based on mentor ID
    router.push(`/painel/mentors/${mentorId}-chat`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        {userRole === USER_ROLES.STUDENT ? 'Your AI Mentor' : 'AI Mentors'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{mentor.image}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {mentor.gradeLevel}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{mentor.name}</h2>
              <p className="text-gray-600 mb-4">{mentor.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects:</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => startChat(mentor.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
