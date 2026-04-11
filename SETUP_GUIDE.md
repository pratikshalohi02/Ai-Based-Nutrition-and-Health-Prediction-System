# 🚀 Health & Calorie Tracker - New Local Backend Setup

## ✅ What Changed

The application has been **completely migrated from Supabase to a local Flask backend**. All heavy lifting is now done locally with:

- ✅ **Local Flask API** (No Docker, no external dependencies)
- ✅ **SQLite Database** (Auto-created, no setup needed)
- ✅ **JWT Authentication** (Local, no Supabase)
- ✅ **Image Upload & Food Analysis** (Works locally)
- ✅ **Frontend unchanged** (Same UI, same UX)

---

## 🎯 System Architecture

```
┌─ Frontend (React + Vite)
│  ├─ Login / Register
│  ├─ Health Assessment
│  ├─ Food Upload & Analysis
│  └─ Calorie Tracking
│
└─ Backend (Flask on localhost:5000)
   ├─ /api/auth/register (POST)
   ├─ /api/auth/login (POST)
   ├─ /api/analyze-food (POST)
   └─ SQLite database (auto-created)
```

---

## 🚀 Quick Start Guide

### Step 1: Start the Backend Server

```bash
cd backend
python app.py
```

✅ **Output should show:**
```
🚀 Backend starting at http://localhost:5000
 * Running on http://127.0.0.1:5000
```

The backend will:
- Auto-create SQLite database at `backend/data/app.db`
- Create tables automatically on first run
- Listen for requests on `http://localhost:5000`

### Step 2: Start the Frontend (in another terminal)

```bash
cd project
npm run dev
```

✅ **Frontend will be available at:**
```
http://localhost:5173
```

---

## 📋 API Endpoints (Running Locally)

### Authentication

**Register:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Food Analysis

**Analyze Food Image:**
```bash
POST http://localhost:5000/api/analyze-food
Content-Type: multipart/form-data

- image: <binary image file>
- food_name: "pizza" (optional)
```

**Response:**
```json
{
  "food_name": "Pizza",
  "calories": 285,
  "confidence": 0.85,
  "ingredients": ["dough", "tomato sauce", "cheese"]
}
```

---

## 🗂️ File Structure

```
project-bolt-sb1-x7ki61zf/
├── backend/                           # NEW: Flask Backend
│   ├── app.py                        # Main Flask app
│   ├── requirements.txt               # Python dependencies
│   ├── data/
│   │   └── app.db                   # SQLite database (auto-created)
│   ├── routes/
│   │   ├── auth.py                  # Authentication endpoints
│   │   └── analyze.py               # Food analysis endpoint
│   ├── services/
│   │   ├── db_service.py            # Database setup
│   │   ├── auth_service.py          # Auth logic
│   │   └── food_analysis_service.py # Food detection logic
│   ├── models/
│   │   └── user_model.py            # User database model
│   └── utils/
│       └── image_utils.py           # Image processing
│
├── project/                          # UPDATED: React Frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # ✅ Updated: Uses local Flask auth
│   │   ├── components/
│   │   │   ├── UploadFood.tsx        # ✅ Updated: Uses local API
│   │   │   ├── Dashboard.tsx         # ✅ Updated: Local storage
│   │   │   ├── DashboardOverview.tsx # ✅ Updated: Local storage
│   │   │   ├── HealthAssessment.tsx  # ✅ Updated: Local storage
│   │   │   ├── CalorieTracker.tsx    # ✅ Updated: Local storage
│   │   │   └── HealthProfileView.tsx # ✅ Updated: No Supabase
│   │   └── lib/
│   │       └── supabase.ts           # REMOVED: No longer used
│   └── package.json
│
└── supabase/                         # Kept for reference (not used)
```

---

## 🔐 Credentials

No credentials needed! The system runs entirely locally:

- ✅ No `.env` files required
- ✅ No API keys needed
- ✅ No external services
- ✅ No Docker necessary

### Everything is Local:
- Database: `backend/data/app.db` (auto-created on first run)
- Server: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

