/*
  # Health & Nutrition Analysis Database Schema
  
  ## Overview
  Complete database schema for AI-based nutrition and health analysis application
  
  ## Tables Created
  
  ### 1. health_profiles
  Stores user health information collected during initial assessment
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `age` (integer)
  - `height` (decimal - in cm)
  - `weight` (decimal - in kg)
  - `gender` (text - 'male', 'female', 'other')
  - `activity_level` (text - 'sedentary', 'moderate', 'active')
  - `bmi` (decimal - calculated)
  - `bmi_category` (text - 'underweight', 'normal', 'overweight', 'obese')
  - `daily_calorie_goal` (integer)
  - `completed_assessment` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. food_logs
  Tracks all food entries (both uploaded images and manual entries)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `food_name` (text)
  - `calories` (decimal)
  - `protein` (decimal - in grams)
  - `carbs` (decimal - in grams)
  - `fats` (decimal - in grams)
  - `meal_type` (text - 'breakfast', 'lunch', 'dinner', 'snack')
  - `entry_type` (text - 'image', 'manual')
  - `image_url` (text, nullable)
  - `portion_size` (text)
  - `logged_at` (timestamptz)
  - `created_at` (timestamptz)
  
  ### 3. daily_summaries
  Aggregated daily nutrition data
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `date` (date)
  - `total_calories` (decimal)
  - `total_protein` (decimal)
  - `total_carbs` (decimal)
  - `total_fats` (decimal)
  - `meals_logged` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. weight_history
  Tracks weight changes over time for prediction
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `weight` (decimal - in kg)
  - `recorded_at` (timestamptz)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Authenticated users only
*/

-- Create health_profiles table
CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age integer NOT NULL CHECK (age > 0 AND age < 150),
  height decimal(5,2) NOT NULL CHECK (height > 0),
  weight decimal(5,2) NOT NULL CHECK (weight > 0),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'moderate', 'active')),
  bmi decimal(5,2) NOT NULL,
  bmi_category text NOT NULL CHECK (bmi_category IN ('underweight', 'normal', 'overweight', 'obese')),
  daily_calorie_goal integer NOT NULL,
  completed_assessment boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name text NOT NULL,
  calories decimal(8,2) NOT NULL CHECK (calories >= 0),
  protein decimal(6,2) DEFAULT 0 CHECK (protein >= 0),
  carbs decimal(6,2) DEFAULT 0 CHECK (carbs >= 0),
  fats decimal(6,2) DEFAULT 0 CHECK (fats >= 0),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  entry_type text NOT NULL CHECK (entry_type IN ('image', 'manual')),
  image_url text,
  portion_size text DEFAULT '1 serving',
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index on food_logs for efficient querying
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  total_calories decimal(8,2) DEFAULT 0,
  total_protein decimal(6,2) DEFAULT 0,
  total_carbs decimal(6,2) DEFAULT 0,
  total_fats decimal(6,2) DEFAULT 0,
  meals_logged integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create index on daily_summaries
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- Create weight_history table
CREATE TABLE IF NOT EXISTS weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight decimal(5,2) NOT NULL CHECK (weight > 0),
  recorded_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index on weight_history
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON weight_history(user_id, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_profiles
CREATE POLICY "Users can view own health profile"
  ON health_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health profile"
  ON health_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile"
  ON health_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for food_logs
CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_summaries
CREATE POLICY "Users can view own daily summaries"
  ON daily_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries"
  ON daily_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries"
  ON daily_summaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weight_history
CREATE POLICY "Users can view own weight history"
  ON weight_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight history"
  ON weight_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight history"
  ON weight_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight history"
  ON weight_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update daily summaries when food is logged
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_summaries (user_id, date, total_calories, total_protein, total_carbs, total_fats, meals_logged)
  VALUES (
    NEW.user_id,
    DATE(NEW.logged_at),
    NEW.calories,
    NEW.protein,
    NEW.carbs,
    NEW.fats,
    1
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_calories = daily_summaries.total_calories + NEW.calories,
    total_protein = daily_summaries.total_protein + NEW.protein,
    total_carbs = daily_summaries.total_carbs + NEW.carbs,
    total_fats = daily_summaries.total_fats + NEW.fats,
    meals_logged = daily_summaries.meals_logged + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update daily summary on food log insert
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON food_logs;
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

-- Function to update health profile timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS trigger_health_profiles_updated_at ON health_profiles;
CREATE TRIGGER trigger_health_profiles_updated_at
  BEFORE UPDATE ON health_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_daily_summaries_updated_at ON daily_summaries;
CREATE TRIGGER trigger_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();