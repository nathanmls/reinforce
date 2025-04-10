'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
// import Link from 'next/link';
import { translations } from '@/translations';
import Header from '@/components/Header';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t.auth.emailPasswordRequired);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);

      // Add a small delay to ensure Firestore has time to sync
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/painel/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError(t.auth.userNotFound);
          break;
        case 'auth/wrong-password':
          setError(t.auth.wrongPassword);
          break;
        case 'auth/network-request-failed':
          setError(t.auth.networkError);
          break;
        default:
          setError(err.message || t.auth.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        language={language}
        setLanguage={setLanguage}
        isLoginPage={true}
        showLoginButton={false}
      />
      <main className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t.nav.login}
          </h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t.contact.email}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : t.nav.login}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
