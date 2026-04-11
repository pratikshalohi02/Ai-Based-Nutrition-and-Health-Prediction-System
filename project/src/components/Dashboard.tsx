import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface DailySummary {
  date: string;
  total_calories: number;
  daily_calorie_goal: number;
  meals: Array<{ type: string; count: number }>;
  weight: number;
}

interface WeeklyProjection {
  day: number;
  projected_weight: number;
  color: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklyProjection, setWeeklyProjection] = useState<WeeklyProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.access_token) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `http://localhost:5000/api/history/daily?date=${today}`,
          {
            headers: { Authorization: `Bearer ${user.access_token}` }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDailySummary(data);
          if (data.weekly_projection) {
            setWeeklyProjection(data.weekly_projection);
          }
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  }

  if (!dailySummary) {
    return <div className="text-center py-12 text-gray-500">No data available</div>;
  }

  const caloriePercentage = (dailySummary.total_calories / dailySummary.daily_calorie_goal) * 100;
  const remaining = Math.max(0, dailySummary.daily_calorie_goal - dailySummary.total_calories);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Daily Goal Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Daily Goal</p>
            <p className="text-3xl font-bold text-green-600">{dailySummary.daily_calorie_goal}</p>
            <p className="text-xs text-gray-500 mt-1">Calories target</p>
          </div>
          <Target className="w-10 h-10 text-green-600 opacity-30" />
        </div>
      </div>

      {/* Consumed Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Consumed</p>
            <p className="text-3xl font-bold text-orange-600">{dailySummary.total_calories}</p>
            <p className="text-xs text-gray-500 mt-1">{Math.round(caloriePercentage)}% of goal</p>
          </div>
          <Zap className="w-10 h-10 text-orange-600 opacity-30" />
        </div>
      </div>

      {/* Remaining Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Remaining</p>
            <p className={`text-3xl font-bold ${remaining > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {remaining}
            </p>
            <p className="text-xs text-gray-500 mt-1">Calories left</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-600 opacity-30" />
        </div>
      </div>

      {/* Current Weight Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Current Weight</p>
            <p className="text-3xl font-bold text-purple-600">{dailySummary.weight}kg</p>
            <p className="text-xs text-gray-500 mt-1">From latest entry</p>
          </div>
          <TrendingDown className="w-10 h-10 text-purple-600 opacity-30" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Today's Progress</p>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${
              caloriePercentage <= 80
                ? 'bg-green-500'
                : caloriePercentage <= 100
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>0</span>
          <span>{dailySummary.daily_calorie_goal}</span>
        </div>
      </div>

      {/* Weekly Projection */}
      {weeklyProjection && weeklyProjection.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-4">
          <p className="text-sm font-medium text-gray-700 mb-4">7-Day Weight Projection</p>
          <div className="space-y-2">
            {weeklyProjection.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Day {day.day}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{day.projected_weight}kg</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${day.color}`}
                  >
                    {day.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg md:col-span-2 lg:col-span-4">
          {error}
        </div>
      )}
    </div>
  );
}
