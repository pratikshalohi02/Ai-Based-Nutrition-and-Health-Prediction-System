import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Plus, Trash2, Edit2, Clock, Flame, Target } from 'lucide-react';
import { getTodayDate, getExercisesKey } from '../lib/dateUtils';
import { broadcastSync } from '../lib/syncUtils';

interface Exercise {
  id: string;
  type: string;
  subType: string;
  duration: number; // in minutes
  intensity: 'light' | 'moderate' | 'intense';
  caloriesBurned: number;
  date: string;
  time: string;
}

interface ExerciseConfig {
  [key: string]: {
    [key: string]: {
      light: number; // calories per minute
      moderate: number;
      intense: number;
    };
  };
}

const EXERCISE_CALORIES_PER_MINUTE: ExerciseConfig = {
  gym: {
    'Weight Training': { light: 5, moderate: 8, intense: 12 },
    'Cardio Machine': { light: 6, moderate: 10, intense: 14 },
    'Circuit Training': { light: 7, moderate: 11, intense: 15 },
    'Crossfit': { light: 8, moderate: 13, intense: 17 },
    'Stretching': { light: 2, moderate: 3, intense: 4 },
  },
  yoga: {
    'Power Yoga': { light: 3, moderate: 5, intense: 7 },
    'Hatha Yoga': { light: 2, moderate: 4, intense: 6 },
    'Vinyasa Flow': { light: 4, moderate: 6, intense: 8 },
    'Meditation': { light: 1, moderate: 2, intense: 3 },
  },
  running: {
    'Slow (5 km/h)': { light: 6, moderate: 8, intense: 10 },
    'Moderate (8 km/h)': { light: 9, moderate: 12, intense: 15 },
    'Fast (12 km/h)': { light: 12, moderate: 15, intense: 18 },
    'Sprint': { light: 15, moderate: 18, intense: 22 },
  },
  walking: {
    'Casual (3 km/h)': { light: 2.5, moderate: 3.5, intense: 4.5 },
    'Brisk (5 km/h)': { light: 4, moderate: 5.5, intense: 7 },
    'Power Walk (6.5 km/h)': { light: 5.5, moderate: 7, intense: 9 },
    'Uphill': { light: 6, moderate: 8, intense: 11 },
  },
  cycling: {
    'Casual': { light: 4, moderate: 6, intense: 8 },
    'Moderate': { light: 7, moderate: 10, intense: 13 },
    'Mountain Biking': { light: 8, moderate: 12, intense: 16 },
    'Stationary': { light: 5, moderate: 8, intense: 11 },
  },
  swimming: {
    'Casual': { light: 5, moderate: 7, intense: 10 },
    'Moderate': { light: 7, moderate: 10, intense: 13 },
    'Lap Swimming': { light: 9, moderate: 12, intense: 15 },
    'Treading Water': { light: 4, moderate: 6, intense: 8 },
  },
  sports: {
    'Basketball': { light: 6, moderate: 10, intense: 14 },
    'Tennis': { light: 7, moderate: 11, intense: 15 },
    'Football': { light: 8, moderate: 12, intense: 16 },
    'Badminton': { light: 5, moderate: 8, intense: 11 },
    'Cricket': { light: 4, moderate: 7, intense: 10 },
  },
  other: {
    'Dancing': { light: 4, moderate: 7, intense: 10 },
    'Martial Arts': { light: 7, moderate: 11, intense: 15 },
    'Pilates': { light: 3, moderate: 5, intense: 7 },
    'Hiking': { light: 5, moderate: 8, intense: 11 },
    'Rock Climbing': { light: 7, moderate: 11, intense: 15 },
  },
};

