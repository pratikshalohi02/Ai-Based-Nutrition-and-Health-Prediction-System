import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Apple } from 'lucide-react';

interface RegisterProps {
  onToggle: () => void;
}

interface HealthData {
  age: string;
  height: string;
  weight: string;
  gender: string;
  activity_level: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function Register({ onToggle }: RegisterProps) {
  const [step, setStep] = useState<'email' | 'health'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthData>({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activity_level: 'moderate'
  });
  const { signUp, token } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(email, password);
      setStep('health');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const calculateTDEE = (weight: number, height: number, age: number, gender: string, activity: string) => {
    let bmr: number;
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityFactors: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryactive: 1.9
    };

    return Math.round(bmr * (activityFactors[activity] || 1.55));
  };

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!health.age || !health.height || !health.weight) {
      setError('Please fill in all health information');
      return;
    }

    setLoading(true);

    try {
      const weight = parseFloat(health.weight);
      const height = parseFloat(health.height);
      const age = parseInt(health.age);

      const tdee = calculateTDEE(weight, height, age, health.gender, health.activity_level);
      const dailyGoal = Math.round(tdee * 0.9); // 10% deficit for healthy weight loss

      const response = await fetch(`${API_BASE_URL}/api/profile/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          age,
          height,
          weight,
          gender: health.gender,
          activity_level: health.activity_level,
          bmi: (weight / ((height / 100) ** 2)).toFixed(1),
          daily_calorie_goal: dailyGoal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save health profile');
      }

      // Store health profile in localStorage for quick access
      localStorage.setItem('health_profile', JSON.stringify({
        age,
        height,
        weight,
        gender: health.gender,
        activity_level: health.activity_level,
        daily_calorie_goal: dailyGoal,
        tdee,
      }));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <Apple className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NutriHealth</h1>
            <p className="text-xs text-green-100">Smart Nutrition Tracker</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {step === 'email' ? (
            // EMAIL & PASSWORD STEP
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600 mb-6">Join NutriHealth to start tracking your nutrition</p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Next: Health Profile'}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <button onClick={onToggle} className="text-green-600 font-semibold hover:underline">
                  Login
                </button>
              </p>
            </div>
          ) : (
            // HEALTH PROFILE STEP
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Health Profile</h2>
              <p className="text-gray-600 mb-6">Help us personalize your nutrition plan</p>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleHealthSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={health.age}
                      onChange={(e) => setHealth({ ...health, age: e.target.value })}
                      placeholder="e.g., 25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={loading}
                      min="13"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                    <select
                      value={health.gender}
                      onChange={(e) => setHealth({ ...health, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={loading}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={health.height}
                      onChange={(e) => setHealth({ ...health, height: e.target.value })}
                      placeholder="e.g., 170"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={loading}
                      min="100"
                      max="250"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={health.weight}
                      onChange={(e) => setHealth({ ...health, weight: e.target.value })}
                      placeholder="e.g., 70"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={loading}
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Activity Level</label>
                  <select
                    value={health.activity_level}
                    onChange={(e) => setHealth({ ...health, activity_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={loading}
                  >
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="veryactive">Very Active (2x per day)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-6"
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup 🎉'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
