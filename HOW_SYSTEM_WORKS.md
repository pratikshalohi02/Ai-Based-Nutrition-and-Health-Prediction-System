# NutriHealth System Architecture & User Guide

## 🎯 Quick Start Guide

### For New Users

1. **Sign Up/Sign In**
   - Visit login page
   - Create account or sign in
   - Set up health profile (age, weight, height, gender, activity level, weight goal)

2. **Track Your First Day**
   - Go to Dashboard
   - Use "Upload Food" to scan food photos
   - Or use "Manual Tracker" to log meals manually
   - Log exercises in "Exercise Plan"
   - Watch Dashboard update in real-time

3. **Review Progress**
   - Check "Food History" for daily summary
   - See weight predictions
   - Read daily performance insight

---

## 🏗️ System Architecture

### Frontend Stack
```
React 18 (TypeScript)
  ├─ Vite (build tool)
  ├─ Tailwind CSS (styling)
  ├─ Lucide Icons (UI icons)
  └─ BroadcastChannel API (real-time sync)
```

### Backend Stack
```
Flask (Python)
  ├─ JWT Authentication
  ├─ PostgreSQL Database
  ├─ AI/ML for food detection
  ├─ Weight prediction models
  └─ RESTful API
```

### Data Storage
```
Browser localStorage:
  ├─ meals_YYYY-MM-DD: Today's food entries
  ├─ exercises_YYYY-MM-DD: Today's exercises
  ├─ health_profile: User's health data
  ├─ daily_history_archive: Previous days' summaries
  ├─ access_token: JWT for API calls
  └─ last_meals_date: Day boundary detection
```

---

## 📊 How Daily Tracking Works

### System Flow

```
┌─────────────────────────────────────────┐
│         USER OPENS APP                  │
└─────────────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  App Loads Dashboard   │
         └────────┬───────────────┘
                  │
                  ▼
      ┌───────────────────────┐
      │ Check: Did date       │
      │ change since last     │
      │ load?                 │
      └───────┬───────────────┘
              │
         Yes  │  No
        ┌─────┴──────┐
        ▼            ▼
    ┌──────────┐ ┌──────────┐
    │ Archive  │ │ Load     │
    │ yesterday│ │ today's  │
    │'s data  │ │ data     │
    └────┬─────┘ └────┬─────┘
         │            │
         └─────┬──────┘
              ▼
    ┌──────────────────┐
    │ Display Today's  │
    │ Meals/Calories   │
    │ in Dashboard     │
    └──────────────────┘
```

### Automatic Daily Reset

**Trigger**: Day boundary detection

```javascript
lastDate = "2026-03-15"  // from localStorage
today = "2026-03-16"     // current date

if (lastDate !== today) {
  // Archive previous day
  archivePreviousDayData("2026-03-15")
  
  // Clear old daily keys
  deleteKey("meals_2026-03-15")
  deleteKey("exercises_2026-03-15")
  
  // Update tracking date
  setLastDate("2026-03-16")
}
```

### What Gets Archived

```javascript
DailySummary {
  date: "2026-03-15",
  total_calories: 2145,
  calories_burned: 350,
  net_calories: 1795,
  meal_count: 3,
  exercise_count: 2,
  total_protein: 85,
  total_carbs: 250,
  total_fats: 72,
  insight: "🟢 Perfect! You maintained balance at 107% of your daily goal."
}
```

---

## 🔄 Real-Time Synchronization

### How Multi-Tab Sync Works

```
USER'S BROWSER WITH 2 TABS

Tab 1: Dashboard           Tab 2: Manual Tracker
│                          │
│                          User adds meal
│                          │
│                          broadcastSync('MEAL_ADDED')
│                          │
│                          └──► BroadcastChannel
│                              │
│◄─────────────────────────────┘
│
Dashboard receives event
│
Updates calculations
│
Re-renders with new totals
│
User sees instant update
```

### Event Types & Payloads

```javascript
// User adds food
{
  type: 'MEAL_ADDED',
  data: {
    entry: { id, name, calories, protein, carbs, fats },
    date: getTodayDate()
  }
}

// User edits food
{
  type: 'MEAL_EDITED',
  data: {
    id: 'meal-123',
    date: getTodayDate()
  }
}

// User adds exercise
{
  type: 'EXERCISE_ADDED',
  data: {
    entry: { id, type, duration, intensity, caloriesBurned },
    date: getTodayDate()
  }
}
```

---

## 📱 Component Architecture

### Page Structure

