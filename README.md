# 🍽️ NutriHealth - AI-Powered Nutrition Tracking System

**A full-stack AI nutrition and health prediction system with React frontend and Flask backend. Tracks food intake, analyzes nutrition, and provides personalized health insights.**

---

## 📋 Project Overview

NutriHealth is a production-ready nutritional tracking application that combines computer vision (food image analysis) with machine learning to provide:
- **Automatic food recognition** from images
- **Nutritional analysis** (calories, macros, ingredients)
- **Health profile tracking** (weight, fitness goals)
- **Persistent food history** with daily summaries
- **Personalized recommendations** based on health data

---

## ⚡ Quick Start (2 Minutes)

### Setup

```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2: Frontend (new terminal)
cd project
npm install
npm run dev
```

**Access the app:** http://localhost:5173

Backend runs on `http://localhost:5000`

### Verify Installation

```bash
# Terminal 3: Run tests
cd backend
python e2e_test.py
```

Expected output: ✅ All 6 tests pass

---

## 🎯 Key Features

### 📸 Food Recognition
- Upload food images
- AI-powered food detection
- Recognition of 12+ common foods
- Automatic ingredient identification

### 📊 Nutrition Tracking
- Calorie counting
- Macro tracking (proteins, carbs, fats)
- Meal type categorization
- Daily summaries and trends

### 👤 User Management
- Secure registration and login
- JWT-based authentication
- Personal health profile setup
- Health metrics tracking

### 💾 Data Management
- Persistent food history
- User data isolation
- Entry deletion support
- Paginated history retrieval

---

## 🏗️ How the System Works

```
1. USER REGISTRATION/LOGIN
   ↓
   Email + Password → Bcrypt encrypted → Stored in database
   Login returns JWT token for subsequent requests
   
2. FOOD UPLOAD & ANALYSIS
   ↓
   Upload Image → Food detection → Extract nutrition data
   
3. DATA STORAGE
   ↓
   Save to food_history table with user context
   
4. TRACKING & INSIGHTS
   ↓
   Retrieve history → Calculate daily totals → Display summaries
```

---

## 📋 What You Get

### ✅ Backend Features
- User registration & login
- JWT token authentication
- Food image upload & analysis
- **Persistent user food history** (NEW)
- Daily calorie/macro summaries (NEW)
- Entry deletion (NEW)
- 12 pre-loaded foods with nutrition
- SQLite database with indexes
- CORS configured
- Error handling & validation

### ✅ Frontend Features
- Login/Register views
- Food upload interface
- Dashboard with overview
- **History viewer** (ready for API integration)
- Calorie tracking
- Health assessment
- Profile management
- All components updated (no Supabase)

### ✅ Database Features
- User accounts (bcrypt hashed passwords)
- Food history (persistent storage)
- User isolation (can only see own data)
- Indexed queries (O(log N) performance)
- Automatic creation on startup
- Foreign key relationships

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login              Get JWT token
```

### Food Analysis
```
POST   /api/analyze-food            Upload & analyze food image
```

### History & Tracking
```
GET    /api/history                 Get user's food history (paginated)
GET    /api/history/daily           Get today's nutrition summary
DELETE /api/history/<id>            Delete specific food entry
```

**Authentication:** All endpoints except `/register` and `/login` require JWT token in `Authorization: Bearer <token>` header.

---

## 🗄️ Data Model

### Users Table
```sql
id              INTEGER PRIMARY KEY
email           TEXT UNIQUE NOT NULL
password_hash   TEXT NOT NULL
created_at      TIMESTAMP
```

### Food History Table
```sql
id              INTEGER PRIMARY KEY
user_id         INTEGER FOREIGN KEY
food_name       TEXT NOT NULL
calories        INTEGER
protein         FLOAT
carbs           FLOAT
fats            FLOAT
confidence      FLOAT
ingredients     TEXT
meal_type       TEXT
created_at      TIMESTAMP
```

**Indexes:** `(user_id, created_at DESC)` for optimized queries

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **Vite** 5.4.10 - Build tool
- **TypeScript** 5.7.2 - Type safety
- **Tailwind CSS** 3.4.1 - Styling

### Backend
- **Flask** 2.3.3 - Web framework
- **Python** 3.13 - Runtime
- **Flask-JWT-Extended** 4.5.2 - JWT auth
- **Flask-CORS** 4.0.0 - Cross-origin support
- **Pillow** 12.2.0 - Image processing
- **SQLite** 3.x - Database

---

## 📁 Project Structure

```
NutriHealth/
├── backend/                    ← Flask backend
│   ├── app.py                  ← Entry point
│   ├── requirements.txt        ← Dependencies
│   ├── routes/
│   │   ├── auth.py            ← Login/Register
│   │   ├── analyze.py         ← Food analysis
│   │   └── history.py         ← Food tracking
│   ├── models/
│   │   ├── user_model.py      ← User CRUD
│   │   └── food_history_model.py
│   ├── services/              ← Business logic
│   ├── utils/                 ← Utilities
│   ├── data/
│   │   └── app.db             ← SQLite database (auto-created)
│   └── e2e_test.py            ← Test suite (6 tests)
│
├── project/                   ← React frontend

