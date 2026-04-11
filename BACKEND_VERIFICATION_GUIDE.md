# Flask Backend - Complete System Verification Guide

## Quick Start

### 1. Start the Backend Server
```powershell
cd backend
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

The backend is now ready to accept requests on `http://localhost:5000`.

---

## System Verification Checklist

### ✓ Step 1: Check Database Initialization
Run this in Python to verify the database and tables are created:

```python
import sqlite3
conn = sqlite3.connect('backend/data/app.db')
cursor = conn.cursor()

# Check tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

# Check users table structure
cursor.execute("PRAGMA table_info(users);")
print("\nUsers table columns:", cursor.fetchall())

# Check food_history table structure
cursor.execute("PRAGMA table_info(food_history);")
print("\nFood history columns:", cursor.fetchall())

# Check food_history index
cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='food_history';")
print("\nFood history indexes:", cursor.fetchall())

conn.close()
```

**Expected Result:**
- Tables: `users`, `food_history`
- Users columns: `id, email, password_hash, created_at`
- Food history columns: `id, user_id, food_name, calories, protein, carbs, fats, confidence, ingredients, meal_type, image_reference, created_at`
- Index on `(user_id, created_at DESC)` for fast queries

---

### ✓ Step 2: Run Automated End-to-End Tests

While backend is running in another terminal:

```powershell
cd backend
python e2e_test.py
```

This will:
1. Register a test user (`e2e_test@example.com`)
2. Login and get JWT token
3. Upload a test food image and analyze it
4. Retrieve user history
5. Get daily calorie summary
6. Test entry deletion

**Expected Output:**
```
============================================================
  FLASK BACKEND END-TO-END TEST
  Testing: Registration → Login → Upload → History
============================================================

============================================================
  Test 1: User Registration
============================================================
✓ User registration successful: e2e_test@example.com

============================================================
  Test 2: User Login
============================================================
✓ Login successful for user ID: 1
✓ JWT token received (length: XXX chars)

[... more tests ...]

============================================================
Test Summary
============================================================
registration..................... ✓ PASSED
login............................ ✓ PASSED
food_analysis.................... ✓ PASSED
history_retrieval................ ✓ PASSED
daily_summary.................... ✓ PASSED
entry_deletion................... ✓ PASSED

✓ ALL TESTS PASSED! System is fully functional.
```

---

### ✓ Step 3: Manual API Testing

You can use PowerShell or `curl` to test endpoints directly:

#### A. Register a User
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"testuser@example.com","password":"TestPassword123!"}'

$response.Content | ConvertFrom-Json
```

#### B. Login
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"testuser@example.com","password":"TestPassword123!"}'

$data = $response.Content | ConvertFrom-Json
$token = $data.access_token
Write-Host "Token: $token"
```

#### C. Upload and Analyze Food
```powershell
$token = "YOUR_JWT_TOKEN"
$imagePath = "path/to/food/image.jpg"

$form = @{
    image = Get-Item -Path $imagePath
    meal_type = "breakfast"
}

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/analyze-food" `
  -Method POST `
  -Form $form `
  -Headers @{"Authorization" = "Bearer $token"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "food_name": "Pizza",
  "calories": 285,
  "protein": 12,
  "carbs": 36,
  "fats": 10,
  "confidence": 0.92,
  "ingredients": "Dough, Cheese, Tomato Sauce, Vegetables",
  "meal_type": "breakfast",
  "saved": true,
  "entry_id": 1
}
```

#### D. Retrieve User History
```powershell
$token = "YOUR_JWT_TOKEN"

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/history?limit=10&offset=0" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "food_name": "Pizza",
      "calories": 285,
      "protein": 12,
      "carbs": 36,
      "fats": 10,
      "confidence": 0.92,
      "ingredients": "Dough, Cheese, Tomato Sauce, Vegetables",
      "meal_type": "breakfast",
      "created_at": "2025-01-15 10:30:45"
    }
  ],
  "count": 1,
  "limit": 10,
  "offset": 0
}
```

#### E. Get Daily Summary
```powershell
$token = "YOUR_JWT_TOKEN"

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/history/daily" `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $token"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "meal_count": 3,
  "total_calories": 1850,
  "total_protein": 75,
  "total_carbs": 220,
  "total_fats": 55
}
```

---

## Database Inspection

### View All User Food History

```python
import sqlite3
from datetime import datetime

conn = sqlite3.connect('backend/data/app.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all food entries
cursor.execute("""
    SELECT fh.*, u.email 
    FROM food_history fh
    JOIN users u ON fh.user_id = u.id
    ORDER BY fh.created_at DESC
    LIMIT 20
""")

entries = cursor.fetchall()
print(f"Found {len(entries)} entries:\n")

for entry in entries:
    print(f"[{entry['created_at']}] {entry['email']}")
    print(f"  Food: {entry['food_name']}")
    print(f"  Calories: {entry['calories']} | P:{entry['protein']}g C:{entry['carbs']}g F:{entry['fats']}g")
    print()

conn.close()
```

### Clear Test Data (if needed)

```python
import sqlite3

conn = sqlite3.connect('backend/data/app.db')
cursor = conn.cursor()

# Delete test user and their history
cursor.execute("SELECT id FROM users WHERE email = 'e2e_test@example.com'")
user_id = cursor.fetchone()

if user_id:
    cursor.execute("DELETE FROM food_history WHERE user_id = ?", (user_id[0],))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id[0],))
    conn.commit()
    print("Test data cleared")