```
MainApp (Layout)
├─ Sidebar Navigation
├─ Header (Page Title + Date)
└─ Content Area
    ├─ Dashboard
    │  ├─ Nutrition metrics cards
    │  ├─ Daily insight strip
    │  ├─ Logged meals list
    │  └─ Calories burned
    │
    ├─ Upload Food
    │  ├─ Camera/file upload
    │  ├─ API food detection
    │  └─ Confirmation
    │
    ├─ Manual Tracker
    │  ├─ Food database lookup
    │  ├─ Quantity input
    │  ├─ Edit/delete buttons
    │  └─ Quick add
    │
    ├─ Exercise Plan
    │  ├─ Exercise type selector
    │  ├─ Duration & intensity
    │  ├─ Calorie calculation
    │  ├─ Edit/delete buttons
    │  └─ Total burned display
    │
    ├─ Food History
    │  ├─ Date selector
    │  ├─ Nutrition summary
    │  ├─ Daily insight message
    │  ├─ Food items grid
    │  ├─ Weight tracking
    │  └─ Weight predictions
    │
    ├─ Personalized Diet
    │  ├─ User profile summary
    │  ├─ Calorie calculations
    │  ├─ Meal plan suggestions
    │  ├─ Foods to eat/avoid
    │  └─ Tips & recommendations
    │
    ├─ Health Profile
    │  ├─ Edit health data
    │  ├─ Weight tracking
    │  └─ Goal adjustments
    │
    └─ Recommendations
       ├─ Dynamic meal plans
       ├─ Food suggestions
       ├─ Exercise advice
       └─ Progress tracking
```

---

## 🧮 How Personalized Diet Works

### Step 1: Collect Health Data

```javascript
Profile {
  age: 28,
  weight: 75,      // current
  height: 175,     // cm
  gender: "male",
  target_weight: 70,  // goal
  activity_level: "moderate"
}
```

### Step 2: Calculate BMR (Basal Metabolic Rate)

**For Males (Harris-Benedict)**:
```
BMR = 88 + (13.4 × weight) + (4.8 × height) - (5.7 × age)
    = 88 + (13.4 × 75) + (4.8 × 175) - (5.7 × 28)
    = 88 + 1005 + 840 - 159.6
    = 1773.4 kcal/day
```

**For Females (Harris-Benedict)**:
```
BMR = 655 + (9.6 × weight) + (1.8 × height) - (4.7 × age)
```

### Step 3: Calculate TDEE (Total Daily Energy Expenditure)

```javascript
activityMultipliers = {
  sedentary: 1.2,    // little exercise
  light: 1.375,      // 1-3 days/week
  moderate: 1.55,    // 3-5 days/week
  active: 1.725,     // 6-7 days/week
  very_active: 1.9   // intensive training
}

TDEE = BMR × activityMultipliers[activity_level]
     = 1773.4 × 1.55
     = 2748 kcal/day
```

### Step 4: Determine Goal & Create Plan

**Scenario 1: Weight Loss** (target_weight < weight)
```
Deficit Goal: 15% below TDEE
Target Calories = 2748 - (2748 × 0.15) = 2335 kcal/day

Meal Strategy:
- High protein (25-30g per meal)
- Whole grains & vegetables
- Lean proteins
- Limited fats & sugars
```

**Scenario 2: Weight Gain** (target_weight > weight)
```
Surplus Goal: 20% above TDEE
Target Calories = 2748 + (2748 × 0.20) = 3298 kcal/day

Meal Strategy:
- High calorie meals
- 5-6 meals per day
- Protein rich (2g per kg bodyweight)
- Healthy fats
```

**Scenario 3: Maintenance** (target_weight = weight)
```
Balanced Goal: At TDEE
Target Calories = 2748 kcal/day

Meal Strategy:
- Balanced macros
- Whole foods
- Regular exercise
- Consistent portions
```

---

## 📊 How Daily Insight Works

### Calculation

```javascript
dailyGoal = 2400  // from profile
totalCalories = 2485  // from meals today
percentageOfGoal = (2485 / 2400) × 100 = 103.5%
```

### Insight Messages

| Range | Message | Color |
|-------|---------|-------|
| < 50% | 🟡 "Low intake: You consumed only 45% of your daily goal" | Yellow |
| 50-80% | 🟠 "Under goal: You were 25% below your daily target" | Orange |
| 80-110% | 🟢 "Perfect! You maintained balance at 103% of your goal" | Green |
| 110-130% | 🟡 "Slightly over: You exceeded your goal by 3%" | Yellow |
| > 130% | 🔴 "Over goal: You exceeded daily target by 25%" | Red |

### Real-Time Updates

When user adds food:
1. Manual Tracker sends `MEAL_ADDED` event
2. Dashboard receives broadcast
3. Recalculates total calories
4. Recomputes insight
5. Updates message instantly

---

## 💾 localStorage Structure

### Daily Keys (Reset Each Day)
```
meals_2026-04-12 = [
  {
    id: "meal-1",
    food_name: "Grilled Chicken",
    quantity: 150,
    unit: "g",
    calories: 280,
    protein: 42,
    carbs: 0,
    fats: 12,
    timestamp: "2026-04-12T12:30:00"
  },
  {
    id: "meal-2",
    food_name: "Brown Rice",
    quantity: 150,
    unit: "g",
    calories: 195,
    protein: 4,
    carbs: 43,
    fats: 1,
    timestamp: "2026-04-12T12:30:00"
  }
]

exercises_2026-04-12 = [
  {
    id: "ex-1",
    type: "running",
    subType: "Moderate (8 km/h)",
    duration: 30,
    intensity: "moderate",
    caloriesBurned: 350,
    date: "2026-04-12",
    time: "06:00 AM"
  }
]
```

