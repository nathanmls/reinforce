'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db as dbImport } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { USER_ROLES } from '../../config/roles';
import { mentorService } from '../../services/mentorService';
import { elevenLabsService } from '../../services/elevenLabsService'; // Import the elevenLabsService as named import
import ElevenLabsAgentForm from '../../components/institution/ElevenLabsAgentForm';
import ClientOnlyFirebase from '../../components/ClientOnlyFirebase';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast'; // Import toast

export default function MentorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mentors Management</h1>
      
      <ClientOnlyFirebase fallback={<LoadingSpinner message="Initializing Firebase..." />}>
        <MentorsPageContent />
      </ClientOnlyFirebase>
    </div>
  );
}

function MentorsPageContent() {
  const { user, userRole, userProfile } = useAuth();
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [elevenLabsAgents, setElevenLabsAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'available', 'unavailable', 'unknown'
  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;
  
  // Use the imported db instance instead of creating a new one
  const db = dbImport;

  // Load assigned mentors for the user
  const loadAssignedMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid user and db
      if (!user || !db) {
        console.warn('User or Firestore not available');
        setLoading(false);
        return;
      }
      
      let mentorsData = [];
      
      if (isAdmin) {
        // Admins can see all mentors
        const mentorsSnapshot = await getDocs(collection(db, 'mentors'));
        mentorsData = mentorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        // Regular users only see assigned mentors
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData && userData.assignedMentors && userData.assignedMentors.length > 0) {
          const mentorPromises = userData.assignedMentors.map(async (mentorId) => {
            const mentorDoc = await getDoc(doc(db, 'mentors', mentorId));
            if (mentorDoc.exists()) {
              return { id: mentorDoc.id, ...mentorDoc.data() };
            }
            return null;
          });
          
          mentorsData = (await Promise.all(mentorPromises)).filter(Boolean);
        }
      }
      
      setAssignedMentors(mentorsData);
      
      // Load ElevenLabs agents for each mentor
      const agentsPromises = mentorsData.map(async (mentor) => {
        if (mentor.elevenLabsAgentId) {
          try {
            // Skip trying to load mock agents
            if (mentor.elevenLabsAgentId.startsWith('mock-agent-')) {
              // Update the mentor to remove the mock agent ID
              await mentorService.updateMentor(mentor.id, {
                elevenLabsAgentId: null,
                updatedAt: new Date()
              });
              
              return {
                mentorId: mentor.id,
                agent: null
              };
            }
            
            const agent = await mentorService.getElevenLabsAgent(mentor.id);
            return {
              mentorId: mentor.id,
              agent: agent
            };
          } catch (err) {
            console.error(`Error loading agent for mentor ${mentor.id}:`, err);
            
            // If this is a mock agent error, clean up the reference
            if (err.message.includes('mock agent') || 
                (mentor.elevenLabsAgentId && mentor.elevenLabsAgentId.startsWith('mock-agent-'))) {
              try {
                await mentorService.updateMentor(mentor.id, {
                  elevenLabsAgentId: null,
                  updatedAt: new Date()
                });
                
                return {
                  mentorId: mentor.id,
                  agent: null
                };
              } catch (updateErr) {
                console.error(`Error updating mentor ${mentor.id} to remove mock agent:`, updateErr);
              }
            }
            
            return {
              mentorId: mentor.id,
              agent: { 
                id: mentor.elevenLabsAgentId,
                name: mentor.name ? `${mentor.name} Agent` : 'Agent',
                error: err.message
              }
            };
          }
        }
        return null;
      });
      
      const agents = (await Promise.all(agentsPromises)).filter(Boolean);
      setElevenLabsAgents(agents);
      
    } catch (err) {
      console.error('Error loading assigned mentors:', err);
      setError('Failed to load mentors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAssignedMentors();
      checkApiStatus();
    }
  }, [user]);

  // Check if the ElevenLabs API is available
  const checkApiStatus = async () => {
    try {
      const status = await elevenLabsService.checkApiStatus();
      setApiStatus(status ? 'available' : 'unavailable');
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('unavailable');
    }
  };

  const handleCreateAgent = (mentor) => {
    setSelectedMentor(mentor);
    setIsEditing(false);
    setSelectedAgent(null);
    setShowAgentForm(true);
  };

  const handleEditAgent = (mentor, agent) => {
    setIsEditing(true);
    setSelectedMentor(mentor);
    setSelectedAgent(agent);
    setShowAgentForm(true);
  };

  const handleAgentCreated = async (mentorId, agentData) => {
    try {
      setLoading(true);
      
      // Create the agent using the mentorService with the form data
      await mentorService.createElevenLabsAgent(mentorId, null, agentData);
      
      // Reload mentors to get updated data
      await loadAssignedMentors();
      
      setShowAgentForm(false);
      setSelectedMentor(null);
      setError(null);
      toast.success('ElevenLabs agent created successfully!');
      
      return true;
    } catch (err) {
      console.error('Error creating agent:', err);
      setError(`Failed to create agent: ${err.message}`);
      toast.error(`Failed to create agent: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAgentEdited = async (mentorId, agentData) => {
    try {
      setLoading(true);
      
      if (!selectedAgent || !selectedAgent.id) {
        throw new Error('Agent information is missing');
      }
      
      // Call the updateElevenLabsAgent method with the correct parameters
      await mentorService.updateElevenLabsAgent(mentorId, selectedAgent.id, agentData);
      
      // Reload mentors to get updated data
      await loadAssignedMentors();
      
      setShowAgentForm(false);
      setSelectedMentor(null);
      setSelectedAgent(null);
      setIsEditing(false);
      toast.success('ElevenLabs agent updated successfully!');
      
      return true;
    } catch (err) {
      console.error('Error editing ElevenLabs agent:', err);
      setError('Failed to edit ElevenLabs agent. Please try again.');
      toast.error(`Failed to update agent: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (mentorId, agentId) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the deleteElevenLabsAgent method
      await mentorService.deleteElevenLabsAgent(mentorId);
      
      // Reload mentors to get updated data
      await loadAssignedMentors();
      
      setError(null);
    } catch (err) {
      console.error('Error deleting ElevenLabs agent:', err);
      setError('Failed to delete ElevenLabs agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner message="Loading mentors..." />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {apiStatus !== 'unknown' && (
        <div className={`${apiStatus === 'available' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded mb-4 border flex items-center`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <span className="font-medium">ElevenLabs API Status:</span> {apiStatus === 'available' ? 'Available' : 'Unavailable'}
            {apiStatus !== 'available' && (
              <p className="text-sm mt-1">
                The ElevenLabs API is currently unavailable. You won't be able to create or manage agents until the API is back online.
              </p>
            )}
          </div>
        </div>
      )}
      
      {!loading && assignedMentors.length === 0 && (
        <p className="text-center">No mentors assigned yet.</p>
      )}
      
      {assignedMentors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedMentors.map((mentor) => {
            const agentData = elevenLabsAgents.find(a => a.mentorId === mentor.id);
            
            return (
              <div key={mentor.id} className="border rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{mentor.name}</h2>
                <p className="text-gray-600 mb-4">{mentor.description || 'No description available'}</p>
                
                {agentData ? (
                  <div className="p-3 rounded-md bg-green-50">
                    <h3 className="font-medium text-green-800">
                      ElevenLabs Agent
                    </h3>
                    <p className="text-sm text-green-700">
                      ID: {agentData.agent.id}
                    </p>
                    <p className="text-sm text-green-700">
                      Name: {agentData.agent.name}
                    </p>
                    {agentData.agent.error && (
                      <p className="text-sm text-orange-700 mt-2">Note: {agentData.agent.error}</p>
                    )}
                    
                    <div className="flex mt-3 space-x-2">
                      <button
                        onClick={() => handleEditAgent(mentor, agentData.agent)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit Agent
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(mentor.id, agentData.agent.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete Agent
                      </button>
                    </div>
                  </div>
                ) : null}
                
                <div className="mt-3">
                  <button
                    onClick={() => handleCreateAgent(mentor)}
                    disabled={apiStatus === 'unavailable'}
                    className={`${agentData 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : apiStatus === 'unavailable'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'} px-4 py-2 rounded`}
                  >
                    {agentData ? 'Create New Agent' : 'Create ElevenLabs Agent'}
                  </button>
                  {apiStatus === 'unavailable' && !agentData && (
                    <p className="text-sm text-red-600 mt-1">
                      ElevenLabs API is currently unavailable
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {showAgentForm && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? `Edit ElevenLabs Agent for ${selectedMentor.name}` : `Create ElevenLabs Agent for ${selectedMentor.name}`}</h2>
            <ElevenLabsAgentForm 
              mentor={selectedMentor}
              onSubmit={isEditing ? handleAgentEdited : handleAgentCreated} 
              onCancel={() => {
                setShowAgentForm(false);
                setSelectedMentor(null);
                setSelectedAgent(null);
                setIsEditing(false);
              }}
              initialData={isEditing ? selectedAgent : {
                name: `${selectedMentor.name} Agent`,
                description: `Virtual agent for ${selectedMentor.name}`,
              }}
              isEditing={isEditing}
              agent={selectedAgent}
            />
          </div>
        </div>
      )}
    </div>
  );
}
