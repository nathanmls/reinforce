'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { homeworkService } from '../../services/homeworkService';
import { mentorService } from '../../services/mentorService';
import { USER_ROLES } from '../../config/roles';
import { HOMEWORK_STATUS } from '../../models/Homework';
import ClientOnlyFirebase from '../../components/ClientOnlyFirebase';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddHomeworkModal from '../../components/homework/AddHomeworkModal';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiClock, FiAlertTriangle, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db as dbImport } from '../../firebase/config';

export default function HomeworkPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Homework Management</h1>

      <ClientOnlyFirebase
        fallback={<LoadingSpinner message="Initializing Firebase..." />}
      >
        <HomeworkPageContent />
      </ClientOnlyFirebase>
    </div>
  );
}

function HomeworkPageContent() {
  const { user, userRole, userProfile } = useAuth();
  const [homework, setHomework] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    mentorId: '',
    studentId: '',
  });

  const isAdmin = userRole === USER_ROLES.ADMINISTRATOR;
  const isManager = userRole === USER_ROLES.MANAGER;
  const isStudent = userRole === USER_ROLES.STUDENT;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Update any overdue homework
        await homeworkService.updateHomeworkStatuses();

        // Fetch homework based on user role
        let homeworkData = [];
        if (isStudent) {
          homeworkData = await homeworkService.getHomeworkByStudent(user.uid);
        } else if (isManager) {
          if (filters.studentId) {
            homeworkData = await homeworkService.getHomeworkByStudent(filters.studentId);
          } else {
            // Get all homework assigned by this manager
            homeworkData = await homeworkService.getHomeworkByMentor(user.uid);
          }
        } else if (isAdmin) {
          if (filters.studentId) {
            homeworkData = await homeworkService.getHomeworkByStudent(filters.studentId);
          } else if (filters.mentorId) {
            homeworkData = await homeworkService.getHomeworkByMentor(filters.mentorId);
          } else {
            homeworkData = await homeworkService.getAllHomework();
          }
        }

        // Apply status filter
        if (filters.status !== 'all') {
          homeworkData = homeworkData.filter(item => item.status === filters.status);
        }

        setHomework(homeworkData);

        // Fetch mentors and students for filters
        if (isAdmin || isManager) {
          let mentorsData = [];
          if (isAdmin) {
            mentorsData = await mentorService.getAllMentors();
          } else if (isManager) {
            mentorsData = await mentorService.getMentorsByManager(user.uid);
          }
          setMentors(mentorsData);

          // Fetch students directly from Firebase
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
      } catch (err) {
        console.error('Error fetching homework data:', err);
        setError(err.message);
        toast.error(`Failed to load homework: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole, isAdmin, isManager, isStudent, filters]);

  const handleAddHomework = () => {
    setEditingHomework(null);
    setShowAddModal(true);
  };

  const handleEditHomework = (homework) => {
    setEditingHomework(homework);
    setShowAddModal(true);
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (!window.confirm('Are you sure you want to delete this homework assignment?')) {
      return;
    }

    try {
      await homeworkService.deleteHomework(homeworkId);
      setHomework(prevHomework => prevHomework.filter(item => item.id !== homeworkId));
      toast.success('Homework deleted successfully!');
    } catch (err) {
      console.error('Error deleting homework:', err);
      toast.error(`Failed to delete homework: ${err.message}`);
    }
  };

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

  const handleHomeworkSuccess = (result) => {
    setShowAddModal(false);
    
    if (editingHomework) {
      // Update existing homework in the list
      setHomework(prevHomework => 
        prevHomework.map(item => 
          item.id === result.id ? result : item
        )
      );
      toast.success('Homework updated successfully!');
    } else {
      // Add new homework to the list
      setHomework(prevHomework => [...prevHomework, result]);
      toast.success('Homework assigned successfully!');
    }
    
    setEditingHomework(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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
    return <LoadingSpinner message="Loading homework assignments..." />;
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
      {/* Filters */}
      {(isAdmin || isManager) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center mb-2">
            <FiFilter className="mr-2 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value={HOMEWORK_STATUS.PENDING}>Pending</option>
                <option value={HOMEWORK_STATUS.COMPLETED}>Completed</option>
                <option value={HOMEWORK_STATUS.OVERDUE}>Overdue</option>
              </select>
            </div>
            
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mentor
                </label>
                <select
                  value={filters.mentorId}
                  onChange={(e) => handleFilterChange('mentorId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Mentors</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student
              </label>
              <select
                value={filters.studentId}
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Homework Button */}
      {(isAdmin || isManager) && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddHomework}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Assign New Homework
          </button>
        </div>
      )}
      
      {/* Homework List */}
      {homework.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mentor
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {homework.map((item) => {
                  const dueDate = item.dueDate instanceof Date 
                    ? item.dueDate 
                    : item.dueDate.toDate 
                      ? item.dueDate.toDate() 
                      : new Date(item.dueDate);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(item.status)}
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {dueDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {students.find(s => s.id === item.studentId)?.name || item.studentId}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {mentors.find(m => m.id === item.mentorId)?.name || item.mentorId}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {isStudent && item.status === HOMEWORK_STATUS.PENDING && (
                            <button
                              onClick={() => handleMarkAsCompleted(item.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Mark as completed"
                            >
                              <FiCheck size={18} />
                            </button>
                          )}
                          {(isAdmin || isManager) && (
                            <>
                              <button
                                onClick={() => handleEditHomework(item)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                title="Edit homework"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteHomework(item.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete homework"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No homework assignments found.
          </p>
        </div>
      )}
      
      {/* Add/Edit Homework Modal */}
      {showAddModal && (
        <AddHomeworkModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingHomework(null);
          }}
          onSuccess={handleHomeworkSuccess}
          studentId={editingHomework?.studentId}
          mentorId={editingHomework?.mentorId || (isManager ? user.uid : null)}
          initialData={editingHomework}
        />
      )}
    </div>
  );
}