## 💾 Data Storage

### User Accounts
Stored in `backend/data/app.db` (SQLite):
- Email + hashed passwords
- JWT tokens stored in browser's localStorage

### Food Logs & Health Profiles
Stored in **browser's localStorage** for quick access:
- Food logs: `localStorage.getItem('food_logs')`
- Health profile: `localStorage.getItem('health_profile')`
- Auth token: `localStorage.getItem('access_token')`

---

## 🧪 Testing

### Test Registration & Login:
1. Go to `http://localhost:5173`
2. Click "Create Account" → Enter email + password → Submit
3. Click "Login" → Use the same email + password
4. ✅ Should see Dashboard

### Test Image Upload:
1. Go to "Upload Food" tab
2. Click "Upload from Gallery" or "Take Photo"
3. Select/capture a food image
4. Enter food name (optional): e.g., "pizza", "burger"
5. Select meal type
6. Click "Analyze Food Image"
7. ✅ Should see nutrition analysis instantly

### Test Manual Entry:
1. Go to "Calorie Tracker" tab
2. Fill in food name, calories, macros
3. Click "Log Food"
4. ✅ Food should appear in recent logs

---

## ⚙️ Configuration

No configuration needed! But if you want to customize:

### Change Backend Port:
Edit `backend/app.py`:
```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)  # ← Change 5000 to your port
```

### Change Frontend API URL:
Already set in components (e.g., `UploadFood.tsx`):
```typescript
const API_BASE_URL = 'http://localhost:5000';
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Try changing the port in backend/app.py
```

### Module not found errors
```bash
cd backend
python -m pip install -r requirements.txt
```

### Frontend can't reach backend
- Ensure backend is running: `ps aux | grep python`
- Check if `http://localhost:5000/api/health` returns 200
- Clear browser cache and try again

### Image upload fails
- Make sure image is < 5MB
- Supported formats: JPG, PNG, WebP
- CORS is enabled for local access

---

## 📦 Dependencies

### Backend (Python)
- Flask 2.3.3
- Flask-CORS 4.0.0
- Flask-JWT-Extended 4.5.2
- Pillow 12.2.0 (image processing)

### Frontend (Node)
- React 18+
- Vite
- Tailwind CSS
- Lucide Icons

---

## 🚀 Deployment Notes

This setup is **production-ready locally** but for deployment:

1. **Production Server**: Use Gunicorn instead of Flask dev server
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

2. **Database**: Migrate to PostgreSQL for production
   
3. **Environment Variables**: Add to `.env`
   ```
   JWT_SECRET_KEY=your-secret-key
   FLASK_ENV=production
   ```

4. **Frontend Build**: 
   ```bash
   npm run build
   # Outputs to project/dist/
   ```

---

## 🎉 Success Checklist

- [x] Backend runs without errors
- [x] Frontend connects to backend
- [x] Registration works
- [x] Login works
- [x] Image upload works
- [x] Food analysis returns data
- [x] No Supabase errors
- [x] Data persists in localStorage

---

## 📝 What Was Removed

- ❌ All Supabase imports
- ❌ Supabase database calls
- ❌ Supabase authentication
- ❌ Edge Functions (Deno)
- ❌ Cloud storage references
- ❌ `.env` Supabase variables

## ✅ What Was Added

- ✅ Flask backend (`backend/app.py`)
- ✅ Local authentication (JWT)
- ✅ SQLite database
- ✅ Image processing (Pillow)
- ✅ Food analysis service
- ✅ CORS middleware
- ✅ Updated React components
- ✅ Local storage for data

---

## 🤝 Support

If you encounter issues:

1. Check backend logs in terminal
2. Verify port 5000 is not blocked
3. Ensure Python 3.8+ is installed
4. Run `npm install` in project folder
5. Clear browser localStorage if needed

---

**🎯 Ready to roll! Start with:**
```bash
cd backend && python app.py  # Terminal 1
cd project && npm run dev     # Terminal 2
```

Then open `http://localhost:5173` in your browser! 🚀
