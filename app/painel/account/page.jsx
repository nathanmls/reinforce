'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { db, storage } from '../../firebase/config';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ProfileImage from '../../components/ProfileImage';

export default function AccountPage() {
  const router = useRouter();
  const { user, userRole, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    grade: '',
    subjects: [],
    parentEmail: '',
    assignedMentor: 'elementary',
    profileImage: '',
    notifications: true
  });

  const isStudent = userRole === 'student';

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            name: userData.name || '',
            email: user.email || '',
            role: userData.role || '',
            grade: isStudent ? (userData.grade || '') : '',
            subjects: userData.subjects || [],
            parentEmail: isStudent ? (userData.parentEmail || '') : '',
            assignedMentor: userData.assignedMentor || 'elementary',
            profileImage: userData.profileImage || '',
            notifications: userData.notifications ?? true
          });
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.displayName || '',
            grade: '',
            subjects: [],
            parentEmail: ''
          }));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, isStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Students cannot edit their account
    if (isStudent) {
      return;
    }

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      setSaveLoading(true);
      setError('');
      
      // Save to Firestore
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        notifications: formData.notifications,
        updatedAt: new Date().toISOString()
      };

      // Only include student fields if user is a student
      if (isStudent) {
        dataToSave.grade = formData.grade;
        dataToSave.subjects = formData.subjects;
        dataToSave.parentEmail = formData.parentEmail;
        dataToSave.assignedMentor = formData.assignedMentor;
      }

      await setDoc(doc(db, 'users', user.uid), dataToSave, { merge: true });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleImageUpload = async (imageDataUrl) => {
    if (!user) return;

    try {
      setError('');
      setSaveLoading(true);

      // Extract the base64 data (remove the data URL prefix)
      const base64Data = imageDataUrl.split(',')[1];
      
      // Convert to Uint8Array
      const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Create blob with smaller chunk size
      const blob = new Blob([byteArray], { type: 'image/webp' });

      // Create file reference with metadata
      const storageRef = ref(storage, `profile-images/${user.uid}.webp`);
      const metadata = {
        contentType: 'image/webp',
        cacheControl: 'public,max-age=7200'
      };
      
      // Upload with smaller chunk size
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          if (error.code === 'storage/quota-exceeded') {
            setError('Storage quota exceeded. Please try again later.');
          } else if (error.code === 'storage/unauthorized') {
            setError('Unauthorized access. Please sign in again.');
          } else {
            setError('Failed to upload image. Please try again.');
          }
          setSaveLoading(false);
        },
        async () => {
          try {
            // Get download URL after successful upload
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update user document with new image URL
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              profileImage: downloadURL,
              updatedAt: new Date().toISOString()
            }, { merge: true });

            // Update local state
            setFormData(prev => ({
              ...prev,
              profileImage: downloadURL
            }));

            // Update the global user profile
            await updateUserProfile(user.uid);

            setSuccessMessage('Profile image updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
          } catch (err) {
            console.error('Error getting download URL:', err);
            setError('Failed to process uploaded image. Please try again.');
          } finally {
            setSaveLoading(false);
          }
        }
      );
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setSaveLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    if (!window.confirm('Are you sure you want to reset your password? You will receive an email with instructions.')) {
      return;
    }

    try {
      setResetLoading(true);
      setError('');
      setSuccessMessage('');
      
      await sendPasswordResetEmail(user, user.email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmEmail = window.prompt('Please enter your email address to confirm account deletion:');
    if (confirmEmail !== user?.email) {
      setError('Email address does not match. Account deletion cancelled.');
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');
      setSuccessMessage('');

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user from Firebase Auth
      await deleteUser(user);
      
      // Logout and redirect to home
      await updateUserProfile(user.uid);
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. You may need to re-login before deleting your account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h2>
          <ProfileImage
            onImageUpload={handleImageUpload}
            currentImage={formData.profileImage}
          />
          {saveLoading && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading image...
            </div>
          )}
          {successMessage && (
            <div className="mt-2 text-sm text-green-600">
              {successMessage}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing || isStudent}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            {isStudent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred Subjects
                  </label>
                  <input
                    type="text"
                    value={formData.subjects.join(', ')}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent's Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {!isStudent && (
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isEditing ? (saveLoading ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
            </button>
          </div>
        )}
      </div>

      {!isStudent && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <button
              type="button"
              className="w-full px-4 py-2 text-left border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
