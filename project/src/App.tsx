import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AppHeader from './components/AppHeader';
import HealthAssessment from './components/HealthAssessment';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return window.location.pathname.slice(1) || 'login';
  });

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname.slice(1) || 'login';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes
  if (currentPage === 'login') {
    return <Login />;
  }

  if (currentPage === 'register') {
    return <Register />;
  }

  if (currentPage === 'assessment') {
    return <HealthAssessment />;
  }

  // Protected routes
  if (!user?.access_token) {
    return <Login />;
  }

  // Dashboard and other protected pages
  return <AppHeader />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
