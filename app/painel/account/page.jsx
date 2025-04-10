'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { db, storage } from '../../firebase/config';
import { useRouter } from 'next/navigation';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import ProfileImage from '../../components/ProfileImage';
import ClientOnlyFirebase from '@/components/ClientOnlyFirebase';
import LoadingSpinner from '@/components/LoadingSpinner';

// Separate the content component from the container
function AccountContent() {
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
    notifications: true,
  });

  const isStudent = userRole === 'student';

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Check if db is initialized
        if (!db) {
          console.error('Firestore not initialized');
          setError('Database connection not available');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            name: userData.name || '',
            email: user.email || '',
            role: userData.role || '',
            grade: isStudent ? userData.grade || '' : '',
            subjects: userData.subjects || [],
            parentEmail: isStudent ? userData.parentEmail || '' : '',
            assignedMentor: userData.assignedMentor || 'elementary',
            profileImage: userData.profileImage || '',
            notifications: userData.notifications ?? true,
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user.email || '',
            name: user.displayName || '',
            grade: '',
            subjects: [],
            parentEmail: '',
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
        updatedAt: new Date().toISOString(),
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
      const byteArray = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      // Create blob with smaller chunk size
      const blob = new Blob([byteArray], { type: 'image/webp' });

      // Create file reference with metadata
      const storageRef = ref(storage, `profile-images/${user.uid}.webp`);
      const metadata = {
        contentType: 'image/webp',
        cacheControl: 'public,max-age=7200',
      };

      // Upload with smaller chunk size
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
            await setDoc(
              userRef,
              {
                profileImage: downloadURL,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );

            // Update local state
            setFormData((prev) => ({
              ...prev,
              profileImage: downloadURL,
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

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');

      // Delete profile image from storage if it exists
      if (formData.profileImage) {
        try {
          const imageRef = ref(storage, `profile-images/${user.uid}.webp`);
          await deleteObject(imageRef);
        } catch (err) {
          console.error('Error deleting profile image:', err);
          // Continue with account deletion even if image deletion fails
        }
      }

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user authentication account
      await deleteUser(user);

      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);

      if (err.code === 'auth/requires-recent-login') {
        setError(
          'For security reasons, you need to sign in again before deleting your account.'
        );
      } else {
        setError('Failed to delete account. Please try again later.');
      }

      setDeleteLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user || !user.email) {
      setError('No email associated with this account');
      return;
    }

    try {
      setResetLoading(true);
      setError('');

      await sendPasswordResetEmail(user.auth, user.email);

      setSuccessMessage('Password reset email sent. Check your inbox.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError('Failed to send password reset email. Please try again later.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Account Settings
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="flex-shrink-0">
              <ProfileImage
                src={formData.profileImage}
                alt={formData.name}
                size={96}
                onImageUpload={handleImageUpload}
                editable={!isStudent}
                loading={saveLoading}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {formData.name}
              </h2>
              <p className="text-gray-600">{formData.email}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {formData.role}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || isStudent}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed directly. Please contact support for
                  assistance.
                </p>
              </div>

              {isStudent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      disabled={true}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      disabled={true}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleInputChange}
                  disabled={!isEditing || isStudent}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="notifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Receive email notifications
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {!isStudent && (
                <button
                  type="submit"
                  disabled={saveLoading}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isEditing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {saveLoading
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Edit Profile'}
                </button>
              )}

              {isEditing && !isStudent && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>

          <div className="space-y-4">
            <div>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
              >
                {resetLoading ? 'Sending...' : 'Reset Password'}
              </button>
              <p className="text-sm text-gray-500 mt-1">
                We'll send a password reset link to your email address.
              </p>
            </div>

            <div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content with ClientOnlyFirebase
export default function AccountPage() {
  return (
    <ClientOnlyFirebase
      fallback={<LoadingSpinner message="Loading account data..." />}
    >
      <AccountContent />
    </ClientOnlyFirebase>
  );
}
