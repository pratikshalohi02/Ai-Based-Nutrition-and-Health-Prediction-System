import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Edit2 } from 'lucide-react';

interface HealthProfile {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
  daily_calorie_goal: number;
  bmi: number;
  created_at?: string;
}

const activityLevelLabels: Record<string, string> = {
  sedentary: 'Sedentary (Little to no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  veryactive: 'Very Active (Physical job)'
};

const getBMICategory = (bmi: number): { category: string; color: string; icon: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', icon: '📉' };
  if (bmi < 25) return { category: 'Normal Weight', color: 'text-green-600', icon: '✅' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600', icon: '⚠️' };
  return { category: 'Obese', color: 'text-red-600', icon: '⛔' };
};

export default function HealthProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HealthProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      // Try to load from localStorage first (set during signup)
      const stored = localStorage.getItem('health_profile');
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
          setFormData(JSON.parse(stored));
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse stored profile:', e);
        }
      }

      // If not in localStorage, fetch from API
      if (!user?.access_token) return;

      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${user.access_token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData(data);
        }
      } catch (err) {
        setError('Failed to load health profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData || !user?.access_token) return;

    try {
      const response = await fetch('http://localhost:5000/api/profile/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        localStorage.setItem('health_profile', JSON.stringify(updated));
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center max-w-md mx-auto">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">No health profile found</p>
        <p className="text-sm text-gray-500 mt-2">Complete your health profile to track your nutrition goals</p>
      </div>
    );
  }

  const bmiInfo = getBMICategory(profile.bmi);

  if (isEditing && formData) {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Health Profile</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            <select
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="veryactive">Very Active (Physical job)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleUpdateProfile}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Health Profile</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-gray-600 text-sm mb-1">Age</p>
          <p className="text-2xl font-bold text-gray-800">{profile.age} years</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">Gender</p>
          <p className="text-2xl font-bold capitalize text-gray-800">{profile.gender}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">Height</p>
          <p className="text-2xl font-bold text-gray-800">{profile.height} cm</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">Weight</p>
          <p className="text-2xl font-bold text-gray-800">{profile.weight} kg</p>
        </div>
      </div>

      {/* BMI Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">BMI</p>
            <p className="text-3xl font-bold text-gray-800">{profile.bmi}</p>
            <p className={`text-sm font-semibold ${bmiInfo.color} mt-1`}>
              {bmiInfo.icon} {bmiInfo.category}
            </p>
          </div>
          <Heart className="w-12 h-12 text-red-300" />
        </div>
      </div>

      {/* Calorie Goal Card */}
      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <p className="text-gray-600 text-sm mb-1">Daily Calorie Goal</p>
        <p className="text-3xl font-bold text-green-600">{profile.daily_calorie_goal} kcal</p>
        <p className="text-xs text-gray-600 mt-2">
          Activity Level: <span className="font-semibold">{activityLevelLabels[profile.activity_level] || profile.activity_level}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
