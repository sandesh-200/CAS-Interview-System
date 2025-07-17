# CAS Interview System - Render Deployment Guide

This guide will help you deploy both the backend Flask API and frontend React app on Render.

## Prerequisites

1. A Render account (free tier available)
2. Your Gemini API key
3. Git repository with your code

## Step 1: Prepare Your Repository

### Backend Files (Root Directory)
- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `config.py` - Configuration settings
- `routes.py` - API routes
- `session_manager.py` - Session management
- `speech_service.py` - Speech recognition service
- `ai_service.py` - AI analysis service
- `Procfile` - For Render deployment
- `render.yaml` - Render service configuration

### Frontend Files (client/ directory)
- `package.json` - Node.js dependencies
- `src/` - React source code
- `public/` - Static assets

## Step 2: Environment Variables

You'll need to set these environment variables in Render:

### Backend Environment Variables
- `GEMINI_API_KEY` - Your Gemini API key
- `FLASK_ENV` - Set to "production"
- `PORT` - Will be set automatically by Render

### Frontend Environment Variables
- `REACT_APP_API_URL` - Your backend URL (e.g., https://your-backend-name.onrender.com)

## Step 3: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Set your environment variables:
   - `GEMINI_API_KEY` (for backend)
7. Click "Apply" to deploy both services

### Option B: Manual Deployment

#### Deploy Backend
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cas-interview-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add environment variables:
   - `GEMINI_API_KEY`: Your API key
   - `FLASK_ENV`: `production`
6. Click "Create Web Service"

#### Deploy Frontend
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cas-interview-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
5. Add environment variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://cas-interview-backend.onrender.com`)
6. Click "Create Static Site"

## Step 4: Update Frontend API URL

After your backend is deployed, update the frontend environment variable:

1. Go to your frontend service in Render
2. Go to "Environment" tab
3. Update `REACT_APP_API_URL` with your backend URL
4. Redeploy the frontend

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Test the interview flow
3. Check that audio recording works
4. Verify AI analysis is working

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check logs in Render dashboard
   - Verify `GEMINI_API_KEY` is set
   - Ensure all dependencies are in `requirements.txt`

2. **Frontend can't connect to backend**
   - Verify `REACT_APP_API_URL` is correct
   - Check CORS settings in backend
   - Ensure backend is running

3. **Audio recording issues**
   - Check browser permissions
   - Verify HTTPS is enabled (required for microphone access)

4. **Speech recognition not working**
   - Check if `faster-whisper` is properly installed
   - Verify audio file format is supported
   - Check backend logs for errors

### Logs and Debugging

- Backend logs: Available in Render dashboard under your backend service
- Frontend logs: Check browser console
- Network requests: Use browser developer tools

## File Structure

```
cas_protoo/
├── app.py                 # Main Flask app
├── requirements.txt       # Python dependencies
├── config.py             # Configuration
├── routes.py             # API routes
├── session_manager.py    # Session management
├── speech_service.py     # Speech recognition
├── ai_service.py         # AI analysis
├── Procfile             # Render deployment
├── render.yaml          # Render services config
├── .env                 # Local environment (not deployed)
├── client/              # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   ├── config.js    # API configuration
│   │   └── components/
│   └── public/
└── uploads/             # Audio uploads (not deployed)
```

## Environment Variables Reference

### Backend (.env file for local development)
```
GEMINI_API_KEY=your_api_key_here
```

### Backend (Render environment variables)
```
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=production
PORT=10000 (auto-set by Render)
```

### Frontend (Render environment variables)
```
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

## Security Notes

1. Never commit your `.env` file to Git
2. Use environment variables for sensitive data
3. Enable HTTPS in production
4. Consider rate limiting for API endpoints
5. Validate file uploads and user inputs

## Performance Optimization

1. Use CDN for static assets
2. Enable compression in Render
3. Optimize audio file sizes
4. Consider caching for frequently accessed data
5. Monitor resource usage in Render dashboard

## Cost Considerations

- Render free tier includes:
  - 750 hours/month for web services
  - Static sites are always free
  - Automatic sleep after 15 minutes of inactivity
- Consider upgrading for production use
- Monitor usage in Render dashboard 