'use client';

import { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homeworkService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../config/roles';
import { FiCheck, FiClock, FiAlertTriangle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { HOMEWORK_STATUS } from '../../models/Homework';
import toast from 'react-hot-toast';

export default function HomeworkList({ studentId = null, mentorId = null }) {
  const { user, userRole } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isStudent = userRole === USER_ROLES.STUDENT;
  const isManager = userRole === USER_ROLES.MANAGER;
  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      try {
        let homeworkData = [];

        // Update any overdue homework
        await homeworkService.updateHomeworkStatuses();

        if (isStudent) {
          // Students see their own homework
          homeworkData = await homeworkService.getHomeworkByStudent(user.uid);
        } else if (mentorId) {
          // Filter by specific mentor
          homeworkData = await homeworkService.getHomeworkByMentor(mentorId);
        } else if (studentId) {
          // Filter by specific student
          homeworkData = await homeworkService.getHomeworkByStudent(studentId);
        } else if (isManager || isAdmin) {
          // Managers and admins see all homework
          homeworkData = await homeworkService.getAllHomework();
        }

        setHomework(homeworkData);
      } catch (err) {
        console.error('Error fetching homework:', err);
        setError(err.message);
        toast.error(`Failed to load homework: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [user, userRole, isStudent, isManager, isAdmin, studentId, mentorId]);

  const handleMarkAsCompleted = async (homeworkId) => {
    try {
      await homeworkService.markHomeworkAsCompleted(homeworkId);
      
      // Update the local state
      setHomework(prevHomework => 
        prevHomework.map(item => 
          item.id === homeworkId 
            ? { ...item, status: HOMEWORK_STATUS.COMPLETED, updatedAt: new Date() } 
            : item
        )
      );
      
      toast.success('Homework marked as completed!');
    } catch (err) {
      console.error('Error marking homework as completed:', err);
      toast.error(`Failed to update homework: ${err.message}`);
    }
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (!window.confirm('Are you sure you want to delete this homework?')) {
      return;
    }
    
    try {
      await homeworkService.deleteHomework(homeworkId);
      
      // Update the local state
      setHomework(prevHomework => prevHomework.filter(item => item.id !== homeworkId));
      
      toast.success('Homework deleted successfully!');
    } catch (err) {
      console.error('Error deleting homework:', err);
      toast.error(`Failed to delete homework: ${err.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case HOMEWORK_STATUS.COMPLETED:
        return <FiCheck className="text-green-500" size={18} />;
      case HOMEWORK_STATUS.PENDING:
        return <FiClock className="text-blue-500" size={18} />;
      case HOMEWORK_STATUS.OVERDUE:
        return <FiAlertTriangle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case HOMEWORK_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case HOMEWORK_STATUS.PENDING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case HOMEWORK_STATUS.OVERDUE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error loading homework: {error}</p>
      </div>
    );
  }

  if (homework.length === 0) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-300">
          No homework assignments found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Homework To-Do List
        </h3>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {homework.map((item) => {
          const dueDate = item.dueDate instanceof Date 
            ? item.dueDate 
            : item.dueDate.toDate 
              ? item.dueDate.toDate() 
              : new Date(item.dueDate);
          
          return (
            <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {getStatusIcon(item.status)}
                    <h4 className="ml-2 text-md font-medium text-gray-800 dark:text-white">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Due: {dueDate.toLocaleDateString()}</span>
                    <span className={`ml-2 px-2 py-1 rounded-full ${getStatusClass(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isStudent && item.status === HOMEWORK_STATUS.PENDING && (
                    <button
                      onClick={() => handleMarkAsCompleted(item.id)}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Mark as completed"
                    >
                      <FiCheck size={18} />
                    </button>
                  )}
                  {(isManager || isAdmin) && (
                    <>
                      <button
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit homework"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteHomework(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete homework"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
