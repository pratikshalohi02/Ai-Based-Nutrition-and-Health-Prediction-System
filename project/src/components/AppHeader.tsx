import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Apple, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import UploadFood from './UploadFood';
import HealthProfileView from './HealthProfileView';

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'upload' | 'profile'>('dashboard');

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">NutriHealth</h1>
              <p className="text-xs text-green-100">Smart Nutrition Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-green-400 px-6 flex gap-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`py-3 font-semibold border-b-2 transition ${
              currentPage === 'dashboard'
                ? 'border-white text-white'
                : 'border-transparent text-green-100 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('upload')}
            className={`py-3 font-semibold border-b-2 transition ${
              currentPage === 'upload'
                ? 'border-white text-white'
                : 'border-transparent text-green-100 hover:text-white'
            }`}
          >
            📸 Food Logger
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`py-3 font-semibold border-b-2 transition ${
              currentPage === 'profile'
                ? 'border-white text-white'
                : 'border-transparent text-green-100 hover:text-white'
            }`}
          >
            👤 Profile
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'upload' && <UploadFood />}
        {currentPage === 'profile' && <HealthProfileView />}
      </main>
    </div>
  );
}
