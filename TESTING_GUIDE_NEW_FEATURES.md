# Quick Testing Guide - NutriHealth Updates

## Prerequisites
- Node.js 16+ and npm installed
- Python 3.8+ with Flask running
- Backend API server at `http://localhost:5000`

---

## Step 1: Start the Backend Server

```bash
cd backend
python app.py
# OR if using requirements.txt
pip install -r requirements.txt
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

---

## Step 2: Start the Frontend (Vite Dev Server)

In a new terminal:

```bash
cd project
npm install  # Only needed first time
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 3: Test Feature 1 - Health Profile in Signup

### Test Scenario:
1. Open browser to `http://localhost:5173`
2. Click **"Register here"** link
3. **Step 1 - Email & Password:**
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirm: `Test123!`
   - Click **"Next Step"**

4. **Step 2 - Health Profile:**
   - Age: `25`
   - Gender: `Male` (or Female)
   - Height (cm): `175`
   - Weight (kg): `75`
   - Activity Level: `Moderate (3-5 days/week)`
   - Click **"Complete Registration"**

### Expected Results:
- ✅ Form validates input (password match, min length)
- ✅ TDEE calculated and displayed:
  - BMR ≈ 1707.5
  - TDEE ≈ 2646.6
  - Daily Goal ≈ 2381 calories
- ✅ Profile saved to localStorage
- ✅ Auto-redirects to Dashboard
- ✅ Dashboard shows daily goal (2381 cal)

### Verify in Browser Console:
```javascript
// Check localStorage
console.log(JSON.parse(localStorage.getItem('health_profile')))
// Should show: { age: 25, height: 175, weight: 75, ... daily_calorie_goal: 2381 }
```

---

## Step 4: Test Feature 2 - Calorie Limit Enforcement

### Test Scenario A - Under Limit (Green):
1. On Dashboard, click **"📸 Food Logger"** tab
2. Add food below limit:
   - Food: `Apple`
   - Meal Type: `Breakfast`
   - Portion: `1 × Medium`
   - Click **"Log Food"**

### Expected Results:
- ✅ Progress bar is **GREEN** (0-80%)
- ✅ Status shows: `✅ Safe to eat`
- ✅ "Log Food" button is **ENABLED**
- ✅ Remaining calories calculated correctly

### Test Scenario B - Approaching Limit (Orange):
1. Log more foods until reaching 80% of daily goal
2. Expected: Progress bar turns **ORANGE**
3. Status: `⚠️ Approaching limit`

### Test Scenario C - Limit Reached (Red):
1. Continue logging until total ≥ daily goal (2381)
2. Expected Results:
   - ✅ Progress bar is **RED** (100%+)
   - ✅ "LIMIT FULL" badge appears in RED
   - ✅ "Log Food" button is **DISABLED**
   - ✅ Error message: "Daily calorie limit reached! Cannot log more food today."
   - ✅ Try clicking disabled button → no action

### Verify Calculation:
```
If daily goal = 2381 cal
80% threshold = 1904 cal (orange starts)
100% threshold = 2381 cal (red starts, limit full)
```

---

## Step 5: Test Feature 3 - Portion Size Tracking

### Test Scenario:
1. On Food Logger page, click **"Portion Size"** dropdown
2. Verify all 7 options appear:
   - ✅ Small (150g)
   - ✅ Medium (200g)
   - ✅ Large (350g)
   - ✅ 1 Slice
   - ✅ 1 Cup
   - ✅ 1 Glass
   - ✅ 1 Bowl

3. Select:
   - Portion Count: `2`
   - Portion Size: `1 Cup`
   - Log food

### Expected Results:
- ✅ Food result shows: `2 × 1 Cup`
- ✅ User understands portion without grams
- ✅ Portion info saved in database

---

## Step 6: Test Profile View & Edit

1. Click **"👤 Profile"** tab
2. View health profile info
   - Age, Gender, Height, Weight shown
   - BMI calculated and categorized
   - Daily calorie goal displayed
   - Activity level shown

3. Click **"Edit"** button
4. Change one value (e.g., Weight: 70 kg)
5. Click **"Save Changes"**