conn.close()
```

---

## Backend API Summary

### Authentication Endpoints
- **POST** `/api/auth/register` - Register new user
  - Body: `{"email": "user@example.com", "password": "password123"}`
  - Returns: `{"message": "User created successfully"}` (201)

- **POST** `/api/auth/login` - Login user
  - Body: `{"email": "user@example.com", "password": "password123"}`
  - Returns: `{"access_token": "jwt_token", "user": {"id": 1, "email": "user@example.com"}}` (200)

### Food Analysis Endpoint
- **POST** `/api/analyze-food` - Analyze food image
  - Headers: `Authorization: Bearer <jwt_token>` (optional but recommended)
  - Form: `image=<file>`, `meal_type=<breakfast|lunch|dinner|snack>`
  - Returns: Analysis result with `saved: true/false` (200)
  - **Auto-saves to database if authenticated**

### History Endpoints
- **GET** `/api/history?limit=100&offset=0` - Get user food history
  - Headers: `Authorization: Bearer <jwt_token>` (required)
  - Returns: `{"history": [...], "count": N, "limit": 100, "offset": 0}` (200)

- **GET** `/api/history/daily` - Get today's calorie summary
  - Headers: `Authorization: Bearer <jwt_token>` (required)
  - Returns: `{"meal_count": N, "total_calories": X, "total_protein": X, "total_carbs": X, "total_fats": X}` (200)

- **DELETE** `/api/history/<entry_id>` - Delete a food entry
  - Headers: `Authorization: Bearer <jwt_token>` (required)
  - Returns: `{"message": "Food entry deleted"}` (200)

---

## Food Database

The system includes 12 common foods with pre-loaded calorie and macronutrient data:

| Food | Calories | Protein | Carbs | Fats | Ingredients |
|------|----------|---------|-------|------|-------------|
| Pizza | 285 | 12 | 36 | 10 | Dough, Cheese, Tomato Sauce, Vegetables |
| Burger | 354 | 17 | 36 | 15 | Beef Patty, Bun, Lettuce, Tomato, Cheese |
| Pasta | 220 | 8 | 43 | 1.3 | Pasta, Tomato Sauce, Olive Oil, Garlic |
| Rice | 206 | 4 | 45 | 0.3 | Rice, Water, Salt |
| Salad | 150 | 8 | 20 | 6 | Mixed Greens, Vegetables, Dressing |
| Sushi | 200 | 9 | 40 | 1 | Rice, Seaweed, Fish, Vegetables |
| Sandwich | 300 | 15 | 38 | 9 | Bread, Meat, Cheese, Vegetables |
| Chicken | 165 | 31 | 0 | 3.6 | Chicken Breast, Seasoning |
| Fish | 208 | 30 | 0 | 11 | Fish Fillet, Lemon, Spices |
| Apple | 95 | 0.5 | 25 | 0.3 | Apple |
| Banana | 105 | 1.3 | 27 | 0.3 | Banana |
| Mixed Plate | 400 | 20 | 50 | 15 | Various ingredients (default fallback) |

If food is not recognized, the system returns "Mixed Plate" with default values.

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.9+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 isn't in use: `netstat -ano | findstr :5000`

### Database errors
- Delete `backend/data/app.db` to reset database
- Backend will auto-create new database on startup

### Authentication errors
- Ensure JWT token is included in `Authorization: Bearer <token>` header
- Tokens expire after 1 hour (configured in app.py)
- Register new user if forgotten password

### Food analysis returns generic result
- Ensure image file is valid (JPG, PNG, GIF)
- Food must be one of the 12 recognized types
- System falls back to "Mixed Plate" for unknown foods

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:5000`
- Check frontend is sending requests to correct URL
- Verify CORS is enabled (should be in app.py)

---

## Next Steps for Frontend Integration

1. Update `HistoryView.tsx` to call `GET /api/history` endpoint
2. Ensure JWT token is attached to authorization headers
3. Parse paginated response and display food entries
4. Add loading states and error handling
5. Implement real-time sync between upload and history display

---

## Production Considerations

- Replace SQLite with PostgreSQL for production
- Add database migrations system (Alembic)
- Implement proper file storage (S3, Azure Blob, etc.)
- Add rate limiting and request validation
- Implement proper logging and monitoring
- Use environment variables for configuration
- Enable HTTPS in production

---

## Notes

- JWT token expires after 1 hour (configurable in `app.py`)
- Food analysis auto-saves if JWT is valid and authenticated
- User IDs are automatically enforced in all database queries (security)
- Image files are stored as base64 in database (for simplicity)
- All timestamps are in UTC
