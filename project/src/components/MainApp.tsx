import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Upload, History, Activity, Lightbulb, User, LogOut, Menu, X, Utensils, Heart } from 'lucide-react';
import Dashboard from './Dashboard';
import UploadFood from './UploadFood';
import ManualCalorieTracker from './ManualCalorieTracker';
import HistoryView from './HistoryView';
import ExerciseTracker from './ExerciseTracker';
import HealthProfileView from './HealthProfileView';
import Recommendations from './Recommendations';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export default function MainApp() {
  const { user, signOut } = useAuth();
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Food', icon: Upload },
    { id: 'manual', label: 'Manual Tracker', icon: Utensils },
    { id: 'history', label: 'Food History', icon: History },
    { id: 'exercise', label: 'Exercise Plan', icon: Activity },
    { id: 'diet', label: 'Personalized Diet', icon: Lightbulb },
    { id: 'profile', label: 'Health Profile', icon: User },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await signOut();
        window.location.href = '/login';
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadFood />;
      case 'manual':
        return <ManualCalorieTracker />;
      case 'history':
        return <HistoryView />;
      case 'exercise':
        return <ExerciseTracker />;
      case 'diet':
        return <Recommendations />;
      case 'profile':
        return <HealthProfileView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-700 to-blue-600 text-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-50 lg:relative`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-blue-500 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-50 rounded-xl flex items-center justify-center shadow-md border-2 border-blue-100">
                <Heart className="w-6 h-6 text-blue-600 fill-blue-600" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-white text-base">NutriHealth</h2>
                <p className="text-xs text-blue-100 font-medium">Track. Understand. Thrive.</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:flex hidden items-center justify-center p-2 hover:bg-blue-500 rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                  isActive
                    ? 'bg-white text-blue-700 font-semibold shadow-md'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-500 space-y-3">
          {sidebarOpen && (
            <div className="bg-blue-500 bg-opacity-30 rounded-lg p-3 text-sm">
              <p className="text-xs text-blue-100 mb-1">Logged in as</p>
              <p className="font-semibold truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500 hover:text-white transition duration-200 font-semibold ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {navItems.find((item) => item.id === activePage)?.label || 'NutriHealth'}
          </h1>
          <div className="hidden lg:block text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
