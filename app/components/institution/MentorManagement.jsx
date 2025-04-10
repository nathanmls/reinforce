'use client';

import { useState, useEffect } from 'react';
import { mentorService } from '../../services/mentorService';
import { AVATAR_MODELS } from '../../models/Mentor';
import { useAuth } from '../../context/AuthContext';
import ElevenLabsAgentForm from './ElevenLabsAgentForm';

export default function MentorManagement({ institutionId }) {
  const { isAdmin } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [newMentorData, setNewMentorData] = useState({
    name: '',
    email: '',
    avatarId: AVATAR_MODELS.TIA,
  });
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentCreationStatus, setAgentCreationStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    loadMentors();
  }, [institutionId]);

  const loadMentors = async () => {
    try {
      const institutionMentors =
        await mentorService.getMentorsByInstitution(institutionId);
      setMentors(institutionMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      const mentor = await mentorService.createMentor(newMentorData);
      await mentorService.assignMentorToInstitution(mentor.id, institutionId);
      setNewMentorData({ name: '', email: '', avatarId: AVATAR_MODELS.TIA });
      loadMentors();
    } catch (error) {
      console.error('Error creating mentor:', error);
    }
  };

  const handleUpdateAvatar = async (mentorId, avatarId) => {
    try {
      await mentorService.updateMentorAvatar(mentorId, avatarId);
      loadMentors();
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    try {
      await mentorService.removeMentorFromInstitution(mentorId, institutionId);
      loadMentors();
    } catch (error) {
      console.error('Error removing mentor:', error);
    }
  };

  const handleCreateAgent = async (mentorId, apiKey, agentData) => {
    setAgentCreationStatus({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await mentorService.createElevenLabsAgent(mentorId, apiKey, agentData);

      setAgentCreationStatus({
        loading: false,
        success: true,
        error: null,
      });

      // Close the form and reload mentors after a short delay
      setTimeout(() => {
        setShowAgentForm(false);
        loadMentors();
        setAgentCreationStatus({
          loading: false,
          success: false,
          error: null,
        });
      }, 2000);

      return true;
    } catch (error) {
      setAgentCreationStatus({
        loading: false,
        success: false,
        error: error.message || 'Failed to create ElevenLabs agent',
      });
      throw error;
    }
  };

  const openAgentForm = (mentor) => {
    setSelectedMentor(mentor);
    setShowAgentForm(true);
  };

  const closeAgentForm = () => {
    setSelectedMentor(null);
    setShowAgentForm(false);
    setAgentCreationStatus({
      loading: false,
      success: false,
      error: null,
    });
  };

  if (loading) {
    return <div className="text-center">Loading mentors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Mentor</h2>
        <form onSubmit={handleCreateMentor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={newMentorData.name}
              onChange={(e) =>
                setNewMentorData({ ...newMentorData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={newMentorData.email}
              onChange={(e) =>
                setNewMentorData({ ...newMentorData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default Avatar
            </label>
            <select
              value={newMentorData.avatarId}
              onChange={(e) =>
                setNewMentorData({ ...newMentorData, avatarId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.entries(AVATAR_MODELS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Mentor
          </button>
        </form>
      </div>

      {showAgentForm && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            {agentCreationStatus.success ? (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <div className="text-green-600 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Agent Created Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  The ElevenLabs agent has been created and linked to this
                  mentor.
                </p>
              </div>
            ) : (
              <ElevenLabsAgentForm
                mentorId={selectedMentor.id}
                mentorName={selectedMentor.name}
                onCreateAgent={handleCreateAgent}
                onCancel={closeAgentForm}
              />
            )}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Mentors</h2>
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-medium">{mentor.name}</h3>
                <p className="text-sm text-gray-500">{mentor.email}</p>
                {mentor.elevenLabsAgentId && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ElevenLabs Agent:{' '}
                      {mentor.elevenLabsAgentName || 'Connected'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={mentor.avatarId}
                  onChange={(e) =>
                    handleUpdateAvatar(mentor.id, e.target.value)
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(AVATAR_MODELS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key}
                    </option>
                  ))}
                </select>

                {isAdmin && !mentor.elevenLabsAgentId && (
                  <button
                    onClick={() => openAgentForm(mentor)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Agent
                  </button>
                )}

                <button
                  onClick={() => handleRemoveMentor(mentor.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {mentors.length === 0 && (
            <p className="text-gray-500 text-center">
              No mentors assigned to this institution
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
