'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { mentorService } from '../../services/mentorService';
import { AVATAR_MODELS } from '../../models/Mentor';

export default function MentorAssignmentModal({
  isOpen,
  onClose,
  institutionId,
  onUpdate,
}) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_MODELS.TIA);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, institutionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allMentors, institutionMentors] = await Promise.all([
        mentorService.getAllMentors(),
        mentorService.getMentorsByInstitution(institutionId),
      ]);
      setMentors(allMentors);
      setAssignedMentors(institutionMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedMentorId) return;

    try {
      await mentorService.assignMentorToInstitution(
        selectedMentorId,
        institutionId
      );
      if (selectedAvatarId) {
        await mentorService.updateMentorAvatar(
          selectedMentorId,
          selectedAvatarId
        );
      }
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error assigning mentor:', error);
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    try {
      await mentorService.removeMentorFromInstitution(mentorId, institutionId);
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error removing mentor:', error);
    }
  };

  const handleUpdateAvatar = async (mentorId, avatarId) => {
    try {
      await mentorService.updateMentorAvatar(mentorId, avatarId);
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Manage Institution Mentors
                </Dialog.Title>

                {loading ? (
                  <div className="mt-4 text-center">Loading...</div>
                ) : (
                  <>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Assign New Mentor
                      </h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Select Mentor
                          </label>
                          <select
                            value={selectedMentorId}
                            onChange={(e) =>
                              setSelectedMentorId(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select a mentor...</option>
                            {mentors
                              .filter(
                                (mentor) =>
                                  !assignedMentors.some(
                                    (assigned) => assigned.id === mentor.id
                                  )
                              )
                              .map((mentor) => (
                                <option key={mentor.id} value={mentor.id}>
                                  {mentor.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Select Avatar
                          </label>
                          <select
                            value={selectedAvatarId}
                            onChange={(e) =>
                              setSelectedAvatarId(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            {Object.entries(AVATAR_MODELS).map(
                              ([key, value]) => (
                                <option key={value} value={value}>
                                  {key}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAssignMentor}
                        disabled={!selectedMentorId}
                        className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                      >
                        Assign Mentor
                      </button>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900">
                        Assigned Mentors
                      </h4>
                      <div className="mt-2 space-y-4">
                        {assignedMentors.map((mentor) => (
                          <div
                            key={mentor.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-medium">{mentor.name}</p>
                              <p className="text-sm text-gray-500">
                                {mentor.email}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <select
                                value={mentor.avatarId}
                                onChange={(e) =>
                                  handleUpdateAvatar(mentor.id, e.target.value)
                                }
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                {Object.entries(AVATAR_MODELS).map(
                                  ([key, value]) => (
                                    <option key={value} value={value}>
                                      {key}
                                    </option>
                                  )
                                )}
                              </select>
                              <button
                                onClick={() => handleRemoveMentor(mentor.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {assignedMentors.length === 0 && (
                          <p className="text-sm text-gray-500">
                            No mentors assigned yet
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
