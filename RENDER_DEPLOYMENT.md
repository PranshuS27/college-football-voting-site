# Render Fullstack Deployment Guide

This guide will help you deploy your College Football Voting App to Render as a fullstack application.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing your app

### 2. Configure the Web Service

Use these settings:

- **Name**: `college-football-voting-app`
- **Environment**: `Python`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: 
  ```
  cd frontend && npm install && npm run build
  cd .. && pip install -r backend/requirements.txt
  ```
- **Start Command**: `python app.py`

### 3. Environment Variables

Add these environment variables in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `PYTHON_VERSION` | `3.11.0` | Python version |
| `SECRET_KEY` | `Generate` | Click "Generate" for a secure key |
| `DATABASE_URL` | `From Database` | Will be set automatically |
| `NEXT_PUBLIC_API_URL` | `https://your-app-name.onrender.com` | Your app's URL |
| `PORT` | `10000` | Port for the app |

### 4. Create the Database

1. In Render Dashboard, click "New +" and select "PostgreSQL"
2. Name it `college-football-voting-db`
3. Choose the free plan
4. Select the same region as your web service
5. Click "Create Database"

### 5. Link Database to Web Service

1. Go back to your web service
2. In the "Environment" section, find `DATABASE_URL`
3. Click "Link" and select your database
4. Render will automatically set the connection string

### 6. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. The first build may take 5-10 minutes

## Configuration Files

### render.yaml (Optional)

If you prefer using the `render.yaml` file:

1. Make sure your `render.yaml` is in the root of your repository
2. Render will automatically detect and use it
3. You can skip the manual configuration steps above

### app.py

The main application file that serves both the Flask backend and Next.js frontend.

## Post-Deployment

### 1. Initialize Database

After deployment, you need to initialize your database:

1. Go to your web service in Render
2. Click on "Shell" tab
3. Run these commands:

```bash
cd backend
python seed_teams.py
```

### 2. Test Your App

1. Visit your app URL (e.g., `https://college-football-voting-app.onrender.com`)
2. Test registration and login
3. Test voting functionality
4. Check all pages work correctly

### 3. Custom Domain (Optional)

1. In your web service settings, go to "Settings" tab
2. Click "Add Custom Domain"
3. Follow the DNS configuration instructions

## Troubleshooting

### Build Failures

- Check the build logs in Render
- Ensure all dependencies are in `requirements.txt`
- Verify Node.js and Python versions are correct

### Database Connection Issues

- Verify the `DATABASE_URL` is set correctly
- Check if the database is in the same region
- Ensure the database is running

### Frontend Not Loading

- Check if the frontend build completed successfully
- Verify the static files are being served correctly
- Check browser console for errors

### API Errors

- Verify CORS settings in `app.py`
- Check if all API routes are working
- Ensure environment variables are set correctly

## Monitoring

### Logs

- View real-time logs in the "Logs" tab
- Check for errors and warnings
- Monitor performance

### Metrics

- Monitor CPU and memory usage
- Check response times
- Watch for any performance issues

## Scaling

### Free Tier Limitations

- 750 hours per month
- Sleeps after 15 minutes of inactivity
- Limited CPU and memory

### Upgrading

- Consider upgrading to paid plans for production
- Better performance and reliability
- No sleep mode

## Security

### Environment Variables

- Never commit secrets to your repository
- Use Render's environment variable system
- Generate strong SECRET_KEY values

### Database Security

- Use Render's managed PostgreSQL
- Automatic backups and updates
- Secure connection strings

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

## Cost Optimization

### Free Tier Tips

- Use sleep mode for development
- Optimize build times
- Minimize dependencies

### Production Considerations

- Monitor usage and costs
- Use appropriate instance sizes
- Consider CDN for static assets 