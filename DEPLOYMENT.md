# 🚀 Free Deployment Guide

This guide will help you deploy your College Football Voting app for **completely free** using Vercel (frontend) and Render (backend) with either Supabase or Render PostgreSQL.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Supabase account (free) - Optional but recommended

## 🎯 Deployment Strategy

### **Option 1: Supabase Database (Recommended)**
- **Frontend**: Vercel (Next.js optimized, always free)
- **Backend**: Render (Python Flask, free tier with sleep)
- **Database**: Supabase (PostgreSQL, free tier, better features)

### **Option 2: Render Database**
- **Frontend**: Vercel (Next.js optimized, always free)
- **Backend**: Render (Python Flask, free tier with sleep)
- **Database**: Render PostgreSQL (included in free tier)

## 🛠️ Step 1: Prepare Your Repository

1. **Push your code to GitHub** if you haven't already
2. **Ensure all files are committed** including the new configuration files

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"

### 2.2 Import Your Repository
1. Select your GitHub repository
2. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 2.3 Set Environment Variables
Add this environment variable:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://your-render-app-name.onrender.com` (you'll get this after deploying backend)

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## 🔧 Step 3: Deploy Backend to Render

### 3.1 Sign Up for Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"

### 3.2 Connect Your Repository
1. Select your GitHub repository
2. Configure the service:
   - **Name**: `college-football-voting-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python run.py`
   - **Plan**: Free

### 3.3 Add Environment Variables
Add these environment variables:
- **SECRET_KEY**: Generate a random string (e.g., `your-secret-key-here`)

## 🗄️ Step 4: Set Up Database

### **Option A: Supabase Database (Recommended)**

#### 4.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for the project to be set up (2-3 minutes)

#### 4.2 Get Database Connection String
1. Go to Settings → Database
2. Copy the **Connection string** (URI format)
3. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

#### 4.3 Add to Render Environment Variables
1. Go back to your Render backend service
2. Add environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Supabase connection string

#### 4.4 Set Up Database Schema
1. Go to Supabase SQL Editor
2. Run this SQL to create your tables:

```sql
-- Create teams table
CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS vote (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    week INTEGER NOT NULL,
    team_id INTEGER REFERENCES team(id),
    rank INTEGER NOT NULL,
    UNIQUE(user_id, week, team_id)
);

-- Add some sample teams
INSERT INTO team (name) VALUES 
('Alabama'), ('Georgia'), ('Ohio State'), ('Michigan'), ('USC'),
('Texas'), ('Oklahoma'), ('Florida'), ('LSU'), ('Clemson'),
('Notre Dame'), ('Penn State'), ('Oregon'), ('Washington'), ('Utah'),
('Tennessee'), ('Kentucky'), ('Mississippi State'), ('Auburn'), ('Arkansas'),
('Missouri'), ('South Carolina'), ('Vanderbilt'), ('Texas A&M'), ('Ole Miss')
ON CONFLICT (name) DO NOTHING;
```

### **Option B: Render PostgreSQL Database**

#### 4.1 Create PostgreSQL Database
1. In Render, go to "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `college-football-voting-db`
   - **Database**: `football_votes`
   - **User**: `football_user`
   - **Plan**: Free
3. Copy the **Internal Database URL** and add it as `DATABASE_URL` environment variable

#### 4.2 Set Up Database Schema
1. Connect to your Render PostgreSQL database
2. Run the same SQL schema as above

## 🔗 Step 5: Connect Frontend to Backend

### 5.1 Update Vercel Environment Variable
1. Go back to your Vercel project
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Render backend URL:
   ```
   https://your-render-app-name.onrender.com
   ```

### 5.2 Update CORS Settings
1. In your Render backend, go to the deployed service
2. Copy the URL
3. Update `backend/run.py` with your Vercel domain in the CORS origins
4. Redeploy the backend

## 🌐 Step 6: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://your-app.vercel.app`)
2. **Test registration** and login
3. **Test voting** functionality
4. **Check leaderboard** and history pages

## ⚙️ Important Notes

### Render Free Tier Limitations
- **Sleep after inactivity**: Your backend will sleep after 15 minutes of inactivity
- **Wake up time**: First request after sleep may take 30-60 seconds
- **Monthly hours**: 750 hours/month (usually sufficient for small apps)

### Supabase Free Tier Benefits
- **Always running**: No sleep/wake issues
- **Real-time subscriptions**: Live updates
- **Built-in auth**: User management
- **Edge functions**: Serverless functions
- **Storage**: File uploads
- **50,000 monthly active users**

### Vercel Free Tier Benefits
- **Always running**: No sleep/wake issues
- **Global CDN**: Fast loading worldwide
- **Automatic deployments**: Deploys on every Git push

## 🔧 Troubleshooting

### Backend Not Responding
1. Check Render logs for errors
2. Ensure environment variables are set correctly
3. Verify the database connection

### Database Connection Issues
1. **Supabase**: Check connection string format
2. **Render**: Verify internal database URL
3. **Both**: Ensure database schema is created

### CORS Errors
1. Update CORS origins in `backend/run.py`
2. Redeploy the backend
3. Clear browser cache

## 📈 Scaling (When You Need It)

### Upgrade Options
- **Render**: $7/month for always-on backend
- **Vercel Pro**: $20/month for more features
- **Supabase Pro**: $25/month for more features
- **Custom Domain**: $12/year for your own domain

### Performance Tips
- Use Supabase caching for frequently accessed data
- Optimize database queries
- Consider CDN for static assets

## 🎉 Success!

Your College Football Voting app is now live and completely free! 

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`
- **Database**: Supabase (recommended) or Render PostgreSQL

Share your app with friends and start voting on college football rankings! 🏈 