│   ├── src/                       ← Frontend source
│   │   ├── components/            ← 12 React components
│   │   ├── contexts/              ← Auth context
│   │   ├── lib/                   ← Utilities (API, storage)
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── vite.config.ts            ← Build config
│   ├── tailwind.config.js        ← Styling
│   ├── tsconfig.json             ← TypeScript config
│   ├── package.json              ← Dependencies
│   └── index.html
│
├── README.md                     ← This file
├── SETUP_GUIDE.md               ← Environment setup
├── SYSTEM_ARCHITECTURE.md       ← Technical deep dive
├── DEPLOYMENT_GUIDE.md          ← Production deployment
└── .gitignore                   ← Git configuration
```

---

## 🔒 Security Features

✅ **Password Security** - Bcrypt hashing (10 rounds)  
✅ **Authentication** - JWT tokens with 1-hour expiration  
✅ **Authorization** - Per-user data isolation enforced  
✅ **Input Validation** - File types, sizes, and formats checked  
✅ **SQL Security** - Parameterized queries (no SQL injection)  
✅ **CORS** - Configured for localhost development  
✅ **Image Processing** - Validated, resized, metadata removed  

---

## 🧪 Testing

### Run E2E Test Suite

```bash
cd backend
python e2e_test.py
```

The test suite covers:
- ✅ User registration
- ✅ User login
- ✅ Food image analysis
- ✅ History retrieval
- ✅ Daily summary
- ✅ Entry deletion

Expected: All 6 tests pass in ~5 seconds

### Manual Testing

To manually test an endpoint with curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9 or higher
- Node.js 18+ and npm
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Server starts on http://localhost:5000

### Frontend Setup

```bash
# Navigate to frontend
cd project

# Install dependencies
npm install

# Start development server
npm run dev
```

App opens on http://localhost:5173

---

## 🌍 Environment Variables

Create a `.env` file in the `backend/` directory:

```
FLASK_ENV=development
JWT_SECRET_KEY=your-secret-key-here
```




## 🎯 Features Breakdown
### ✅ Frontend Components
- **Login** - Email/password authentication
- **Register** - New user account creation
- **Dashboard** - Home overview and quick stats
- **UploadFood** - Image capture and food analysis
- **HistoryView** - Food entry history with pagination
- **CalorieTracker** - Daily calorie monitoring
- **Recommendations** - Personalized health insights
- **HealthAssessment** - Health metrics evaluation
- **HealthProfileSetup/View** - User health data management

### ✅ Backend Routes
- **Authentication** - Register, login, JWT validation
- **Food Analysis** - Image upload, AI detection, nutrition extraction
- **History Management** - Create, read, delete food entries
- **Daily Summary** - Aggregate nutrition metrics

### ✅ Database Features
- User account management with password hashing
- Persistent food history with user isolation
- Indexed queries for performance (O(log N))
- Automatic schema creation on startup
- Foreign key relationships for data integrity

