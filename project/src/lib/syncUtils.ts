import { getMealsKey, getExercisesKey, getTodayDate } from './dateUtils';

export type SyncEventType = 'MEAL_ADDED' | 'MEAL_DELETED' | 'MEAL_EDITED' | 'EXERCISE_ADDED' | 'EXERCISE_DELETED' | 'EXERCISE_EDITED';

export interface SyncEvent {
  type: SyncEventType;
  timestamp: number;
  data?: any;
}

// Create a sync channel for real-time updates
export const createSyncChannel = (): BroadcastChannel => {
  return new BroadcastChannel('nutrihealth_sync');
};

// Broadcast a sync event to all tabs/windows
export const broadcastSync = (eventType: SyncEventType, data?: any): void => {
  try {
    const channel = createSyncChannel();
    channel.postMessage({
      type: eventType,
      timestamp: Date.now(),
      data
    } as SyncEvent);
    channel.close();
  } catch (err) {
    console.warn('BroadcastChannel not supported:', err);
  }
};

// Calculate total calories for a specific date
export const calculateDailyCalories = (date: string = getTodayDate()): { total: number; burned: number; net: number } => {
  try {
    const mealsKey = `meals_${date}`;
    const exercisesKey = `exercises_${date}`;
    
    const meals = localStorage.getItem(mealsKey);
    const exercises = localStorage.getItem(exercisesKey);
    
    const mealsData = meals ? JSON.parse(meals) : [];
    const exercisesData = exercises ? JSON.parse(exercises) : [];
    
    // Filter by date to handle cross-date entries
    const mealEntries = mealsData.filter((m: any) => m?.timestamp?.startsWith(date));
    const exerciseEntries = exercisesData.filter((e: any) => e?.date === date || !e?.date);
    
    const total = mealEntries.reduce((sum: number, meal: any) => sum + (meal?.calories || 0), 0);
    const burned = exerciseEntries.reduce((sum: number, ex: any) => sum + (ex?.caloriesBurned || 0), 0);
    const net = Math.max(0, total - burned);
    
    return { total, burned, net };
  } catch (err) {
    console.error('Error calculating daily calories:', err);
    return { total: 0, burned: 0, net: 0 };
  }
};

// Calculate nutritional totals for a date
export const calculateDailyNutrients = (date: string = getTodayDate()): { protein: number; carbs: number; fats: number } => {
  try {
    const mealsKey = `meals_${date}`;
    const meals = localStorage.getItem(mealsKey);
    const mealsData = meals ? JSON.parse(meals) : [];
    
    const mealEntries = mealsData.filter((m: any) => m?.timestamp?.startsWith(date));
    
    const protein = mealEntries.reduce((sum: number, meal: any) => sum + (meal?.protein || 0), 0);
    const carbs = mealEntries.reduce((sum: number, meal: any) => sum + (meal?.carbs || 0), 0);
    const fats = mealEntries.reduce((sum: number, meal: any) => sum + (meal?.fats || 0), 0);
    
    return { protein, carbs, fats };
  } catch (err) {
    console.error('Error calculating daily nutrients:', err);
    return { protein: 0, carbs: 0, fats: 0 };
  }
};

// Safe listener setup with cleanup
export const setupSyncListener = (
  onSync: (event: SyncEvent) => void,
  eventTypes?: SyncEventType[]
): (() => void) => {
  try {
    const channel = createSyncChannel();
    
    const handler = (event: MessageEvent<SyncEvent>) => {
      // Filter by event type if specified
      if (eventTypes && !eventTypes.includes(event.data.type)) {
        return;
      }
      onSync(event.data);
    };
    
    channel.addEventListener('message', handler);
    
    // Return cleanup function
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  } catch (err) {
    console.warn('Error setting up sync listener:', err);
    return () => {}; // Return no-op cleanup
  }
};

// Debounce function for expensive re-renders
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for frequent updates
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
