'use client';

import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

export default function PainelLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
