# Dashboard Food Logging - Complete Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Frontend)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐        ┌──────────────┐      ┌──────────────┐  │
│  │   Upload Food   │        │   Dashboard  │      │    History   │  │
│  │   Component     │        │   Component  │      │   Component  │  │
│  │                 │        │              │      │              │  │
│  │ • Capture image │        │ • Shows daily│      │ • Lists all  │  │
│  │ • Enter food    │        │   calories   │      │   foods      │  │
│  │   name          │        │ • Recent     │      │ • By date    │  │
│  │ • Select meal   │        │   meals list │      │   filtering  │  │
│  │   type          │        │ • Auto-      │      │ • Daily      │  │
│  │ • Click Analyze │        │   refreshes  │      │   totals     │  │
│  └────────┬────────┘        └──────┬───────┘      └──────┬───────┘  │
│           │                        │                     │           │
│           └─JWT TOKEN NOW SENT ────┼─JWT TOKEN SENT ─────┼─JWT TOKEN │
│                                    │                     │           │
└────────────────────────────────────┼─────────────────────┼───────────┘
                                     │                     │
                    API Gateway (/api/*) Routes
                                     │                     │
┌────────────────────────────────────┼─────────────────────┼───────────┐
│              BACKEND (Flask)        │                     │           │
├────────────────────────────────────┼─────────────────────┼───────────┤
│                                    ▼                     ▼           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  /api/analyze-food (POST)      /api/history (GET)          │    │
│  │                                                             │    │
│  │  1. Extract JWT token ✓    1. Extract JWT token ✓       │    │
│  │  2. Get user_id from token 2. Get user_id from token    │    │
│  │  3. Process image          3. Query database:          │    │
│  │  4. AI Food Analysis          SELECT * FROM            │    │
│  │  5. Extract nutrients         food_history             │    │
│  │     (calories, protein,       WHERE user_id = ?        │    │
│  │      carbs, fats)          4. Return to frontend       │    │
│  │  6. SAVE TO DATABASE ✓                                 │    │
│  │  7. Return results to frontend                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  food_history TABLE                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ id | user_id | food_name | calories | protein | carbs |... │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 1  │ 42      │ Apple     │ 95       │ 0.5     │ 25    │    │   │
│  │ 2  │ 42      │ Chicken   │ 165      │ 31      │ 0     │    │   │
│  │ 3  │ 42      │ Rice      │ 130      │ 3       │ 28    │    │   │
│  │... │ ...     │ ...       │ ...      │ ...     │ ...   │    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow Steps (What Happens When You Upload Food)

### Step 1: Upload Phase ✓ FIXED
```
User Action:
┌─────────────────────────────┐
│ 1. User takes photo         │
│ 2. Enters food name: Apple  │
│ 3. Selects meal: Breakfast  │
│ 4. Clicks "Analyze"         │
└────────────┬────────────────┘
             │
             ▼
Frontend Code (UploadFood.tsx):
┌─────────────────────────────────────────────┐
│ const headers = {                           │
│   "Authorization": "Bearer <JWT_TOKEN>"  ✓  │
│ }                                           │
│                                             │
│ const response = fetch(                     │
│   "/api/analyze-food",                      │
│   {                                         │
│     method: "POST",                         │
│     headers: headers,  ✓ FIXED              │
│     body: formData                          │
│   }                                         │
│ )                                           │
└────────────┬────────────────────────────────┘
             │
             ▼
JWT Token Included in Request Header ✓
```

### Step 2: Backend Analysis
```
Backend (analyze.py):
┌──────────────────────────────────┐
│ 1. Receive request with token    │
│ 2. Extract JWT token from header │
│ 3. Decode token to get user_id   │
│    user_id = 42  ✓ SUCCESS       │
│ 4. Process image with AI         │
│ 5. Extract nutritional data      │
└────────────┬─────────────────────┘
             │
             ▼
Save to Database (food_history_model.py):
┌──────────────────────────────────────────┐
│ create_food_entry(                       │
│   user_id=42,  ✓ NOW AVAILABLE           │
│   food_name="Apple",                     │
│   calories=95,                           │
│   protein=0.5,                           │
│   carbs=25,                              │
│   meal_type="breakfast"                  │
│ )                                        │
│                                          │
│ INSERT INTO food_history ...  ✓ SUCCESS  │
└──────────────────────────────────────────┘
```

### Step 3: Dashboard Refresh
```
DashboardOverview.tsx (Auto-refresh every 2 seconds):
┌────────────────────────────────────────────┐
│ const headers = {                          │
│   "Authorization": "Bearer <JWT_TOKEN>"    │
│ }                                          │
│                                            │
│ fetch("/api/history/daily?date=2026-04-10",│
│   { headers }                              │
│ )                                          │
│                                            │
│ Response: {                                │
│   total_calories: 95  ✓ INCLUDES APPLE     │
│   total_protein: 0.5                       │
│   total_carbs: 25                          │
│   meal_count: 1                            │
│ }                                          │
└────────────────────────────────────────────┘
         │
         ▼
UI Updates:
┌─────────────────────────────────┐
│ "Calories Consumed: 95"         │
│ "Remaining: 1905"               │
│ "Recent Meals:"                 │
│ • Apple - 95 cal - Breakfast    │
└─────────────────────────────────┘
```

## Key Improvement: JWT Token Flow

### BEFORE FIX ❌
```
Frontend (UploadFood.tsx):
fetch("/api/analyze-food", {
  method: "POST",
  body: formData
  // ❌ NO HEADERS!
})
    │
    ▼
Backend (analyze.py):
try:
  user_id = extract_from_token()  # ❌ NO TOKEN = NULL
  if user_id:
    save_to_database()  # ❌ SKIPPED because user_id is None
except:
  pass  # Silently fails!
    │
    ▼
Database: ❌ NO ENTRY CREATED
    │
    ▼
Dashboard: ❌ No data to display
```

### AFTER FIX ✓
```
Frontend (UploadFood.tsx):
const headers = { "Authorization": "Bearer <token>" }
fetch("/api/analyze-food", {
  method: "POST",
  headers: headers,  ✓
  body: formData
})
    │
    ▼
Backend (analyze.py):
try:
  user_id = extract_from_token()  # ✓ TOKEN PRESENT = user_id = 42
  if user_id:
    save_to_database()  # ✓ EXECUTED!
except:
  pass
    │
    ▼
Database: ✓ ENTRY CREATED
INSERT INTO food_history (user_id=42, food_name="Apple", ...)
    │
    ▼
Dashboard: ✓ DATA DISPLAYED
Calories Consumed: 95
```

## Complete Request/Response Cycle

### Upload Food Request
```
POST /api/analyze-food HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="image"; filename="food.jpg"
[BINARY IMAGE DATA]
--boundary
Content-Disposition: form-data; name="food_name"
Apple
--boundary
Content-Disposition: form-data; name="meal_type"
breakfast
--boundary--
```

### Upload Food Response
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "food_name": "Apple",
  "calories": 95,
  "protein": 0.5,
  "carbs": 25,
  "fats": 0.2,
  "ingredients": ["apple"],
  "confidence": 0.92,
  "user_log": {
    "entry_id": 123,
    "logged_at": "2026-04-10T14:32:00",
    "daily_summary": {
      "date": "2026-04-10",
      "total_calories_today": 95
    }
  }
}
```

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| JWT Token in Request | ❌ Not sent | ✅ Sent |
| User ID Extraction | ❌ Fails (None) | ✅ Success |
| Database Save | ❌ Skipped | ✅ Executed |
| Dashboard Display | ❌ Empty | ✅ Shows calories |
| History Persistence | ❌ Lost | ✅ Saved |
| User Data Association | ❌ Missing | ✅ Linked |

---

**Fix Applied**: April 10, 2026
**Status**: COMPLETE ✓