### Persistent Keys (Survive Day Change)
```
health_profile = {
  age: 28,
  weight: 75,
  height: 175,
  gender: "male",
  target_weight: 70,
  activity_level: "moderate",
  bmi: 24.5
}

access_token = "eyJhbGciOiJIUzI1NiIs..."

last_meals_date = "2026-04-12"  // for day boundary detection
```

### History Archive
```
daily_history_archive = {
  "2026-04-11": {
    date: "2026-04-11",
    total_calories: 2150,
    calories_burned: 400,
    net_calories: 1750,
    meal_count: 3,
    exercise_count: 1,
    total_protein: 95,
    total_carbs: 220,
    total_fats: 65,
    insight: "🟢 Perfect! You maintained balance at 107% of your daily goal."
  },
  "2026-04-10": {
    ... (previous day data)
  }
}
```

---

## 🔐 Data Flow Security

### User Authentication
```
1. User enters email/password
2. Sent to backend (HTTPS)
3. Backend validates & creates JWT
4. JWT stored in localStorage (httpOnly on production)
5. JWT included in all API requests
6. Backend verifies JWT on each request
```

### API Requests
```javascript
fetch('http://localhost:5000/api/history', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
})
```

### Error Handling
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  // Use data
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
  setError('Failed to load data. Please try again.');
}
```

---

## 📈 Weight Prediction

### Backend Calculation

```
Based on:
- Daily calorie surplus/deficit
- Activity level
- Current weight
- Metabolism

Formula:
3500 kcal deficit = 1 kg weight loss
3500 kcal surplus = 1 kg weight gain

Daily Impact = net_calories / 3500

Weekly Impact = daily_impact × 7
Monthly Impact = weekly_impact × 4
```

### Display in History

```
Today's Weight Change: -0.120 kg
Weekly Impact: -0.84 kg
Monthly Impact: -3.36 kg
```

---

## 🎨 UI/UX Flow

### Dashboard

```
USER OPENS APP
            │
            ▼
    ┌──────────────────┐
    │  Load from       │
    │  localStorage    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Load health     │
    │  profile         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Calculate:      │
    │  - Calories      │
    │  - Macros        │
    │  - Burned        │
    │  - Net           │
    └────────┬─────────┘
             │
             ▼
    ┌───────────────────────┐
    │  Display Cards:       │
    │  - Calories (red)     │
    │  - Protein (blue)     │
    │  - Carbs (green)      │
    │  - Fats (purple)      │
    │  - Burned (orange)    │
    └────────┬──────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Generate Insight  │
    │  & Display Strip   │
    └────────┬───────────┘
             │
             ▼
    ┌──────────────────┐
    │  Display Logged  │
    │  Meals as Cards  │
    └──────────────────┘
```

---

## 🔧 Development Environment

### Running Locally

**Frontend**:
```bash
cd project
npm install
npm run dev
# Visits http://localhost:5173
```

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Key Files

```
project/
├─ src/
│  ├─ components/     (React components)
│  ├─ contexts/       (Auth context)
│  ├─ lib/            (Utilities & helpers)
│  ├─ App.tsx         (Main app)
│  └─ main.tsx        (Entry point)
├─ vite.config.ts     (Build config)
└─ tailwind.config.js (Styling config)
```

---

## 📞 Troubleshooting

### Issue: Dashboard doesn't update after adding food

**Solution**:
1. Check BroadcastChannel support (Chrome, Firefox, Safari all support)
2. Verify meal was saved to `meals_YYYY-MM-DD`
3. Check browser console for errors
4. Refresh page manually

### Issue: Exercise calories not showing

**Solution**:
1. Verify exercise saved to `exercises_YYYY-MM-DD`
2. Ensure exercise has `date` and `caloriesBurned`
3. Check that date matches today's date
4. Refresh page

### Issue: History not showing yesterday's data

**Solution**:
1. App must detect day change (wait until midnight or force refresh)
2. Verify `daily_history_archive` not empty in localStorage
3. Check date picker is set to yesterday
4. View browser console for parsing errors

---

## 🎓 Advanced Topics

### BroadcastChannel API Limitations

**Pros**:
- Instant cross-tab communication
- No server required
- Simple API

**Cons**:
- Same-origin only
- Same browser only
- Not available in incognito mode

**Fallback**: 
- Uses 100ms polling as backup
- Checks localStorage every 100ms
- Works everywhere but less responsive

### localStorage Size Limits

**Typical Limits**:
- Chrome/Firefox: 5-10MB
- Safari: 5MB
- Edge: 10MB

**Current Usage**:
- Meals: ~1KB per entry
- Profile: ~500 bytes
- History archive: ~100 bytes per day

**Max Capacity**: ~50 years of data

---

**Last Updated**: April 12, 2026  
**Status**: ✅ Production Ready
