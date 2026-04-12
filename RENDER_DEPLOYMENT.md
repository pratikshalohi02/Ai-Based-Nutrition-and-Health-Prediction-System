# NutriHealth - Deployment on Render

## Overview
NutriHealth is a full-stack application with separate backend (Flask) and frontend (React) services. Both can be deployed on Render.

---

## Prerequisites
- GitHub account with repository pushed
- Render account (render.com)
- Git configured with correct identity

---

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Commit render.yaml to your repository**
   ```bash
   git add render.yaml project/.env.local
   git commit -m "add: render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect and parse render.yaml automatically

3. **Set Environment Variables**
   - Render will show the services from render.yaml
   - For backend service, add secret variable:
     - Key: `JWT_SECRET_KEY`
     - Value: (generate strong random key 32+ chars)
   - Deploy!

---

### Option 2: Manual Deployment (Step-by-step)

#### Part A: Deploy Backend

1. **Create Python Web Service**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Backend Service**
   - Name: `nutrihealth-backend`
   - Runtime: `Python 3.9`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && gunicorn app:app`
   - Instance Type: Free or Paid

3. **Add Environment Variables**
   - `FLASK_ENV`: `production`
   - `JWT_SECRET_KEY`: (strong random key, 32+ chars)
   - Render automatically provides `PORT`

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Wait for deployment to complete (5-10 minutes)
   - Note the backend URL: `https://nutrihealth-backend.onrender.com`

#### Part B: Deploy Frontend

1. **Create Static Site**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**
   - Name: `nutrihealth-frontend`
   - Build Command: `cd project && npm install && npm run build`
   - Publish Directory: `project/dist`

3. **Add Environment Variables**
   - `VITE_API_URL`: `https://nutrihealth-backend.onrender.com`

4. **Deploy**
   - Click "Create Static Site"
   - Render will build and deploy (2-5 minutes)
   - Your site is live at the provided URL

---

## After Deployment

### Verify Backend
```bash
# Check health endpoint
curl https://nutrihealth-backend.onrender.com/api/health

# Should respond with:
# {"status":"ok","service":"backend"}
```

### Test Full Application
1. Go to your frontend URL
2. Register a new account
3. Login
4. Try uploading a food image
5. Check if data persists

### View Logs
- Backend: Render Dashboard → nurtihealth-backend → Logs
- Frontend: Render Dashboard → nutrihealth-frontend → Logs

---

## Environment Variables Reference

### Backend (.env on Render)
```
FLASK_ENV=production
JWT_SECRET_KEY=<strong-random-key>
PORT=<automatically set>
```

### Frontend (.env in render.yaml)
```
VITE_API_URL=https://nutrihealth-backend.onrender.com
```

---

## Troubleshooting

### Backend won't start
- Check logs: Render Dashboard → Backend service → Logs
- Ensure `gunicorn` is in requirements.txt
- Check `start command` is correct: `cd backend && gunicorn app:app`

### Frontend can't reach backend
- Verify `VITE_API_URL` is correct backend URL
- Ensure CORS is enabled in Flask (it is by default)
- Check browser Network tab for 404/500 errors

### Database issues
- Backend uses SQLite (auto-created)
- First request auto-initializes database
- Check logs if initialization fails

### Free tier limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes 30 seconds
- For production, upgrade to paid plan

---

## File Structure in Repository

```
NutriHealth/
├── backend/
│   ├── app.py                    ← Entry point
│   ├── requirements.txt          ← Dependencies
│   ├── Procfile                  ← Deployment config
│   ├── .env.example              ← Env template
│   └── ...
├── project/                      ← Frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.local               ← Dev environment
│   └── dist/                     ← Build output (after npm run build)
├── render.yaml                   ← Render deployment config
└── README.md
```

---

## Production Checklist

- [x] Flask app configured for production (`host="0.0.0.0"`)
- [x] gunicorn added to requirements.txt
- [x] Procfile configured
- [x] CORS enabled
- [x] Frontend uses environment variables for API URL
- [x] JWT_SECRET_KEY is set (not hardcoded)
- [x] Database auto-initializes on first run
- [x] Health endpoint available for monitoring
- [x] render.yaml configured

---

## Useful Links

- Render Docs: https://render.com/docs
- Flask Deployment: https://render.com/docs/deploy-flask
- Static Sites: https://render.com/docs/static-sites
- Environment Variables: https://render.com/docs/environment-variables

---

## Support

For deployment issues:
1. Check Render logs in dashboard
2. Review DEPLOYMENT_GUIDE.md for more details
3. Check SETUP_GUIDE.md for local setup verification
