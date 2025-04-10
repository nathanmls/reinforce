'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { translations } from '@/translations';
import { Switch } from '@headlessui/react';
import {
  FiMoon,
  FiSun,
  FiGlobe,
  FiLock,
  FiVolume2,
  FiBell,
} from 'react-icons/fi';

export default function Settings() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    security: {
      twoFactorAuth: false,
      biometricLogin: false,
      sessionTimeout: 30,
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
    },
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
    voice: {
      voiceType: 'female',
      speed: 1,
      pitch: 1,
    },
  });

  useEffect(() => {
    if (userProfile) {
      setSettings((prev) => ({
        ...prev,
        ...userProfile.settings,
      }));
    }
  }, [userProfile]);

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        settings,
        updatedAt: new Date().toISOString(),
      });

      await updateUserProfile(user.uid);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Error updating settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg divide-y divide-gray-200"
      >
        <SettingSection title="Language & Region" icon={FiGlobe}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, language: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </SettingSection>

        <SettingSection
          title="Theme"
          icon={settings.theme === 'dark' ? FiMoon : FiSun}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dark Mode</span>
            <Switch
              checked={settings.theme === 'dark'}
              onChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  theme: checked ? 'dark' : 'light',
                }))
              }
              className={`${settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                className={`${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
        </SettingSection>

        <SettingSection title="Security" icon={FiLock}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Two-Factor Authentication
              </span>
              <Switch
                checked={settings.security.twoFactorAuth}
                onChange={(checked) =>
                  handleSettingChange('security', 'twoFactorAuth', checked)
                }
                className={`${settings.security.twoFactorAuth ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    'security',
                    'sessionTimeout',
                    Number(e.target.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Voice Settings" icon={FiVolume2}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Voice Type
              </label>
              <select
                value={settings.voice.voiceType}
                onChange={(e) =>
                  handleSettingChange('voice', 'voiceType', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Voice Speed
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voice.speed}
                onChange={(e) =>
                  handleSettingChange('voice', 'speed', Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Notifications" icon={FiBell}>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key} Notifications
                </span>
                <Switch
                  checked={value}
                  onChange={(checked) =>
                    handleSettingChange('notifications', key, checked)
                  }
                  className={`${value ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        </SettingSection>

        <div className="p-6">
          <div className="flex justify-end space-x-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm">
                Settings updated successfully!
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
