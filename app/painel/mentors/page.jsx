'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db as dbImport } from '../../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { USER_ROLES } from '../../config/roles';
import { mentorService } from '../../services/mentorService';
import { elevenLabsService } from '../../services/elevenLabsService'; // Import the elevenLabsService as named import
import ElevenLabsAgentForm from '../../components/institution/ElevenLabsAgentForm';
import ClientOnlyFirebase from '../../components/ClientOnlyFirebase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AssignMentorModal from '../../components/mentors/AssignMentorModal';
import toast from 'react-hot-toast'; // Import toast
import { FiEdit, FiTrash2, FiUserPlus, FiUsers, FiExternalLink } from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import Link from 'next/link';

export default function MentorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mentors Management</h1>

      <ClientOnlyFirebase
        fallback={<LoadingSpinner message="Initializing Firebase..." />}
      >
        <MentorsPageContent />
      </ClientOnlyFirebase>
    </div>
  );
}

function MentorsPageContent() {
  const { user, userRole, userProfile } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [managers, setManagers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [elevenLabsAgents, setElevenLabsAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'available', 'unavailable', 'unknown'
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState(''); // 'student', 'manager', or 'institution'
  
  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;
  const isManager = userRole === USER_ROLES.MANAGER;
  const isStudent = userRole === USER_ROLES.STUDENT;

  // Use the imported db instance instead of creating a new one
  const db = dbImport;

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        let mentorsData = [];
        
        if (isAdmin) {
          // Admins see all mentors
          mentorsData = await mentorService.getAllMentors();
        } else if (isManager) {
          // Managers see mentors assigned to them
          mentorsData = await mentorService.getMentorsByManager(user.uid);
        } else if (isStudent) {
          // Students see mentors assigned to them
          mentorsData = await mentorService.getMentorsByStudent(user.uid);
        } else if (userProfile?.institutionId) {
          // Institution users see mentors assigned to their institution
          mentorsData = await mentorService.getMentorsByInstitution(userProfile.institutionId);
        }
        
        setMentors(mentorsData);
        
        // Fetch ElevenLabs agents for each mentor
        const agentsPromises = mentorsData.map(async (mentor) => {
          if (mentor.elevenLabsAgentId) {
            try {
              const agent = await mentorService.getElevenLabsAgent(mentor.id);
              return { mentorId: mentor.id, agent };
            } catch (error) {
              console.error(`Error fetching agent for mentor ${mentor.id}:`, error);
              return { mentorId: mentor.id, agent: null };
            }
          }
          return { mentorId: mentor.id, agent: null };
        });
        
        const agentsResults = await Promise.all(agentsPromises);
        const agentsMap = {};
        agentsResults.forEach(result => {
          if (result.agent) {
            agentsMap[result.mentorId] = result.agent;
          }
        });
        
        setElevenLabsAgents(agentsMap);
        
        // Check ElevenLabs API status
        try {
          const status = await elevenLabsService.checkApiStatus();
          setApiStatus(status.available ? 'available' : 'unavailable');
        } catch (error) {
          console.error('Error checking ElevenLabs API status:', error);
          setApiStatus('unavailable');
        }
        
        // Fetch users for assignment if admin or manager
        if (isAdmin || isManager) {
          // Fetch students
          const studentsRef = collection(db, 'users');
          const studentsQuery = query(studentsRef, where('role', '==', USER_ROLES.STUDENT));
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentsData = [];
          studentsSnapshot.forEach(doc => {
            studentsData.push({ id: doc.id, ...doc.data() });
          });
          setStudents(studentsData);
          
          // Fetch institutions
          const institutionsRef = collection(db, 'institutions');
          const institutionsSnapshot = await getDocs(institutionsRef);
          const institutionsData = [];
          institutionsSnapshot.forEach(doc => {
            institutionsData.push({ id: doc.id, ...doc.data() });
          });
          setInstitutions(institutionsData);
          
          // Fetch managers (admin only)
          if (isAdmin) {
            const managersRef = collection(db, 'users');
            const managersQuery = query(managersRef, where('role', '==', USER_ROLES.MANAGER));
            const managersSnapshot = await getDocs(managersQuery);
            const managersData = [];
            managersSnapshot.forEach(doc => {
              managersData.push({ id: doc.id, ...doc.data() });
            });
            setManagers(managersData);
          }
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setError(error.message);
        toast.error(`Failed to load mentors: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [db, user, userRole, userProfile, isAdmin, isManager, isStudent]);

  const handleCreateAgent = (mentor) => {
    setSelectedMentor(mentor);
    setIsEditing(false);
    setSelectedAgent(null);
    setShowAgentForm(true);
  };

  const handleEditAgent = async (mentor) => {
    setSelectedMentor(mentor);
    setIsEditing(true);
    setShowAgentForm(true);
    
    try {
      const agent = await mentorService.getElevenLabsAgent(mentor.id);
      setSelectedAgent(agent);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast.error(`Failed to load agent details: ${error.message}`);
      setSelectedAgent(null);
    }
  };

  const handleAgentFormSuccess = (result) => {
    setShowAgentForm(false);
    
    // Update the mentors list with the new agent ID
    setMentors(prevMentors => 
      prevMentors.map(mentor => 
        mentor.id === result.mentorId 
          ? { ...mentor, elevenLabsAgentId: result.agentId, elevenLabsAgentName: result.agentName } 
          : mentor
      )
    );
    
    // Update the agents map
    setElevenLabsAgents(prevAgents => ({
      ...prevAgents,
      [result.mentorId]: result.agent
    }));
    
    toast.success(isEditing ? 'Agent updated successfully!' : 'Agent created successfully!');
  };

  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }
    
    try {
      await mentorService.deleteMentor(mentorId);
      setMentors(prevMentors => prevMentors.filter(mentor => mentor.id !== mentorId));
      toast.success('Mentor deleted successfully!');
    } catch (error) {
      console.error('Error deleting mentor:', error);
      toast.error(`Failed to delete mentor: ${error.message}`);
    }
  };

  const handleAssignMentor = (mentor, type) => {
    setSelectedMentor(mentor);
    setAssignType(type);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = (result) => {
    setShowAssignModal(false);
    
    // Update the mentors list with the new assignments
    setMentors(prevMentors => 
      prevMentors.map(mentor => 
        mentor.id === result.id ? result : mentor
      )
    );
    
    toast.success(`Mentor assigned successfully!`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading mentors..." />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length > 0 ? (
          mentors.map(mentor => (
            <div key={mentor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{mentor.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{mentor.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    {(isAdmin || isManager) && (
                      <>
                        <button
                          onClick={() => handleDeleteMentor(mentor.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Mentor"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                    <Link 
                      href={`/app`} 
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Access App"
                    >
                      <FiExternalLink size={18} />
                    </Link>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avatar: <span className="font-medium">{mentor.avatarId}</span>
                  </p>
                  
                  {mentor.institutions && mentor.institutions.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Institutions: <span className="font-medium">{mentor.institutions.length}</span>
                    </p>
                  )}
                  
                  {mentor.students && mentor.students.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Students: <span className="font-medium">{mentor.students.length}</span>
                    </p>
                  )}
                  
                  {mentor.managers && mentor.managers.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Managers: <span className="font-medium">{mentor.managers.length}</span>
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ElevenLabs Integration
                  </h4>
                  
                  {mentor.elevenLabsAgentId ? (
                    <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md">
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Agent: <span className="font-medium">{mentor.elevenLabsAgentName || mentor.elevenLabsAgentId}</span>
                      </p>
                      
                      {apiStatus === 'available' && (isAdmin || isManager) && (
                        <button
                          onClick={() => handleEditAgent(mentor)}
                          className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md inline-flex items-center"
                        >
                          <FiEdit size={14} className="mr-1" /> Edit Agent
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        No ElevenLabs agent configured
                      </p>
                      
                      {apiStatus === 'available' && (isAdmin || isManager) && (
                        <button
                          onClick={() => handleCreateAgent(mentor)}
                          className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md inline-flex items-center"
                        >
                          Create Agent
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Assignment buttons for admins and managers */}
                {(isAdmin || isManager) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAssignMentor(mentor, 'student')}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md inline-flex items-center"
                    >
                      <FiUserPlus size={14} className="mr-1" /> Assign to Student
                    </button>
                    
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleAssignMentor(mentor, 'manager')}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md inline-flex items-center"
                        >
                          <FiUsers size={14} className="mr-1" /> Assign to Manager
                        </button>
                        
                        <button
                          onClick={() => handleAssignMentor(mentor, 'institution')}
                          className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md inline-flex items-center"
                        >
                          <BiBuildingHouse size={14} className="mr-1" /> Assign to Institution
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {isStudent 
                ? "You don't have any mentors assigned yet." 
                : "No mentors found."}
            </p>
          </div>
        )}
      </div>
      
      {/* ElevenLabs Agent Form Modal */}
      {showAgentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {isEditing ? 'Edit ElevenLabs Agent' : 'Create ElevenLabs Agent'}
            </h2>
            
            <ElevenLabsAgentForm
              mentorId={selectedMentor.id}
              mentorName={selectedMentor.name}
              isEditing={isEditing}
              initialData={selectedAgent}
              onSuccess={handleAgentFormSuccess}
              onCancel={() => setShowAgentForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Assign Mentor Modal */}
      {showAssignModal && (
        <AssignMentorModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          mentorId={selectedMentor.id}
          mentorName={selectedMentor.name}
          assignType={assignType}
          users={assignType === 'student' ? students : assignType === 'manager' ? managers : institutions}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
