import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  token: string | null;
  loading: boolean;
  isLoading?: boolean;
  signIn: (credentials: { email: string; access_token?: string }) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setSession({ access_token: storedToken });
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const signIn = async (credentials: { email: string; access_token?: string }) => {
    // If access_token is provided (from Register component), use it directly
    if (credentials.access_token) {
      setSession({ access_token: credentials.access_token });
      setUser({ id: '', email: credentials.email });
      setToken(credentials.access_token);
      localStorage.setItem('access_token', credentials.access_token);
      localStorage.setItem('user', JSON.stringify({ id: '', email: credentials.email }));
      return;
    }

    // Otherwise, login normally
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setSession({ access_token: data.access_token });
    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signUp = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    session,
    token,
    loading,
    isLoading: loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function clearCorruptedToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { clearCorruptedToken };