### Expected Results:
- ✅ New value saved to database
- ✅ Daily goal recalculated
- ✅ localStorage updated
- ✅ Dashboard reflects changes

---

## Step 7: Test Login Flow

1. Logout (click **"Logout"** button)
2. At login page, enter:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Click **"Login"**

### Expected Results:
- ✅ Access token saved to localStorage
- ✅ Redirects to Dashboard
- ✅ User email shown in header

---

## Common Issues & Solutions

### Issue: "ECONNREFUSED" - Backend connection error
**Solution:** Make sure backend is running at `http://localhost:5000`
```bash
# Check if backend is running
curl http://localhost:5000/api/auth/login
# Should not error
```

### Issue: White screen or 404
**Solution:** Clear browser cache and hard refresh
```
Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
Select "Cookies and cached images"
Hard refresh: Ctrl+Shift+R
```

### Issue: "Access token missing" error
**Solution:** Health profile not saved
- Check localStorage: `console.log(localStorage.getItem('access_token'))`
- If empty, complete registration again

### Issue: Progress bar not updating
**Solution:** Dashboard cache issue
- Click "🔄 Refresh" button or reload page

---

## API Verification (Advanced)

### Test API endpoints manually with curl:

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Save health profile
TOKEN="your_access_token_here"
curl -X POST http://localhost:5000/api/profile/assessment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age":25,"height":175,"weight":75,"gender":"male",
    "activity_level":"moderate","daily_calorie_goal":2381
  }'

# 4. Get daily summary
curl -X GET "http://localhost:5000/api/history/daily?date=2024-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Feature Verification Checklist

### Feature 1: Health Profile During Signup
- [ ] Registration form has 2 steps
- [ ] Step 1 collects email & password with validation
- [ ] Step 2 collects age, height, weight, gender, activity level
- [ ] TDEE calculated correctly (uses Mifflin-St Jeor)
- [ ] Daily goal = TDEE × 0.9
- [ ] Saved to localStorage under 'health_profile'
- [ ] Saved to database via `/api/profile/assessment`
- [ ] Auto-redirect to Dashboard after save
- [ ] Can edit profile on Profile page

### Feature 2: Calorie Limit Enforcement
- [ ] Dashboard shows calorie progress bar
- [ ] Progress bar uses 3 colors (green/orange/red)
- [ ] Green: 0-80% of goal
- [ ] Orange: 80-100% of goal
- [ ] Red: 100%+ of goal
- [ ] "LIMIT FULL" badge shows when 100%+
- [ ] "Log Food" button disables when limit reached
- [ ] Error message shown when disabled

### Feature 3: Portion Size Tracking
- [ ] Portion dropdown has 7 standard options
- [ ] Portion count (numeric) can be set
- [ ] Portion size selection works
- [ ] Portion info displayed in food result (e.g., "2 × 1 Cup")
- [ ] Easy for non-technical users to understand

---

## Testing Notes

**Performance:**
- Dashboard should load in < 1 second
- Food logging should respond in < 500ms
- Progress bar updates instantly

**Responsiveness:**
- Test on mobile (375px width)
- Test on tablet (768px width)
- Test on desktop (1920px width)

**Browser Compatibility:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Next Steps After Testing

If all tests pass:
1. ✅ Commit changes: `git add . && git commit -m "Add health profile, calorie limits, portion tracking"`
2. ✅ Push to GitHub: `git push origin main`
3. ✅ Deploy to production

If issues found:
1. Check console for errors (F12 → Console tab)
2. Verify backend API responses (check Network tab)
3. Check localStorage: `localStorage.clear()` to reset
4. Restart both servers and try again

---

## Support Information

For debugging backend API issues, check:
- `/backend/app.py` - Main Flask app
- `/backend/routes/analysis.py` - Food analysis endpoint
- `/backend/routes/history.py` - Daily summary endpoint
- `/backend/routes/profile.py` - Health profile endpoint

For frontend issues, check:
- JavaScript Console (F12)
- Network tab for API calls
- Application → LocalStorage in DevTools

