import { useState } from 'react';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HealthProfileSetupProps {
  onComplete: () => void;
}

export default function HealthProfileSetup({ onComplete }: HealthProfileSetupProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activity_level: 'moderate',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.age || !formData.height || !formData.weight) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const age = parseInt(formData.age);
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);

      if (age < 1 || age > 150) {
        setError('Age must be between 1 and 150');
        setLoading(false);
        return;
      }

      if (height < 50 || height > 250) {
        setError('Height must be between 50cm and 250cm');
        setLoading(false);
        return;
      }

      if (weight < 20 || weight > 500) {
        setError('Weight must be between 20kg and 500kg');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const data = await response.json();
      
      // Save to localStorage
      localStorage.setItem('health_profile', JSON.stringify(data.profile));
      
      setSuccess('Health profile setup complete! Redirecting...');
      
      // Wait a moment before redirecting
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      console.error('Profile setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-100 p-4 rounded-full">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Welcome to NutriHealth
        </h1>
        <p className="text-center text-gray-600 mb-2">
          Let's set up your health profile
        </p>
        <p className="text-center text-sm text-gray-500 mb-8">
          Your {user?.email || 'personal'} profile - This setup happens only once
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="25"
              min="1"
              max="150"
              required
            />
          </div>

          {/* Height and Weight Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="170"
                step="0.1"
                min="50"
                max="250"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="70"
                step="0.1"
                min="20"
                max="500"
                required
              />
            </div>
          </div>

          {/* Gender and Activity Level Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                <option value="sedentary">Sedentary (Little exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Intensive training)</option>
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> This information helps us calculate your daily calorie goal and track your BMI. You can edit this anytime from your Health Profile page.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up your profile...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Complete Setup
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
