'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/translations';
import ImageUpload from './ImageUpload';

export default function ProfileImage({ onImageUpdated }) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('pt');
  const t = translations[language];

  const handleImageUpload = async (imageUrl) => {
    try {
      setLoading(true);
      setError('');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profileImage: imageUrl,
        updatedAt: new Date().toISOString(),
      });

      await updateUserProfile(user.uid);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Notify parent component if needed
      if (onImageUpdated) {
        onImageUpdated(imageUrl);
      }
    } catch (err) {
      console.error('Error updating profile image:', err);
      setError(t.settings.errorUpdatingImage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <ImageUpload
          onImageUpload={handleImageUpload}
          currentImage={userProfile?.profileImage}
        />

        <div className="flex-1">
          {loading && (
            <p className="text-sm text-blue-600">{t.settings.saving}</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {success && (
            <p className="text-sm text-green-600">
              {t.settings.successMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
