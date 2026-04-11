import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface DailySummary {
  date: string;
  meal_count: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  daily_calorie_goal: number;
}

const PORTION_SIZES: { [key: string]: number } = {
  'slice': 100,
  'cup': 240,
  'glass': 250,
  'bowl': 300,
  'plate': 400,
  'small': 150,
  'medium': 200,
  'large': 350,
};

export default function UploadFood() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState('');
  const [result, setResult] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [portionCount, setPortionCount] = useState('1');
  const [portionSize, setPortionSize] = useState('medium');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profileData = localStorage.getItem('health_profile');
    if (profileData) {
      setProfile(JSON.parse(profileData));
    }
    loadTodaySummary();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setError('Cannot access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setImage(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadTodaySummary = async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/api/history/daily?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDailySummary(data);
      }
    } catch (err) {
      console.error('Error loading daily summary:', err);
    }
  };

  const isCalorieLimitReached = () => {
    if (!dailySummary) return false;
    return dailySummary.total_calories >= dailySummary.daily_calorie_goal;
  };

  const getCalorieRemaining = () => {
    if (!dailySummary) return 0;
    return Math.max(0, dailySummary.daily_calorie_goal - dailySummary.total_calories);
  };

  const analyzeFoodFromImage = async () => {
    if (!image) {
      setError('Please capture or upload an image');
      return;
    }
    if (!foodName.trim()) {
      setError('Please enter food name');
      return;
    }
    if (!mealType) {
      setError('Please select meal type');
      return;
    }

    if (isCalorieLimitReached()) {
      setError('Daily calorie limit reached! Cannot log more food today.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const blob = await fetch(image).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'food.jpg');
      formData.append('food_name', foodName.trim());
      formData.append('meal_type', mealType.trim());
      formData.append('portion_count', portionCount);
      formData.append('portion_size', portionSize);

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze-food`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze food');
      }

      const foodData = await response.json();
      if (!foodData || !foodData.food_name) {
        throw new Error('No food data returned');
      }

      setResult(foodData);
      setSuccess(true);
      await loadTodaySummary();
      setFoodName('');
      setMealType('');
      setImage(null);
      setPortionCount('1');
      setPortionSize('medium');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze food';
      setError(msg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calorieRemaining = getCalorieRemaining();
  const percentageUsed = dailySummary 
    ? Math.min(100, (dailySummary.total_calories / dailySummary.daily_calorie_goal) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Camera className="w-8 h-8 text-green-600" />
          Food Logger
        </h1>
        <p className="text-gray-600 text-lg">Log your meals and track calories</p>
      </div>

      {/* CALORIE LIMIT STATUS - PROMINENT */}
      {dailySummary && (
        <div className={`rounded-xl shadow-lg p-6 border-2 ${
          isCalorieLimitReached()
            ? 'bg-red-50 border-red-400'
            : percentageUsed > 80
            ? 'bg-orange-50 border-orange-400'
            : 'bg-green-50 border-green-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📊 Daily Calorie Limit</h2>
            {isCalorieLimitReached() && (
              <div className="bg-red-200 text-red-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                LIMIT FULL
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">
                {dailySummary.total_calories} / {dailySummary.daily_calorie_goal} cal
              </span>
              <span className={`font-bold ${
                isCalorieLimitReached() ? 'text-red-600' : 'text-green-600'
              }`}>
                {isCalorieLimitReached() ? '❌ Over Limit' : `✓ ${calorieRemaining} cal remaining`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  isCalorieLimitReached() ? 'bg-red-500' :
                  percentageUsed > 80 ? 'bg-orange-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>
          </div>

          {isCalorieLimitReached() && (
            <p className="text-red-700 font-semibold text-center">
              ⚠️ You've reached your daily calorie limit! No more food can be logged today.
            </p>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-4 rounded-r flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Food logged successfully!</p>
            <p className="text-sm">Your meal has been added to today's intake.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-4 rounded-r">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* FOOD CAPTURE */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📸 Capture Your Food</h2>
        
        {!cameraActive && !image && (
          <div className="flex gap-3 mb-4">
            <button 
              onClick={startCamera}
              disabled={isCalorieLimitReached()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"
            >
              <Camera className="w-5 h-5" />
              Camera
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isCalorieLimitReached()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-3">
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              <button onClick={capturePhoto} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition shadow-md">Capture Photo</button>
              <button onClick={stopCamera} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition shadow-md">Cancel</button>
            </div>
          </div>
        )}

        {image && !cameraActive && (
          <div className="space-y-3">
            <img src={image} alt="Food" className="w-full h-64 object-cover rounded-lg" />
            <div className="flex gap-2">
              <button onClick={() => setImage(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition shadow-md">Clear</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-600 transition shadow-md">Change</button>
            </div>
          </div>
        )}
      </div>

      {/* FOOD DETAILS */}
      {image && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🍽️ Food Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Food Name
              </label>
              <input 
                type="text" 
                value={foodName} 
                onChange={(e) => setFoodName(e.target.value)} 
                placeholder="E.g., Pizza, Biryani, Salad" 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meal Type
              </label>
              <select 
                value={mealType} 
                onChange={(e) => setMealType(e.target.value)} 
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="">Select meal type</option>
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍪 Snack</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Portion Count
                </label>
                <input 
                  type="number" 
                  value={portionCount} 
                  onChange={(e) => setPortionCount(e.target.value)} 
                  placeholder="E.g., 2"
                  min="1"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Portion Size
                </label>
                <select 
                  value={portionSize} 
                  onChange={(e) => setPortionSize(e.target.value)} 
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="small">Small (150g)</option>
                  <option value="medium">Medium (200g)</option>
                  <option value="large">Large (350g)</option>
                  <option value="slice">1 Slice</option>
                  <option value="cup">1 Cup</option>
                  <option value="glass">1 Glass</option>
                  <option value="bowl">1 Bowl</option>
                </select>
              </div>
            </div>

            <button 
              onClick={analyzeFoodFromImage} 
              disabled={loading || !mealType || isCalorieLimitReached()}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition shadow-md"
            >
              {isCalorieLimitReached() ? '❌ Limit Reached' : loading ? '⏳ Analyzing...' : '✍️ Log This Food'}
            </button>
          </div>
        </div>
      )}

      {/* FOOD RESULT */}
      {result && success && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-blue-600">{Math.round(result.calories)}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{result.food_name}</p>
            <p className="text-sm text-blue-600 font-medium mt-1">
              {portionCount}x {portionSize} • Calories
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-100 p-4 rounded-lg text-center border-l-4 border-blue-600">
              <p className="text-xs font-bold text-blue-700 mb-1">PROTEIN</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(result.protein)}g</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center border-l-4 border-green-600">
              <p className="text-xs font-bold text-green-700 mb-1">CARBS</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(result.carbs)}g</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center border-l-4 border-orange-600">
              <p className="text-xs font-bold text-orange-700 mb-1">FATS</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(result.fats)}g</p>
            </div>
          </div>
        </div>
      )}

      {/* LOG ANOTHER BUTTON */}
      {success && !isCalorieLimitReached() && (
        <button 
          onClick={() => { setSuccess(false); setResult(null); setImage(null); setFoodName(''); setMealType(''); setPortionCount('1'); }} 
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold transition shadow-md"
        >
          ➕ Log Another Food
        </button>
      )}
    </div>
  );
}
