import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, CheckCircle, AlertCircle, TrendingUp, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface DailySummary {
  date: string;
  meal_count: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  weight_prediction?: any;
  weekly_projection?: any;
}

interface HealthProfile {
  daily_calorie_goal: number;
  bmi_category?: string;
}

export default function DailySummaryNotification() {
  const { user, token } = useAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if it's evening (after 7 PM) or on demand
  const isEvening = () => {
    const hour = new Date().getHours();
    return hour >= 19; // 7 PM or later
  };

  const loadDailySummary = async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      // Load health profile
      const profileData = localStorage.getItem('health_profile');
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch daily summary
      const response = await fetch(`${API_BASE_URL}/api/history/daily?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        setShowSummary(true);
      }
    } catch (err) {
      console.error('Error loading daily summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-show summary in the evening
    const checkEvening = () => {
      const hour = new Date().getHours();
      if (hour >= 19 && !showSummary) {
        loadDailySummary();
      }
    };

    // Check every minute
    const timer = setInterval(checkEvening, 60000);
    checkEvening(); // Check immediately

    return () => clearInterval(timer);
  }, [user, token, showSummary]);

  if (!showSummary || !summary) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={loadDailySummary}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
          title="View today's summary"
        >
          <Award className="w-6 h-6" />
        </button>
      </div>
    );
  }

  const caloriesConsumed = summary.total_calories || 0;
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const caloriesDiff = caloriesConsumed - calorieGoal;
  const metGoal = caloriesConsumed >= calorieGoal * 0.9 && caloriesConsumed <= calorieGoal * 1.1;
  const exceededGoal = caloriesConsumed > calorieGoal * 1.1;
  const tooLow = caloriesConsumed < calorieGoal * 0.9;

  let goalStatus = 'Perfect! 🎉';
  let goalMessage = 'You hit your calorie goal perfectly!';
  let statusIcon = <CheckCircle className="w-6 h-6 text-green-500" />;
  let statusColor = 'from-green-50 to-emerald-50';
  let borderColor = 'border-green-300';

  if (exceededGoal) {
    goalStatus = 'Over Goal';
    goalMessage = `You consumed ${Math.round(Math.abs(caloriesDiff))} extra calories today.`;
    statusIcon = <AlertCircle className="w-6 h-6 text-orange-500" />;
    statusColor = 'from-orange-50 to-red-50';
    borderColor = 'border-orange-300';
  } else if (tooLow) {
    goalStatus = 'Under Goal';
    goalMessage = `You had ${Math.round(Math.abs(caloriesDiff))} fewer calories than your goal.`;
    statusIcon = <TrendingUp className="w-6 h-6 text-blue-500" />;
    statusColor = 'from-blue-50 to-cyan-50';
    borderColor = 'border-blue-300';
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowSummary(false)}
      role="presentation"
    >
      <div 
        className={`bg-gradient-to-br ${statusColor} rounded-2xl shadow-2xl max-w-md w-full border-2 ${borderColor} p-8 space-y-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSummary(false);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close summary"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">{statusIcon}</div>
          <h2 className="text-3xl font-bold text-gray-800">Today's Summary</h2>
          <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Goal Status */}
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-gray-600">GOAL STATUS</p>
            <p className="text-2xl font-bold text-gray-800">{goalStatus}</p>
            <p className="text-sm text-gray-700">{goalMessage}</p>
          </div>
        </div>

        {/* Calories Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">Consumed</p>
            <p className="text-xl font-bold text-red-600">{Math.round(caloriesConsumed)}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">Goal</p>
            <p className="text-xl font-bold text-green-600">{calorieGoal}</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">Meals</p>
            <p className="text-xl font-bold text-purple-600">{summary.meal_count}</p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-300">
            <p className="text-xs text-gray-700 font-semibold">Protein</p>
            <p className="text-lg font-bold text-blue-700">{Math.round(summary.total_protein)}g</p>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
            <p className="text-xs text-gray-700 font-semibold">Carbs</p>
            <p className="text-lg font-bold text-green-700">{Math.round(summary.total_carbs)}g</p>
          </div>
          <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-300">
            <p className="text-xs text-gray-700 font-semibold">Fats</p>
            <p className="text-lg font-bold text-orange-700">{Math.round(summary.total_fats)}g</p>
          </div>
        </div>

        {/* Weight Impact (if available) */}
        {summary.weight_prediction && (
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Impact on Weight</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-purple-50 rounded">
                <p className="text-xs text-gray-600">Weekly Projection</p>
                <p className="font-bold text-purple-700">
                  {summary.weight_prediction.difference > 0 ? '+' : ''}{summary.weight_prediction.difference.toFixed(2)} kg
                </p>
              </div>
              <div className="p-2 bg-pink-50 rounded">
                <p className="text-xs text-gray-600">Monthly Projection</p>
                <p className="font-bold text-pink-700">
                  {(summary.weight_prediction.difference * 4.3).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">💡 Insights</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {metGoal && (
              <li className="flex items-start">
                <span className="text-green-500 font-bold mr-2">✓</span>
                You maintained a balanced calorie intake!
              </li>
            )}
            {exceededGoal && (
              <li className="flex items-start">
                <span className="text-orange-500 font-bold mr-2">!</span>
                Consider lighter meals tomorrow to balance out.
              </li>
            )}
            {tooLow && (
              <li className="flex items-start">
                <span className="text-blue-500 font-bold mr-2">!</span>
                Try adding more nutritious snacks tomorrow.
              </li>
            )}
            <li className="flex items-start">
              <span className="text-purple-500 font-bold mr-2">✓</span>
              You logged {summary.meal_count} meal{summary.meal_count !== 1 ? 's' : ''} today.
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSummary(false);
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all cursor-pointer"
          type="button"
        >
          Got It! 👍
        </button>
      </div>
    </div>
  );
}
