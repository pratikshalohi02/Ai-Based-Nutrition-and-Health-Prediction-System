# 🚀 Deployment Guide - Vercel + Heroku

## Status: READY FOR DEPLOYMENT ✅

Your project is fully prepared for deployment with:
- ✅ Frontend built and ready for Vercel
- ✅ Backend configured for Heroku
- ✅ Environment variables ready
- ✅ Production settings applied

---

## 📋 Prerequisites

Before deploying, you need:

1. **Vercel Account** - Sign up at https://vercel.com
2. **Heroku Account** - Sign up at https://heroku.com
3. **Vercel CLI** - Install: `npm install -g vercel`
4. **Heroku CLI** - Install: https://devcenter.heroku.com/articles/heroku-cli

---

## 🎯 Step-by-Step Deployment

### PART 1: Deploy Backend to Heroku

#### Step 1.1: Create Heroku App
```bash
heroku login
heroku create <your-app-name>-api
# Example: heroku create nutrihealth-api
```

#### Step 1.2: Initialize Git (if not already done)
```bash
cd backend
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

#### Step 1.3: Set Environment Variables on Heroku
```bash
heroku config:set JWT_SECRET_KEY="your-secure-secret-key-here" --app=<your-app-name>-api
heroku config:set FLASK_ENV="production" --app=<your-app-name>-api
```

⚠️ **IMPORTANT**: Generate a strong JWT_SECRET_KEY (min 32 characters) for security!

#### Step 1.4: Deploy Backend
```bash
git push heroku main
# If your branch is 'master', use: git push heroku master
```

✅ **Verify** deployment:
```bash
heroku open --app=<your-app-name>-api
# Should show health check at /api/health
```

Your backend URL will be: `https://<your-app-name>-api.herokuapp.com`

---

### PART 2: Deploy Frontend to Vercel

#### Step 2.1: Deploy to Vercel
```bash
cd project
vercel deploy --prod
```

During the prompts:
- Link to existing project: `No`
- Set project name: `nutrihealth` (or your preferred name)
- Set directory: `./` (current directory)
- Use Vite for production build: `Yes`

#### Step 2.2: Configure Backend URL in Vercel
After deployment, you need to update the frontend to point to your Heroku backend.

**Option A: Using Vercel Environment Variables (Recommended)**
```bash
vercel env add VITE_API_URL
# Enter: https://<your-app-name>-api.herokuapp.com
```

Then redeploy:
```bash
vercel deploy --prod
```

**Option B: Modify Frontend Code (If not using env vars)**
Update [project/src/lib/api.ts](project/src/lib/api.ts):
```typescript
const API_URL = process.env.VITE_API_URL || 'https://<your-app-name>-api.herokuapp.com';
```

Then rebuild and redeploy:
```bash
cd project
npm run build
vercel deploy --prod
```

---

## ✅ Post-Deployment Verification

### Test Backend (Heroku)
```bash
curl https://<your-app-name>-api.herokuapp.com/api/health
# Expected response: {"status":"ok","service":"backend"}
```

### Test Frontend (Vercel)
Visit: `https://<your-project-name>.vercel.app`
- You should see the login page
- Try registering a new account
- Upload food images
- Check calorie tracking works

### Troubleshooting Common Issues

**Backend returns 500 errors:**
```bash
heroku logs --app=<your-app-name>-api --tail
```

**Frontend can't reach backend:**
- Check VITE_API_URL environment variable
- Ensure Heroku backend is running: check logs above
- Check CORS settings in backend

**Database errors on backend:**
- Heroku creates a new SQLite database on first run
- Data is ephemeral (resets when app restarts)
- For persistent data, upgrade to PostgreSQL add-on

---

## 🔒 Security Checklist

- [ ] Created strong JWT_SECRET_KEY (32+ characters)
- [ ] Set FLASK_ENV="production" on Heroku
- [ ] Vercel deployment is HTTPS (automatic)
- [ ] CORS is properly configured
- [ ] No sensitive data in code/environment

---

## 📊 Deployment Summary

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `https://<project>.vercel.app` |
| Backend API | Heroku | `https://<app>-api.herokuapp.com` |
| Database | SQLite (Local) | `backend/data/app.db` |

---

## 🔄 Future Updates

To update your deployment after making code changes:

**Update Backend:**
```bash
git add .
git commit -m "Update message"
git push heroku main
```

**Update Frontend:**
```bash
npm run build
vercel deploy --prod
```

---

## 💡 Optional Enhancements

### Use PostgreSQL Instead of SQLite
For persistent data in production, upgrade Heroku app:
```bash
heroku addons:create heroku-postgresql:hobby-dev --app=<your-app-name>-api
```

Then update `backend/services/db_service.py` to use PostgreSQL.

### Enable Heroku Auto-Restart
```bash
heroku dyno:restart --app=<your-app-name>-api
```

### Monitor Performance
```bash
heroku metrics --app=<your-app-name>-api
```

---

**Questions?** Check the official docs:
- Vercel: https://vercel.com/docs
- Heroku: https://devcenter.heroku.com/
