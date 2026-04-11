// Utility to get today's date consistently in local timezone
export const getTodayDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get meals key for localStorage
export const getMealsKey = (): string => {
  return `meals_${getTodayDate()}`;
};

// Get exercises key for localStorage
export const getExercisesKey = (): string => {
  return `exercises_${getTodayDate()}`;
};

// Get daily summary for a specific date
export const getDailySummaryKey = (date: string): string => {
  return `daily_summary_${date}`;
};

// Archive history key
export const HISTORY_ARCHIVE_KEY = 'daily_history_archive';

// Interface for daily summary
export interface DailySummary {
  date: string;
  total_calories: number;
  calories_burned: number;
  net_calories: number;
  daily_calorie_goal: number;
  meal_count: number;
  exercise_count: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  insight?: string;
}

// Archive today's data when moving to a new day
export const archiveDailyData = (date: string, data: DailySummary): void => {
  try {
    const archiveKey = HISTORY_ARCHIVE_KEY;
    const archive = localStorage.getItem(archiveKey);
    const archiveData: Record<string, DailySummary> = archive ? JSON.parse(archive) : {};
    
    // Add/update the daily summary in archive
    archiveData[date] = data;
    
    localStorage.setItem(archiveKey, JSON.stringify(archiveData));
  } catch (err) {
    console.error('Error archiving daily data:', err);
  }
};

// Get archived daily data for a specific date
export const getArchivedDailyData = (date: string): DailySummary | null => {
  try {
    const archiveKey = HISTORY_ARCHIVE_KEY;
    const archive = localStorage.getItem(archiveKey);
    if (!archive) return null;
    
    const archiveData: Record<string, DailySummary> = JSON.parse(archive);
    return archiveData[date] || null;
  } catch (err) {
    console.error('Error retrieving archived data:', err);
    return null;
  }
};

// Get all archived history (last 30 days)
export const getAllArchivedData = (days: number = 30): DailySummary[] => {
  try {
    const archiveKey = HISTORY_ARCHIVE_KEY;
    const archive = localStorage.getItem(archiveKey);
    if (!archive) return [];
    
    const archiveData: Record<string, DailySummary> = JSON.parse(archive);
    const dates = Object.keys(archiveData)
      .sort()
      .reverse()
      .slice(0, days);
    
    return dates.map(date => archiveData[date]);
  } catch (err) {
    console.error('Error retrieving all archived data:', err);
    return [];
  }
};

// Generate insight message based on daily data
export const generateDailyInsight = (summary: DailySummary): string => {
  const percentageOfGoal = (summary.total_calories / summary.daily_calorie_goal) * 100;
  
  if (percentageOfGoal < 50) {
    return `🟡 Low intake: You consumed only ${Math.round(percentageOfGoal)}% of your daily goal.`;
  } else if (percentageOfGoal < 80) {
    return `🟠 Under goal: You were ${Math.round(100 - percentageOfGoal)}% below your daily target.`;
  } else if (percentageOfGoal <= 100) {
    return `🟢 Perfect! You maintained balance at ${Math.round(percentageOfGoal)}% of your daily goal.`;
  } else if (percentageOfGoal < 120) {
    return `🟡 Slightly over: You exceeded your goal by ${Math.round(percentageOfGoal - 100)}%.`;
  } else {
    return `🔴 Over goal: You exceeded your daily target by ${Math.round(percentageOfGoal - 100)}%`;
  }
};

// Check if we need to clear data (new day) and handle automatic daily reset
export const shouldClearOldMeals = (): boolean => {
  const lastDate = localStorage.getItem('last_meals_date');
  const today = getTodayDate();
  
  if (!lastDate || lastDate !== today) {
    // On day change, archive the previous day's data
    if (lastDate) {
      archivePreviousDayData(lastDate);
    }
    
    localStorage.setItem('last_meals_date', today);
    return lastDate !== null; // True if we had data from a different day
  }
  return false;
};

// Archive the previous day's data when transitioning to a new day
const archivePreviousDayData = (previousDate: string): void => {
  try {
    // Get meals from previous day
    const mealsKey = `meals_${previousDate}`;
    const exercisesKey = `exercises_${previousDate}`;
    
    const meals = localStorage.getItem(mealsKey);
    const exercises = localStorage.getItem(exercisesKey);
    const dailyGoal = localStorage.getItem('daily_calorie_goal');
    
    const mealsData = meals ? JSON.parse(meals) : [];
    const exercisesData = exercises ? JSON.parse(exercises) : [];
    
    // Calculate totals
    const totalCalories = mealsData.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
    const caloriesBurned = exercisesData.reduce((sum: number, ex: any) => sum + (ex.caloriesBurned || 0), 0);
    const netCalories = Math.max(0, totalCalories - caloriesBurned);
    
    const totalProtein = mealsData.reduce((sum: number, meal: any) => sum + (meal.protein || 0), 0);
    const totalCarbs = mealsData.reduce((sum: number, meal: any) => sum + (meal.carbs || 0), 0);
    const totalFats = mealsData.reduce((sum: number, meal: any) => sum + (meal.fats || 0), 0);
    
    const summary: DailySummary = {
      date: previousDate,
      total_calories: totalCalories,
      calories_burned: caloriesBurned,
      net_calories: netCalories,
      daily_calorie_goal: parseInt(dailyGoal || '2000'),
      meal_count: mealsData.length,
      exercise_count: exercisesData.length,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      insight: generateDailyInsight({
        date: previousDate,
        total_calories: totalCalories,
        calories_burned: caloriesBurned,
        net_calories: netCalories,
        daily_calorie_goal: parseInt(dailyGoal || '2000'),
        meal_count: mealsData.length,
        exercise_count: exercisesData.length,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats
      })
    };
    
    archiveDailyData(previousDate, summary);
    
    // Optionally clear the old data (keeping it archived)
    localStorage.removeItem(mealsKey);
    localStorage.removeItem(exercisesKey);
    
  } catch (err) {
    console.error('Error archiving previous day data:', err);
  }
};

// Automatically reset meals when a new day starts
export const initializeDailyReset = (): void => {
  // Check if it's a new day
  shouldClearOldMeals();
  
  // Set up midnight check to reset meals at exactly midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Reset meals at midnight
  setTimeout(() => {
    const today = getTodayDate();
    shouldClearOldMeals();
    localStorage.setItem('last_meals_date', today);
    // This will be called again when the user opens the app after midnight
    initializeDailyReset();
  }, timeUntilMidnight);
};
