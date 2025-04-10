'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '../../config/roles';
import MentorAssignmentModal from '../../components/modals/MentorAssignmentModal';
import ClientOnlyFirebase from '@/components/ClientOnlyFirebase';
import LoadingSpinner from '@/components/LoadingSpinner';

// Separate the content component from the container
const InstitutionsContent = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState('all');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || userRole !== USER_ROLES.ADMINISTRATOR) {
      console.log('Access denied. User role:', userRole);
      router.push('/painel/dashboard');
      return;
    }

    // Load institutions data
    const loadData = async () => {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInstitutions(mockInstitutions);
      setLoading(false);
    };

    loadData();
  }, [user, userRole, router]);

  // Mock data - replace with actual API calls
  const mockInstitutions = [
    {
      id: 1,
      name: 'Stanford University',
      type: 'University',
      students: 120,
      revenue: '$150,000',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Google',
      type: 'Company',
      employees: 50,
      revenue: '$75,000',
      status: 'Active',
    },
  ];

  const handleTabChange = (value) => {
    setTabValue(value);
  };

  const handleViewDetails = (id) => {
    console.log('View details for institution:', id);
    // Implement view details logic
  };

  const handleAddInstitution = () => {
    console.log('Add new institution');
    // Implement add institution logic
  };

  const filteredInstitutions =
    tabValue === 'all'
      ? institutions
      : institutions.filter((inst) => inst.type.toLowerCase() === tabValue);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
        <button
          onClick={handleAddInstitution}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Institution
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'university', 'company'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    tabValue === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInstitutions.map((institution) => (
              <tr key={institution.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {institution.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {institution.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {institution.students
                      ? `${institution.students} students`
                      : `${institution.employees} employees`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {institution.revenue}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {institution.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleViewDetails(institution.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInstitutionId(institution.id);
                        setIsMentorModalOpen(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Manage Mentors
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mentor Assignment Modal */}
      <MentorAssignmentModal
        isOpen={isMentorModalOpen}
        onClose={() => {
          setIsMentorModalOpen(false);
          setSelectedInstitutionId(null);
        }}
        institutionId={selectedInstitutionId}
        onUpdate={() => {
          // Refresh institution data if needed
          const loadData = async () => {
            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setInstitutions(mockInstitutions);
            setLoading(false);
          };
          loadData();
        }}
      />
    </div>
  );
};

// Main component that wraps the content with ClientOnlyFirebase
const InstitutionsPage = () => {
  return (
    <ClientOnlyFirebase
      fallback={<LoadingSpinner message="Loading institutions data..." />}
    >
      <InstitutionsContent />
    </ClientOnlyFirebase>
  );
};

export default InstitutionsPage;
