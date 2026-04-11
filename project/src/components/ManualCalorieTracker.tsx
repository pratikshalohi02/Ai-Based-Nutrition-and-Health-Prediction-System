import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Search, ChevronDown, Edit2 } from 'lucide-react';
import { getAllFoodNames, getUnitsForFood, calculateCalories } from '../lib/foodDatabase';
import { getMealsKey, getTodayDate } from '../lib/dateUtils';
import { broadcastSync } from '../lib/syncUtils';

interface FoodEntry {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

// Calculate approximate macros from calories (reasonable defaults)
const calculateMacrosFromCalories = (calories: number): { protein: number; carbs: number; fats: number } => {
  // Default macro split: 30% protein, 45% carbs, 25% fats
  const protein = Math.round((calories * 0.30) / 4); // 4 cal/g protein
  const carbs = Math.round((calories * 0.45) / 4); // 4 cal/g carbs
  const fats = Math.round((calories * 0.25) / 9); // 9 cal/g fats
  return { protein, carbs, fats };
}

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  target_weight?: number;
  activity_level?: string;
}

export default function ManualCalorieTracker() {
  const { user, token } = useAuth();
  const [foodSearch, setFoodSearch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [suggestedFoods, setSuggestedFoods] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [derivedCalories, setDerivedCalories] = useState(0);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allFoods] = useState(() => {
    try {
      return getAllFoodNames();
    } catch (err) {
      console.error('Error loading food database:', err);
      setError('Failed to load food database');
      return [];
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Data integrity: ensure all entries have valid timestamps and macros
  const validateAndFixEntries = (mealsData: any[]): FoodEntry[] => {
    return mealsData.map((entry: any) => {
      const fixed: any = { ...entry };
      
      // If entry doesn't have a timestamp, give it today's date
      if (!fixed?.timestamp) {
        console.warn('Fixing entry without timestamp:', entry);
        fixed.timestamp = new Date().toISOString();
      }
      
      // If entry doesn't have macros, calculate them from calories
      if (fixed.calories && (!fixed.protein || !fixed.carbs || !fixed.fats)) {
        console.warn('Fixing entry without macros:', entry);
        const macros = calculateMacrosFromCalories(fixed.calories);
        fixed.protein = fixed.protein || macros.protein;
        fixed.carbs = fixed.carbs || macros.carbs;
        fixed.fats = fixed.fats || macros.fats;
      }
      
      return fixed;
    });
  };

  // Load user profile and entries on mount
  useEffect(() => {
    try {
      // Load user profile
      const profileStr = localStorage.getItem('health_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setUserProfile(profile);
      }

      // Load entries from localStorage with validation
      const mealKey = getMealsKey();
      
      const meals = localStorage.getItem(mealKey);
      if (meals) {
        const parsedMeals = JSON.parse(meals);
        const validatedMeals = validateAndFixEntries(parsedMeals);
        setEntries(validatedMeals);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }

    // Initialize BroadcastChannel for real-time updates
    try {
      channelRef.current = new BroadcastChannel('meals_channel');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'MEAL_ADDED' || event.data.type === 'MEAL_UPDATED') {
          try {
            const mealKey = getMealsKey();
            const meals = localStorage.getItem(mealKey);
            if (meals) {
              const parsedMeals = JSON.parse(meals);
              const validatedMeals = validateAndFixEntries(parsedMeals);
              setEntries(validatedMeals);
            }
          } catch (err) {
            console.error('Error updating entries:', err);
          }
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported');
    }

    return () => {
      try {
        channelRef.current?.close();
      } catch (err) {
        console.error('Error closing channel:', err);
      }
    };
  }, []);

  // Handle food search
  const handleFoodSearch = (value: string) => {
    setFoodSearch(value);
    if (value.trim()) {
      const filtered = allFoods
        .filter(name => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setSuggestedFoods(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestedFoods([]);
      setShowSuggestions(false);
    }
  };

  // Handle food selection
  const handleSelectFood = (foodName: string) => {
    setSelectedFood(foodName);
    setFoodSearch(foodName);
    setShowSuggestions(false);
    const units = getUnitsForFood(foodName);
    setAvailableUnits(units);
    setSelectedUnit(units[0] || '');
    setQuantity('');
    setDerivedCalories(0);
  };

  // Handle unit change - recalculate calories
  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    if (selectedFood && quantity) {
      const calories = calculateCalories(selectedFood, parseFloat(quantity), unit);
      setDerivedCalories(calories || 0);
    }
  };

  // Handle quantity change - calculate calories
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (selectedFood && value && selectedUnit) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const calories = calculateCalories(selectedFood, num, selectedUnit);
        setDerivedCalories(calories || 0);
      }
    } else {
      setDerivedCalories(0);
    }
  };

  // Add food entry or update if editing
  const handleAddFood = () => {
    if (!selectedFood || !quantity || !selectedUnit) {
      alert('Please select food, quantity, and unit');
      return;
    }

    if (editingId) {
      // Update existing entry with calculated macros
      const macros = calculateMacrosFromCalories(derivedCalories);
      const updatedEntries = entries.map(entry =>
        entry.id === editingId
          ? {
              ...entry,
              name: selectedFood,
              quantity: parseFloat(quantity),
              unit: selectedUnit,
              calories: derivedCalories,
              protein: macros.protein,
              carbs: macros.carbs,
              fats: macros.fats
            }
          : entry
      );
      setEntries(updatedEntries);
      const mealKey = getMealsKey();
      localStorage.setItem(mealKey, JSON.stringify(updatedEntries));
      
      // Broadcast edit event
      broadcastSync('MEAL_EDITED', { entryId: editingId, date: getTodayDate() });
      
      setEditingId(null);
    } else {
      // Add new entry with calculated macros
      const macros = calculateMacrosFromCalories(derivedCalories);
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: selectedFood,
        quantity: parseFloat(quantity),
        unit: selectedUnit,
        calories: derivedCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        timestamp: new Date().toISOString()
      };

      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      const mealKey = getMealsKey();
      localStorage.setItem(mealKey, JSON.stringify(updatedEntries));

      // Broadcast sync event to all tabs
      broadcastSync('MEAL_ADDED', { entry: newEntry, date: getTodayDate() });

      try {
        if (channelRef.current) {
          channelRef.current.postMessage({ type: 'MEAL_ADDED' });
        }
      } catch (e) {
        console.error('Error broadcasting meal addition:', e);
      }
    }

    // Reset form
    setFoodSearch('');
    setQuantity('');
    setSelectedFood(null);
    setSelectedUnit('');
    setDerivedCalories(0);
    setAvailableUnits([]);
  };

  // Remove entry
  const handleRemoveEntry = (id: string) => {
    const removedEntry = entries.find(entry => entry.id === id);
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    
    const mealKey = getMealsKey();
    localStorage.setItem(mealKey, JSON.stringify(updatedEntries));

    // Broadcast sync event
    broadcastSync('MEAL_DELETED', { entryId: id, date: getTodayDate() });

    try {
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'MEAL_UPDATED' });
      }
    } catch (e) {
      console.error('Error broadcasting meal update:', e);
    }
  };

  // Edit entry - load it into the form
  const handleEditEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    setEditingId(id);
    setSelectedFood(entry.name);
    setFoodSearch(entry.name);
    setQuantity(entry.quantity.toString());
    setSelectedUnit(entry.unit);
    setDerivedCalories(entry.calories);
    
    const units = getUnitsForFood(entry.name);
    setAvailableUnits(units);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFoodSearch('');
    setQuantity('');
    setSelectedFood(null);
    setSelectedUnit('');
    setDerivedCalories(0);
  };

  const getUserStatus = () => {
    if (!userProfile?.bmi) return 'normal';
    if (userProfile.bmi < 18.5) return 'underweight';
    if (userProfile.bmi >= 25) return 'overweight';
    return 'normal';
  };

  const getFoodRecommendation = () => {
    const status = getUserStatus();
    if (status === 'underweight') {
      return {
        notRecommend: ['Light foods', 'Low-cal options', 'Excessive water'],
        okToHave: ['Moderate portions', 'Balanced meals', 'Healthy fats'],
        recommended: ['High-cal foods', 'Nuts & seeds', 'Whole grains', 'Protein-rich']
      };
    }
    if (status === 'overweight') {
      return {
        notRecommend: ['Fried foods', 'Sugary drinks', 'Fast food', 'Excessive oil'],
        okToHave: ['Moderate portions', 'Lean proteins', 'Whole grains'],
        recommended: ['Vegetables', 'Fruits', 'Low-fat dairy', 'Grilled foods']
      };
    }
    return {
      notRecommend: ['Excessive sugar', 'Too much fried food'],
      okToHave: ['Most foods in moderation', 'Balanced portions'],
      recommended: ['Vegetables', 'Fruits', 'Lean proteins', 'Whole grains']
    };
  };

  const todayEntries = entries.filter(entry => {
    // Safety check: ensure timestamp exists before using it
    if (!entry?.timestamp) {
      console.warn('Entry missing timestamp:', entry);
      return false;
    }
    const entryDate = entry.timestamp.split('T')[0];
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return entryDate === todayStr;
  });

  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const foodRec = getFoodRecommendation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manual Calorie Tracker</h1>
          <p className="text-gray-300">Log your food and track your nutrition</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* No Foods Loaded Warning */}
        {allFoods.length === 0 && !error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-700">
            <p className="font-bold">Warning:</p>
            <p>Food database not loaded. Please check the foodDatabase.ts file.</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Food Input */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl p-6">
            {allFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Food database not loaded</p>
                <p className="text-sm">Check console for errors</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Food Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={foodSearch}
                    onChange={(e) => handleFoodSearch(e.target.value)}
                    onFocus={() => foodSearch && setShowSuggestions(true)}
                    placeholder="e.g., Chicken, Pizza, Apple, Biryani..."
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  {showSuggestions && suggestedFoods.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {suggestedFoods.map((food, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectFood(food)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors text-sm font-medium text-gray-800"
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                  )}
                  {showSuggestions && suggestedFoods.length === 0 && foodSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 p-3 text-center text-sm text-gray-500">
                      No foods found
                    </div>
                  )}
                </div>
              </div>

              {/* Amount & Unit */}
              {selectedFood && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2">Amount & Unit for {selectedFood}</p>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder="Amount"
                      step="0.1"
                      min="0"
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-semibold"
                    />
                    <div className="flex-1 relative">
                      <select
                        value={selectedUnit}
                        onChange={(e) => handleUnitChange(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white font-medium"
                      >
                        <option value="">Choose unit</option>
                        {availableUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Calorie Estimation */}
              {selectedFood && quantity && selectedUnit && derivedCalories > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border-2 border-orange-300">
                  <p className="text-xs text-gray-700 mb-1">Estimated Calories</p>
                  <p className="text-4xl font-bold text-orange-600">{derivedCalories}</p>
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={handleAddFood}
                disabled={!selectedFood || !quantity || !selectedUnit || derivedCalories === 0}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedFood && quantity && selectedUnit && derivedCalories > 0
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                {editingId ? 'Update Food' : 'Add Food'}
              </button>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="w-full mt-2 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                >
                  Cancel Edit
                </button>
              )}
              </>
            )}
          </div>

          {/* Right: User Info Card */}
          <div className="lg:col-span-1">
            {userProfile && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Your Profile</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600"><strong>Weight:</strong> {userProfile.weight} kg</p>
                  <p className="text-gray-600"><strong>Height:</strong> {userProfile.height} cm</p>
                  <p className="text-gray-600"><strong>BMI:</strong> {userProfile.bmi?.toFixed(1)}</p>
                  <div className="pt-3 border-t">
                    <p className="text-gray-600"><strong>Today's Intake:</strong></p>
                    <p className="text-2xl font-bold text-orange-600">{totalCalories}</p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Summary Block */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Calories</p>
              <p className="text-3xl font-bold text-orange-600">{totalCalories}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Meals Logged</p>
              <p className="text-3xl font-bold text-blue-600">{todayEntries.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-xl font-bold text-green-600">Tracking</p>
            </div>
          </div>
        </div>

        {/* Food Recommendation Block */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Food Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Not Recommended */}
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-700 mb-3">❌ Not Recommended</h4>
              <ul className="space-y-2">
                {foodRec.notRecommend.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
            {/* Ok to Have */}
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <h4 className="font-bold text-yellow-700 mb-3">⚠️ Ok to Have</h4>
              <ul className="space-y-2">
                {foodRec.okToHave.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
            {/* Recommended */}
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-700 mb-3">✅ Recommended</h4>
              <ul className="space-y-2">
                {foodRec.recommended.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Entries Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Entries ({todayEntries.length})</h2>
          {todayEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No entries yet. Add your first food above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-orange-500">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{entry.name}</p>
                    <p className="text-sm text-gray-600">{entry.quantity} {entry.unit}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-xl font-bold text-orange-600">{entry.calories}</p>
                  </div>
                  <button
                    onClick={() => handleEditEntry(entry.id)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete entry"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
