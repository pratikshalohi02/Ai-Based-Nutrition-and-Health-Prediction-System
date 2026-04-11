import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Check as CheckCircle } from 'lucide-react';

export default function CalorieTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: '',
    portionSize: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.foodName || !formData.calories) {
        throw new Error('Food name and calories are required');
      }

      // Store food log in local storage (no database)
      const foodLog = {
        id: Date.now(),
        user_id: user?.id || 'local',
        food_name: formData.foodName,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
        meal_type: formData.mealType,
        entry_type: 'manual',
        portion_size: formData.portionSize || '1 serving',
        logged_at: new Date().toISOString(),
      };

      const logs = JSON.parse(localStorage.getItem('food_logs') || '[]');
      logs.push(foodLog);
      localStorage.setItem('food_logs', JSON.stringify(logs));

      setSuccess(true);
      setFormData({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        mealType: '',
        portionSize: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Manual Calorie Tracker
        </h1>
        <p className="text-gray-600">
          Log your meals manually with detailed nutrition information
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span>Food logged successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Name
              </label>
              <input
                type="text"
                value={formData.foodName}
                onChange={(e) =>
                  setFormData({ ...formData, foodName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Chicken Breast"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="250"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portion Size
              </label>
              <input
                type="text"
                value={formData.portionSize}
                onChange={(e) =>
                  setFormData({ ...formData, portionSize: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1 serving / 100g"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) =>
                  setFormData({ ...formData, protein: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData({ ...formData, carbs: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fats (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fats}
                onChange={(e) =>
                  setFormData({ ...formData, fats: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type
              </label>
              <select
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({ ...formData, mealType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select meal type</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Food Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
