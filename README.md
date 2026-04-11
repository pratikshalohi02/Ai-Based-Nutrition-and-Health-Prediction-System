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

For production, use a strong secret key (32+ characters).

---

## 📈 Performance Metrics

| Operation | Time | Scale |
|-----------|------|-------|
| User Registration | <100ms | Bcrypt hashing  |
| User Login | <100ms | Token generation |
| Food Analysis | <500ms | Image processing |
| Fetch History | <50ms | 100 items (indexed) |
| Daily Summary | <30ms | DB aggregation |
| Delete Entry | <50ms | Direct operation |

---

## 🐛 Troubleshooting

**Issue: Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r backend/requirements.txt

# Try running with debug
python -u backend/app.py
```

**Issue: Frontend can't connect to backend**
```bash
# Verify backend is running on port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Check CORS configuration in backend/app.py
# Frontend should be http://localhost:5173
```

**Issue: Database errors**
```bash
# Reset database (deletes all data!)
rm backend/data/app.db
# Backend will recreate on next run
python backend/app.py
```

**Issue: JWT token expired**
```bash
# Clear browser localStorage
# Log in again to get new token
```

---

## 📚 Additional Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed environment setup |
| [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) | Technical architecture & data flow |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment instructions |

Recommended reading order: SETUP_GUIDE → SYSTEM_ARCHITECTURE → DEPLOYMENT_GUIDE

---

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

---

## 🚢 Deployment

### Quick Deploy Options

**Backend:**
- ✅ Heroku (with PostgreSQL)
- ✅ Railway.app
- ✅ Render
- ✅ AWS EC2

**Frontend:**
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📖 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io/) - JWT information

---

## ✨ Project Highlights

🔹 **Full-Stack Implementation** - React + Flask + SQLite  
🔹 **Type-Safe Frontend** - TypeScript for code reliability  
🔹 **Secure Authentication** - JWT + Bcrypt  
🔹 **Persistent Storage** - SQLite with proper schema  
🔹 **Image Processing** - Pillow for food image analysis  
🔹 **RESTful API** - Clean endpoint design  
🔹 **Test Coverage** - E2E tests for critical flows  
🔹 **Production Ready** - Error handling, validation, security  

---

## 📝 License

This project is available for educational and portfolio purposes.

---

## 💡 Contributing

This is a portfolio project. For improvements or bug reports, create an issue or submit a pull request.

---

## 📞 Support

For issues or questions:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
3. See troubleshooting section above

---

**Built with ❤️ for nutrition tracking and health insights**
- **JWT Guide:** https://jwt.io/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 📞 Support

**Where to find answers:**

| Question | Location |
|----------|----------|
| How do I start? | QUICKSTART.md |
| How does it work? | SYSTEM_ARCHITECTURE.md |
| How do I deploy? | SYSTEM_ARCHITECTURE.md → Production |
| What API endpoints exist? | BACKEND_VERIFICATION_GUIDE.md → API Summary |
| How do I test manually? | BACKEND_VERIFICATION_GUIDE.md → Manual Testing |
| What changed from Supabase? | MIGRATION_SUMMARY.md |
| How do I troubleshoot? | BACKEND_VERIFICATION_GUIDE.md → Troubleshooting |

---

## ✨ Features at a Glance

- ✅ User authentication (register/login)
- ✅ Food image upload
- ✅ Nutritional analysis
- ✅ Persistent user history
- ✅ Daily calorie tracking
- ✅ Macronutrient breakdown
- ✅ Entry deletion
- ✅ Pagination support
- ✅ JWT security
- ✅ SQLite persistence
- ✅ CORS configured
- ✅ Error handling
- ✅ Input validation
- ✅ Image processing

---

## 🎓 Learning Path

**New to the project?**

1. **Skim QUICKSTART.md** (5 min) - Get it running
2. **Read SYSTEM_ARCHITECTURE.md** (15 min) - Understand design
3. **Review BACKEND_VERIFICATION_GUIDE.md** (10 min) - Learn API
4. **Explore code:**
   - `backend/app.py` - Flask entry point
   - `backend/routes/` - Endpoint implementations
   - `src/components/` - React components

---

## 📝 License

This project is provided as-is for educational and development purposes.

---

## 🎉 You're Ready!

Everything is set up and ready to go.

**Next action:**
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Start backend: `cd backend && python app.py`
3. Start frontend: `npm run dev`
4. Run tests: `cd backend && python e2e_test.py`

**Questions?** Check the documentation files above.

**Happy coding!** 🚀
