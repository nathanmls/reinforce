'use client';

import { useState, useEffect } from 'react';
import { mentorService } from '../../services/mentorService';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

export default function AssignMentorModal({
  isOpen,
  onClose,
  mentorId,
  mentorName,
  assignType,
  users,
  onAssignSuccess,
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (users) {
      setFilteredUsers(
        users.filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, users]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error(`Please select a ${assignType === 'student' ? 'student' : 'manager'} to assign`);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (assignType === 'student') {
        result = await mentorService.assignMentorToStudent(mentorId, selectedUserId);
      } else if (assignType === 'manager') {
        result = await mentorService.assignMentorToManager(mentorId, selectedUserId);
      } else if (assignType === 'institution') {
        result = await mentorService.assignMentorToInstitution(mentorId, selectedUserId);
      }

      toast.success(
        `Mentor ${mentorName} successfully assigned to ${assignType}`
      );
      if (onAssignSuccess) {
        onAssignSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error(`Error assigning mentor to ${assignType}:`, error);
      toast.error(`Failed to assign mentor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = assignType === 'student' 
    ? 'Assign Mentor to Student' 
    : assignType === 'manager'
    ? 'Assign Mentor to Manager'
    : 'Assign Mentor to Institution';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Mentor: <span className="font-semibold">{mentorName}</span>
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="searchUser"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search {assignType === 'student' ? 'Students' : assignType === 'manager' ? 'Managers' : 'Institutions'}
          </label>
          <input
            type="text"
            id="searchUser"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search by name...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-4 max-h-60 overflow-y-auto">
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select {assignType === 'student' ? 'Student' : assignType === 'manager' ? 'Manager' : 'Institution'}
          </label>
          {filteredUsers.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-2 border rounded-md cursor-pointer ${
                    selectedUserId === user.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No {assignType === 'student' ? 'students' : assignType === 'manager' ? 'managers' : 'institutions'} found
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedUserId}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              loading || !selectedUserId
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
