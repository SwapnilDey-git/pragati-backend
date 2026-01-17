# Pragati Backend - Supabase Quick Start

## What Changed?

Your Pragati backend has been migrated from MongoDB to **Supabase (PostgreSQL)** for better performance, reliability, and features.

## Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Name it `Pragati`, choose a region, select **Free** tier
4. Wait 2-3 minutes for setup

### 2. Set Up Database

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Enable **PostGIS** extension
3. Go to **SQL Editor** → **New query**
4. Copy and run the SQL from `supabase/schema.sql`
5. Create another query and run the SQL from `supabase/functions.sql`

### 3. Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

### 4. Update Your .env File

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
NODE_ENV=development
```

### 5. Start Your Server

```bash
npm start
```

You should see:
```
Server is running on port 3001
Using Supabase PostgreSQL database
```

✅ **Done!** Your backend is now using Supabase.

## Test It

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "userType": "worker"}'
```

Check Supabase **Table Editor** → **users** to see your data!

## For Production

1. Set environment variables on your deployment platform:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

2. Add your frontend URL to `server.js`:
   ```javascript
   const allowedOrigins = [
     "http://localhost:3000",
     "https://your-app.vercel.app", // Add this
   ];
   ```

## Need More Help?

See detailed guide: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

## What You Get with Supabase

- ✅ **Free Tier**: 500MB database, 50K monthly users
- ✅ **PostGIS**: Powerful geospatial queries
- ✅ **Real-time**: Built-in subscriptions
- ✅ **Dashboard**: Easy data management
- ✅ **Reliable**: Production-ready PostgreSQL
