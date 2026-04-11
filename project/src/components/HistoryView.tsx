import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, TrendingUp, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface DailySummary {
  date: string;
  meal_count: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  weight_prediction?: {
    difference: number;
    status: string;
    predicted_weight_change_kg: number;
    predicted_weight_change_lbs: number;
  };
  weekly_projection?: {
    weekly_change_kg: number;
    weekly_change_lbs: number;
    monthly_change_kg: number;
    monthly_change_lbs: number;
  };
}

interface FoodHistory {
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

export default function HistoryView() {
  const { user, token } = useAuth();
  const [foodHistory, setFoodHistory] = useState<FoodHistory[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'history' | 'daily'>('daily');

  useEffect(() => {
    loadData();
  }, [user, token, selectedDate]);

  const loadData = async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      // Load food history
      const historyResponse = await fetch(`${API_BASE_URL}/api/history?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setFoodHistory(historyData.history || []);
      }

      // Load daily summary with weight prediction
      const summaryResponse = await fetch(
        `${API_BASE_URL}/api/history/daily?date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setDailySummary(summaryData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todaysFoodsForDate = foodHistory.filter(food => 
    food.created_at.split('T')[0] === selectedDate
  );

  const previousDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const nextDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  if (!user || !token) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        <p className="text-gray-600">Please log in to view your food history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Your Food Log</h1>
        <p className="text-gray-600">Track your meals, calories, and weight projections</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={previousDate}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
          >
            ←
          </button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              Today
            </button>
          </div>

          <button
            onClick={nextDate}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
          <p className="text-gray-600 mt-2">Loading your data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Summary */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📅 {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>

            {dailySummary && dailySummary.meal_count > 0 ? (
              <div className="space-y-6">
                {/* Nutrition Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Meals</p>
                    <p className="text-3xl font-bold text-orange-600">{dailySummary.meal_count}</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Calories</p>
                    <p className="text-3xl font-bold text-red-600">{Math.round(dailySummary.total_calories)}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Protein</p>
                    <p className="text-3xl font-bold text-blue-600">{Math.round(dailySummary.total_protein)}g</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Carbs</p>
                    <p className="text-3xl font-bold text-green-600">{Math.round(dailySummary.total_carbs)}g</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Fats</p>
                    <p className="text-3xl font-bold text-purple-600">{Math.round(dailySummary.total_fats)}g</p>
                  </div>
                </div>

                {/* Weight Tracking */}
                {todaysFoodsForDate.some(f => f.user_weight) && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⚖️ Weight Tracking</h3>
                    {(() => {
                      const weights = todaysFoodsForDate
                        .filter(f => f.user_weight)
                        .map(f => f.user_weight as number)
                        .sort((a, b) => a - b);
                      
                      const minWeight = weights[0];
                      const maxWeight = weights[weights.length - 1];
                      const firstWeight = todaysFoodsForDate.find(f => f.user_weight)?.user_weight;
                      const lastWeight = [...todaysFoodsForDate].reverse().find(f => f.user_weight)?.user_weight;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Starting Weight</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {firstWeight?.toFixed(1)} kg
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Minimum</p>
                            <p className="text-2xl font-bold text-green-600">
                              {minWeight?.toFixed(1)} kg
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Maximum</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {maxWeight?.toFixed(1)} kg
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Change</p>
                            <p className={`text-2xl font-bold ${lastWeight && firstWeight && lastWeight > firstWeight ? 'text-red-600' : 'text-green-600'}`}>
                              {lastWeight && firstWeight ? (lastWeight > firstWeight ? '+' : '') + (lastWeight - firstWeight).toFixed(2) : '0.00'} kg
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {dailySummary.weight_prediction && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">📈 Weight Impact Prediction</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Calorie Status</p>
                        <p className="text-2xl font-bold">
                          {dailySummary.weight_prediction.difference > 0 ? '+' : ''}
                          {Math.round(dailySummary.weight_prediction.difference)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dailySummary.weight_prediction.status}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Today's Weight Change</p>
                        <p className="text-2xl font-bold text-red-600">
                          {dailySummary.weight_prediction.predicted_weight_change_kg > 0 ? '+' : ''}
                          {(dailySummary.weight_prediction.predicted_weight_change_kg).toFixed(3)} kg
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Weekly Impact</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {dailySummary.weekly_projection?.weekly_change_kg || 0 > 0 ? '+' : ''}
                          {(dailySummary.weekly_projection?.weekly_change_kg || 0).toFixed(2)} kg
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Monthly Impact</p>
                        <p className="text-2xl font-bold text-red-700">
                          {dailySummary.weekly_projection?.monthly_change_kg || 0 > 0 ? '+' : ''}
                          {(dailySummary.weekly_projection?.monthly_change_kg || 0).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>No meals logged for this date yet.</p>
                <p className="text-sm mt-2">Upload food images to start tracking!</p>
              </div>
            )}
          </div>

          {/* Today's Food Log - Simplified */}
          {todaysFoodsForDate.length > 0 && (
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🍽️ Foods Logged</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysFoodsForDate.map((food) => (
                  <div
                    key={food.id}
                    className="overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    {food.image_reference ? (
                      <div className="h-40 bg-gray-100 overflow-hidden">
                        <img
                          src={food.image_reference}
                          alt={food.food_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-4xl mb-2">🍽️</p>
                          <p className="text-gray-600 text-sm">No image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{food.food_name}</h3>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                            {food.meal_type}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {new Date(food.created_at).toLocaleTimeString('en-US', { 
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
                          <p className="font-bold text-red-600">{Math.round(food.calories)}</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-gray-600">Protein</p>
                          <p className="font-bold text-green-600">{Math.round(food.protein)}g</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-gray-600">Carbs</p>
                          <p className="font-bold text-blue-600">{Math.round(food.carbs)}g</p>
                        </div>
                      </div>

                      {/* Weight Log */}
                      {food.user_weight && (
                        <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-xs text-gray-600">Weight at Meal</p>
                          <p className="font-bold text-purple-600">{food.user_weight.toFixed(1)} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
