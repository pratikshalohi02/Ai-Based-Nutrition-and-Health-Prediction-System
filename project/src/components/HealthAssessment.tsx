import { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Heart, TrendingDown } from 'lucide-react';

export default function HealthAssessment() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = fileInputRef.current?.files?.[0];

    if (!file || !user?.access_token) return;

    form.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/analyze-food', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.access_token}` },
        body: form
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Analysis result:', data);
        // Handle result - show summary or navigate
      }
    } catch (err) {
      console.error('Error analyzing food:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Health Assessment</h1>
          <p className="text-gray-600 text-lg">Let's understand your health profile and get personalized recommendations</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Health Tracking</h3>
            <p className="text-sm text-gray-600">Monitor your daily nutrition intake and progress</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Personalized Goals</h3>
            <p className="text-sm text-gray-600">Set calorie targets based on your profile</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Weight Tracking</h3>
            <p className="text-sm text-gray-600">See your projected weight changes weekly</p>
          </div>
        </div>

        {/* Assessment Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Start Your Assessment</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Name</label>
              <input
                type="text"
                name="food_name"
                placeholder="e.g., Apple, Chicken Breast"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <select name="meal_type" className="w-full px-4 py-2 border rounded-lg" required>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Analyze Food
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
