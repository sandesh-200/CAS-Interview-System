# Quick Deployment Guide

## 🚀 Deploy to Render in 5 Minutes

### Prerequisites
- GitHub account
- Render account (free)
- Gemini API key

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy Backend (Blueprint)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Set environment variable: `GEMINI_API_KEY`
5. Click "Apply"

### Step 3: Deploy Frontend (Manual)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `cas-interview-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
5. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://cas-interview-backend.onrender.com`)
6. Click "Create Static Site"

### Step 4: Test
Visit your frontend URL and test the interview flow!

## 📁 Files Created for Deployment

- `render.yaml` - Backend blueprint configuration
- `Procfile` - Backend startup command
- `requirements.txt` - Updated with gunicorn
- `client/src/config.js` - API URL configuration
- `.gitignore` - Excludes sensitive files
- `DEPLOYMENT.md` - Detailed guide

## 🔧 Environment Variables

### Backend (Render)
```
GEMINI_API_KEY=your_api_key
FLASK_ENV=production
```

### Frontend (Render)
```
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

## 🐛 Troubleshooting

1. **Backend won't start:** Check logs, verify API key
2. **Frontend can't connect:** Verify API URL is correct
3. **Audio not working:** Ensure HTTPS (required for microphone)
4. **Speech recognition fails:** Check backend logs for errors

## 📞 Support

- Check `DEPLOYMENT.md` for detailed instructions
- Render logs are available in dashboard
- Browser console for frontend debugging

## 🎯 Next Steps

1. Test all features thoroughly
2. Set up custom domain (optional)
3. Monitor usage in Render dashboard
4. Consider upgrading for production use 