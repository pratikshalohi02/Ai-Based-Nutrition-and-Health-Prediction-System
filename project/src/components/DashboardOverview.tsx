import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Flame, TrendingUp, Target, Calendar, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface HealthProfile {
  daily_calorie_goal: number;
  bmi_category?: string;
}

interface DailySummary {
  meal_count: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface FoodLog {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  image_reference?: string;
  user_weight?: number;
  created_at: string;
}

export default function DashboardOverview() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    loadData(); // Load immediately on mount

    const timer = setInterval(() => {
      loadData();
    }, 2000); // Refresh every 2 seconds to show new logs

    return () => clearInterval(timer);
  }, [user, token]);

  const loadData = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Load health profile from local storage
      const profileData = localStorage.getItem('health_profile');
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's summary with calories from backend API
      try {
        const summaryResponse = await fetch(
          `${API_BASE_URL}/api/history/daily?date=${today}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setTodaySummary(summaryData);
        }
      } catch (err) {
        console.error('Error fetching daily summary:', err);
      }

      // Fetch all food history from backend
      try {
        const historyResponse = await fetch(
          `${API_BASE_URL}/api/history?limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const allLogs = historyData.history || [];
          
          // Filter today's logs and get the most recent
          const todaysLogs = allLogs.filter((log: FoodLog) =>
            log.created_at.split('T')[0] === today
          ).sort((a: FoodLog, b: FoodLog) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Get last 5 recent logs (today's logs or recent)
          const recent = todaysLogs.slice(0, 5);
          setRecentLogs(recent);
        }
      } catch (err) {
        console.error('Error fetching food history:', err);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthRecommendation = (calories: number, bmiCategory: string) => {
    const recommendations: Record<string, any> = {
      underweight: {
        good: calories > 500,
        icon: '⬆️',
        badge: 'HIGH CAL',
        badColor: 'from-red-50 to-orange-50',
        goodColor: 'from-green-50 to-emerald-50',
      },
      normal: {
        good: calories < 800,
        icon: '⚖️',
        badge: 'BALANCED',
        badColor: 'from-orange-50 to-red-50',
        goodColor: 'from-green-50 to-blue-50',
      },
      overweight: {
        good: calories < 500,
        icon: '⬇️',
        badge: 'LOW CAL',
        badColor: 'from-red-50 to-pink-50',
        goodColor: 'from-green-50 to-teal-50',
      },
      obese: {
        good: calories < 400,
        icon: '⬇️⬇️',
        badge: 'VERY LOW',
        badColor: 'from-red-100 to-pink-100',
        goodColor: 'from-green-100 to-teal-100',
      }
    };
    return recommendations[bmiCategory] || recommendations.normal;
  };

  if (loading && !todaySummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const caloriesConsumed = todaySummary?.total_calories || 0;
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const progressPercentage = Math.min(100, (caloriesConsumed / calorieGoal) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600">Here's your nutrition overview for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Calories Consumed</p>
          <p className="text-3xl font-bold text-gray-800">
            {Math.round(caloriesConsumed)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Daily Goal</p>
          <p className="text-3xl font-bold text-gray-800">{calorieGoal}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Remaining</p>
          <p className="text-3xl font-bold text-gray-800">
            {Math.round(caloriesRemaining)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Meals Logged</p>
          <p className="text-3xl font-bold text-gray-800">
            {todaySummary?.meal_count || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Today's Progress
        </h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Calorie Intake
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                progressPercentage > 100
                  ? 'bg-red-500'
                  : progressPercentage > 80
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>

        {todaySummary && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Protein</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(todaySummary.total_protein)}g
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(todaySummary.total_carbs)}g
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Fats</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(todaySummary.total_fats)}g
              </p>
            </div>
          </div>
        )}
      </div>

      {recentLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🍽️ Food Logged Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLogs.map((log) => {
              const rec = getHealthRecommendation(Math.round(log.calories), profile?.bmi_category || 'normal');
              const isGoodChoice = rec.good;
              const gradientBg = isGoodChoice ? rec.goodColor : rec.badColor;
              
              return (
              <div
                key={log.id}
                className={`overflow-hidden rounded-lg border-2 ${isGoodChoice ? 'border-green-300' : 'border-orange-300'} hover:shadow-lg transition-shadow bg-gradient-to-br ${gradientBg}`}
              >
                {/* Health Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${isGoodChoice ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                    {isGoodChoice ? '✅' : '⚠️'} {rec.badge}
                  </div>
                </div>

                {/* Image */}
                {log.image_reference ? (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={log.image_reference}
                      alt={log.food_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl mb-2">🍽️</p>
                      <p className="text-gray-600 text-sm">No image</p>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{log.food_name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {log.meal_type}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {new Date(log.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="font-bold text-red-600">{Math.round(log.calories)}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="font-bold text-green-600">{Math.round(log.protein)}g</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="font-bold text-blue-600">{Math.round(log.carbs)}g</p>
                    </div>
                  </div>

                  {/* Weight Log */}
                  {log.user_weight && (
                    <div className="text-center p-2 bg-purple-100 rounded border border-purple-300">
                      <p className="text-xs font-semibold text-purple-800">⚖️ Weight: {log.user_weight.toFixed(1)} kg</p>
                    </div>
                  )}

                  {/* Health Recommendation Message */}
                  <div className={`text-center p-2 rounded ${isGoodChoice ? 'bg-green-100 border border-green-300' : 'bg-orange-100 border border-orange-300'}`}>
                    <p className={`text-xs font-semibold ${isGoodChoice ? 'text-green-800' : 'text-orange-800'}`}>
                      {isGoodChoice ? '👍 Good choice for you!' : '⚠️ Limited recommendation'}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
