'use client';

import { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homeworkService';
import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../config/roles';
import { HOMEWORK_STATUS } from '../../models/Homework';
import { FiX, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db as dbImport } from '../../firebase/config';

export default function AddHomeworkModal({
  isOpen,
  onClose,
  onSuccess,
  studentId = null,
  mentorId = null,
  initialData = null,
}) {
  const { user, userRole, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    studentId: studentId || '',
    mentorId: mentorId || user?.uid || '',
    status: HOMEWORK_STATUS.PENDING,
  });
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;
  const isManager = userRole === USER_ROLES.MANAGER;
  const isEditing = !!initialData;

  useEffect(() => {
    // Set default date to 7 days from now if not editing
    if (!isEditing) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      
      setFormData(prev => ({
        ...prev,
        dueDate: defaultDueDate.toISOString().split('T')[0],
        studentId: studentId || '',
        mentorId: mentorId || user?.uid || '',
      }));
    } else {
      // Format the date for the input field
      const dueDate = initialData.dueDate instanceof Date 
        ? initialData.dueDate 
        : initialData.dueDate.toDate 
          ? initialData.dueDate.toDate() 
          : new Date(initialData.dueDate);
      
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: dueDate.toISOString().split('T')[0],
        studentId: initialData.studentId || studentId || '',
        mentorId: initialData.mentorId || mentorId || user?.uid || '',
        status: initialData.status || HOMEWORK_STATUS.PENDING,
      });
    }
  }, [isEditing, initialData, studentId, mentorId, user]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setFetchingUsers(true);
      try {
        // Fetch students and mentors if needed
        if (isAdmin || isManager) {
          // For admin/manager, fetch students if no studentId is provided
          if (!studentId) {
            try {
              const db = dbImport;
              const studentsRef = collection(db, 'users');
              const studentsQuery = query(studentsRef, where('role', '==', USER_ROLES.STUDENT));
              const studentsSnapshot = await getDocs(studentsQuery);
              
              const studentsData = [];
              studentsSnapshot.forEach(doc => {
                studentsData.push({ id: doc.id, ...doc.data() });
              });
              
              setStudents(studentsData);
            } catch (error) {
              console.error('Error fetching students:', error);
              toast.error('Failed to load students');
            }
          }
          
          // For admin, fetch mentors if no mentorId is provided
          if (isAdmin && !mentorId) {
            const mentorsData = await mentorService.getAllMentors();
            setMentors(mentorsData);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, isAdmin, isManager, studentId, mentorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }
    
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.mentorId) {
      toast.error('Please select a mentor');
      return;
    }

    setLoading(true);
    try {
      // Format the data
      const homeworkData = {
        ...formData,
        dueDate: new Date(formData.dueDate),
      };
      
      let result;
      if (isEditing) {
        // Update existing homework
        result = await homeworkService.updateHomework(initialData.id, homeworkData);
      } else {
        // Create new homework
        result = await homeworkService.createHomework(homeworkData);
      }
      
      toast.success(isEditing ? 'Homework updated successfully!' : 'Homework assigned successfully!');
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error(isEditing ? 'Error updating homework:' : 'Error creating homework:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'assign'} homework: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Homework' : 'Assign New Homework'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter homework title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter homework description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Due Date*
            </label>
            <div className="relative">
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {isEditing && (
            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Status*
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value={HOMEWORK_STATUS.PENDING}>Pending</option>
                <option value={HOMEWORK_STATUS.COMPLETED}>Completed</option>
                <option value={HOMEWORK_STATUS.OVERDUE}>Overdue</option>
              </select>
            </div>
          )}

          {/* Student selection - only show if no studentId was provided and user is admin/manager */}
          {!studentId && (isAdmin || isManager) && (
            <div className="mb-4">
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Student*
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a student</option>
                {fetchingUsers ? (
                  <option disabled>Loading students...</option>
                ) : (
                  students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Mentor selection - only show if no mentorId was provided and user is admin */}
          {!mentorId && isAdmin && (
            <div className="mb-4">
              <label
                htmlFor="mentorId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Mentor*
              </label>
              <select
                id="mentorId"
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a mentor</option>
                {fetchingUsers ? (
                  <option disabled>Loading mentors...</option>
                ) : (
                  mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading 
                ? (isEditing ? 'Updating...' : 'Assigning...') 
                : (isEditing ? 'Update Homework' : 'Assign Homework')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
