# Step-by-Step Testing Guide

## Prerequisites
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ You are logged in with your account
- ✅ Database (app.db) is initialized

## Step 1: Prepare the App
1. Open your app in browser
2. Login with your account
3. Navigate to **Upload Food** page

## Step 2: Upload Food Image

### Option A: Using Camera
1. Click **"Take Photo with Camera"**
2. Allow camera access
3. Capture a photo of food (or any image)
4. Click **"Capture Photo"**

### Option B: Using Gallery
1. Click **"Upload from Gallery"**
2. Select an image file (jpg, png, etc.)
3. Image will be displayed

## Step 3: Fill Required Fields
1. **Food Name** field: Enter "Apple" (or actual food name)
2. **Meal Type** dropdown: Select "Breakfast"
3. **Your Weight** (optional): Enter your weight in kg
4. Click **"Analyze Food Image"**

**Expected Result**:
- Loading spinner appears
- After 2-3 seconds, analysis shows:
  - Food name: "Apple"
  - Calories: ~95 kcal
  - Green success message: "Food logged successfully!"

## Step 4: Check Dashboard Update
1. Navigate to **Dashboard** (left menu)
2. Wait 2 seconds for auto-refresh
3. Check the cards at the top:

```
Calories Consumed: Should include the apple calories
Daily Goal: Your daily goal (e.g., 2000)
Remaining: Reduced by apple calories
```

4. Scroll down to **"Recent Meals"** section
5. You should see "Apple" listed with:
   - Calories: ~95
   - Meal Type: Breakfast
   - Time: Just now

## Step 5: Verify in History View
1. Navigate to **History** (left menu)
2. Current date should be today (2026-04-10)
3. You should see:
   - **Daily Total Calories**: Includes the apple
   - **Today's Meals**: List shows Apple entry
   - **Meal Count**: Increased by 1

## Step 6: Database Verification (Optional)
Go to backend terminal and run:

```bash
cd backend
python3
>>> from services.db_service import get_db
>>> with get_db() as conn:
>>>     foods = conn.execute("SELECT food_name, calories, created_at FROM food_history ORDER BY created_at DESC LIMIT 5").fetchall()
>>>     for f in foods:
>>>         print(f"{f[0]}: {f[1]} cal at {f[2]}")
```

You should see the apple entry.

## Troubleshooting

### Problem: Food uploaded but not showing in Dashboard

**Check 1: Are you logged in?**
```
✓ Go to Dashboard
✓ Check if you see "Welcome Back!" message
✓ If you see "Please log in", login first
```

**Check 2: Is backend running?**
```
Terminal: cd backend && python app.py
Should see: 🚀 Backend starting at http://localhost:5000
```

**Check 3: Open browser console (F12) and check:**
- Network tab → Find the `/api/analyze-food` request
- Should see status: 200
- Response should include `user_log` object with `entry_id`

**Check 4: Verify token is being sent:**
- Open DevTools → Network tab
- Upload a food
- Click on `/api/analyze-food` request
- Check Request Headers for: `Authorization: Bearer <token>`

### Problem: Dashboard not auto-refreshing
- Refresh the page manually (F5)
- Check if you have network connection
- Check browser console for any errors

### Problem: Calories not calculating correctly
- Verify the food was recognized correctly
- Try uploading a different food
- Check if the backend is analyzing correctly

## Expected Total Calories After Test Sequence

Starting point: Dashboard shows 0 calories

After uploading Apple (~95 cal):
- Dashboard shows: 95 calories
- Remaining calories: original_goal - 95

If you upload multiple items:
- Each upload adds to total
- Total shows cumulative calories

## Performance Check

- **Dashboard loads**: < 2 seconds
- **Analysis completes**: 2-3 seconds
- **Dashboard updates**: within 2 seconds
- **Data persists**: Survives page refresh ✓

---

**Status**: Ready for Testing
**Created**: 2026-04-10
