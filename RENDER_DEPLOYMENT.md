# Render Deployment Guide - Two Service Architecture

This guide will help you deploy your College Football Voting App to Render using a two-service architecture (separate frontend and backend).

## Architecture Overview

- **Backend Service**: Flask API running on Python
- **Frontend Service**: Next.js app running on Node.js
- **Database**: PostgreSQL managed by Render

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Blueprint"
3. Connect your Git repository
4. Select the repository containing your app

### 2. Automatic Configuration

Render will automatically detect and use your `render.yaml` file, which configures:

#### Backend Service (`college-football-backend`)
- **Environment**: Python
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Health Check**: `/health` endpoint

#### Frontend Service (`college-football-frontend`)
- **Environment**: Node.js
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **API URL**: Points to backend service

#### Database (`college-football-voting-db`)
- **Type**: PostgreSQL
- **Plan**: Free tier
- **Auto-linked**: To backend service

### 3. Environment Variables

The `render.yaml` automatically sets:

| Service | Variable | Value | Description |
|---------|----------|-------|-------------|
| Backend | `PYTHON_VERSION` | `3.11.0` | Python version |
| Backend | `SECRET_KEY` | `Generate` | Auto-generated secure key |
| Backend | `DATABASE_URL` | `From Database` | Auto-linked from database |
| Frontend | `NODE_VERSION` | `20.0.0` | Node.js version |
| Frontend | `NEXT_PUBLIC_API_URL` | `https://college-football-backend.onrender.com` | Backend API URL |

### 4. Deploy

1. Click "Create Blueprint Instance"
2. Render will automatically:
   - Create both services
   - Create the database
   - Link everything together
   - Deploy both services

## Service URLs

After deployment, you'll have:

- **Frontend**: `https://college-football-frontend.onrender.com`
- **Backend API**: `https://college-football-backend.onrender.com`
- **Database**: Managed by Render (no direct access needed)

## Post-Deployment

### 1. Initialize Database

After deployment, initialize your database:

1. Go to your backend service in Render
2. Click on "Shell" tab
3. Run these commands:

```bash
cd backend
python seed_teams.py
```

### 2. Test Your App

1. Visit your frontend URL: `https://college-football-frontend.onrender.com`
2. Test registration and login
3. Test voting functionality
4. Check all pages work correctly

### 3. Custom Domain (Optional)

You can set up custom domains for either service:

1. **Frontend**: `www.yourdomain.com`
2. **Backend**: `api.yourdomain.com`

## Architecture Benefits

### ✅ **Why Two Services?**

1. **Proper Separation**: Frontend and backend are independent
2. **Next.js Support**: Full Next.js features (SSR, API routes, etc.)
3. **Scalability**: Can scale frontend and backend independently
4. **Technology-Specific**: Each service uses its optimal runtime
5. **Render Best Practices**: Follows Render's recommended architecture

### 🔧 **How It Works**

1. **Frontend**: Next.js serves the React app
2. **Backend**: Flask serves the API
3. **Communication**: Frontend calls backend via `NEXT_PUBLIC_API_URL`
4. **Database**: Shared between services via environment variables

## Troubleshooting

### Build Failures

- **Backend**: Check Python dependencies in `backend/requirements.txt`
- **Frontend**: Check Node.js dependencies in `frontend/package.json`

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Ensure both services are running

### Database Issues

- Verify database is created and linked
- Check `DATABASE_URL` environment variable
- Run database initialization script

## Monitoring

### Logs

- **Backend Logs**: View in backend service dashboard
- **Frontend Logs**: View in frontend service dashboard

### Health Checks

- **Backend**: `https://college-football-backend.onrender.com/health`
- **Frontend**: Automatic health checks by Render

## Cost Optimization

### Free Tier Usage

- **Backend**: 750 hours/month
- **Frontend**: 750 hours/month
- **Database**: Free tier included

### Scaling

- Upgrade individual services as needed
- Monitor usage in Render dashboard
- Consider custom domains for production

## Security

### Environment Variables

- All secrets managed by Render
- No hardcoded credentials
- Secure database connections

### CORS Configuration

- Backend configured to allow frontend domain
- Secure cookie settings
- Proper authentication flow

## Support

- [Render Documentation](https://render.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/) 