export default function ExerciseTracker() {
  const { user, token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const exerciseChannelRef = useRef<BroadcastChannel | null>(null);

  // Form states
  const [exerciseType, setExerciseType] = useState<string>('gym');
  const [subType, setSubType] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');
  const [exerciseDate, setExerciseDate] = useState(getTodayDate());
  const [exerciseTime, setExerciseTime] = useState('12:00');

  const subTypes = EXERCISE_CALORIES_PER_MINUTE[exerciseType]
    ? Object.keys(EXERCISE_CALORIES_PER_MINUTE[exerciseType])
    : [];

  // Load exercises from localStorage
  useEffect(() => {
    try {
      const exerciseKey = getExercisesKey();
      const stored = localStorage.getItem(exerciseKey);
      if (stored) {
        setExercises(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading exercises:', err);
    }

    // Initialize BroadcastChannel for exercise updates
    try {
      exerciseChannelRef.current = new BroadcastChannel('exercise_channel');
      exerciseChannelRef.current.onmessage = (event) => {
        if (event.data.type === 'EXERCISE_UPDATED') {
          try {
            const exerciseKey = getExercisesKey();
            const stored = localStorage.getItem(exerciseKey);
            if (stored) {
              setExercises(JSON.parse(stored));
            }
          } catch (err) {
            console.error('Error updating exercises:', err);
          }
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported');
    }

    return () => {
      try {
        if (exerciseChannelRef.current) {
          exerciseChannelRef.current.close();
        }
      } catch (err) {
        console.error('Error closing channel:', err);
      }
    };
  }, []);

  // Update subType when exercise type changes
  useEffect(() => {
    if (subTypes.length > 0) {
      setSubType(subTypes[0]);
    }
  }, [exerciseType, subTypes]);

  const calculateCalories = (): number => {
    if (!exerciseType || !subType) return 0;
    const config = EXERCISE_CALORIES_PER_MINUTE[exerciseType]?.[subType];
    if (!config) return 0;
    const caloriesPerMin = config[intensity];
    return Math.round(caloriesPerMin * duration);
  };

  const handleAddExercise = () => {
    if (!subType || duration <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    const caloriesBurned = calculateCalories();
    const newExercise: Exercise = {
      id: editingId || Date.now().toString(),
      type: exerciseType,
      subType,
      duration,
      intensity,
      caloriesBurned,
      date: exerciseDate,
      time: exerciseTime,
    };

    let updatedExercises: Exercise[];
    if (editingId) {
      updatedExercises = exercises.map((ex) => (ex.id === editingId ? newExercise : ex));
      setEditingId(null);
    } else {
      updatedExercises = [...exercises, newExercise];
    }

    setExercises(updatedExercises);
    localStorage.setItem(getExercisesKey(), JSON.stringify(updatedExercises));

    // Broadcast update to other tabs
    if (editingId) {
      broadcastSync('EXERCISE_EDITED', { id: editingId, date: getTodayDate() });
    } else {
      broadcastSync('EXERCISE_ADDED', { id: newExercise.id, date: getTodayDate() });
    }
    
    if (exerciseChannelRef.current) {
      exerciseChannelRef.current.postMessage({ type: 'EXERCISE_UPDATED' });
    }

    // Reset form
    setExerciseType('gym');
    setSubType(subTypes[0] || '');
    setDuration(30);
    setIntensity('moderate');
    setExerciseDate(getTodayDate());
    setExerciseTime('12:00');
    setShowForm(false);
  };

  const handleEdit = (ex: Exercise) => {
    setExerciseType(ex.type);
    setSubType(ex.subType);
    setDuration(ex.duration);
    setIntensity(ex.intensity);
    setExerciseDate(ex.date);
    setExerciseTime(ex.time);
    setEditingId(ex.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this exercise record?')) {
      const updated = exercises.filter((ex) => ex.id !== id);
      setExercises(updated);
      localStorage.setItem(getExercisesKey(), JSON.stringify(updated));

      // Broadcast update to other tabs
      broadcastSync('EXERCISE_DELETED', { id, date: getTodayDate() });
      
      if (exerciseChannelRef.current) {
        exerciseChannelRef.current.postMessage({ type: 'EXERCISE_UPDATED' });
      }
    }
  };

  const todayExercises = exercises.filter((ex) => ex.date === getTodayDate());
  const totalCaloriesToday = todayExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDurationToday = todayExercises.reduce((sum, ex) => sum + ex.duration, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Exercise Tracker</h1>
        <p className="text-gray-600">
          Log your exercises and track calories burned
        </p>
      </div>

      {/* Today's Summary */}
      {todayExercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Today's Workouts</p>
                <p className="text-3xl font-bold text-blue-900">{todayExercises.length}</p>
              </div>
              <Activity className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-semibold">Total Duration</p>
                <p className="text-3xl font-bold text-orange-900">{totalDurationToday} min</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold">Calories Burned</p>
                <p className="text-3xl font-bold text-red-900">{totalCaloriesToday}</p>
              </div>
              <Flame className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Add Exercise Activity
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Edit' : 'Log'} Exercise Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Type
              </label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="gym">🏋️ Gym</option>
                <option value="yoga">🧘 Yoga</option>
                <option value="running">🏃 Running</option>
                <option value="walking">🚶 Walking</option>
                <option value="cycling">🚴 Cycling</option>
                <option value="swimming">🏊 Swimming</option>
                <option value="sports">⚽ Sports</option>
                <option value="other">🎯 Other</option>
              </select>
            </div>

            {/* Sub Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Details
              </label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                {subTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Intensity Level
              </label>
              <select
                value={intensity}
                onChange={(e) =>
                  setIntensity(e.target.value as 'light' | 'moderate' | 'intense')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="light">🟢 Light</option>
                <option value="moderate">🟡 Moderate</option>
                <option value="intense">🔴 Intense</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={exerciseDate}
                onChange={(e) => setExerciseDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={exerciseTime}
                onChange={(e) => setExerciseTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Calories Burned Display */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-600" />
                <span className="text-gray-700 font-semibold">Estimated Calories Burned:</span>
              </div>
              <span className="text-3xl font-bold text-red-600">{calculateCalories()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddExercise}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {editingId ? 'Update Exercise' : 'Log Exercise'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setExerciseType('gym');
                setSubType('');
                setDuration(30);
                setIntensity('moderate');
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exercise History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Exercise History</h2>
        </div>

        {exercises.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No exercises logged yet</p>
            <p className="text-gray-400">Start by adding your first exercise activity</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Intensity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Calories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">{ex.date}</div>
                      <div className="text-xs text-gray-500">{ex.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{ex.type}</div>
                      <div className="text-xs text-gray-500">{ex.subType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {ex.duration} min
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ex.intensity === 'light'
                            ? 'bg-green-100 text-green-700'
                            : ex.intensity === 'moderate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ex.intensity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1 font-bold text-red-600">
                        <Flame className="w-4 h-4" />
                        {ex.caloriesBurned}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(ex)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
