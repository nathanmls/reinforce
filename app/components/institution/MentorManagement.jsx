'use client';

import { useState, useEffect } from 'react';
import { mentorService } from '../../services/mentorService';
import { AVATAR_MODELS } from '../../models/Mentor';

export default function MentorManagement({ institutionId }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [newMentorData, setNewMentorData] = useState({
    name: '',
    email: '',
    avatarId: AVATAR_MODELS.TIA
  });

  useEffect(() => {
    loadMentors();
  }, [institutionId]);

  const loadMentors = async () => {
    try {
      const institutionMentors = await mentorService.getMentorsByInstitution(institutionId);
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

  if (loading) {
    return <div className="text-center">Loading mentors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Mentor</h2>
        <form onSubmit={handleCreateMentor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newMentorData.name}
              onChange={(e) => setNewMentorData({ ...newMentorData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newMentorData.email}
              onChange={(e) => setNewMentorData({ ...newMentorData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Avatar</label>
            <select
              value={newMentorData.avatarId}
              onChange={(e) => setNewMentorData({ ...newMentorData, avatarId: e.target.value })}
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

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Mentors</h2>
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{mentor.name}</h3>
                <p className="text-sm text-gray-500">{mentor.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={mentor.avatarId}
                  onChange={(e) => handleUpdateAvatar(mentor.id, e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(AVATAR_MODELS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
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
            <p className="text-gray-500 text-center">No mentors assigned to this institution</p>
          )}
        </div>
      </div>
    </div>
  );
}
