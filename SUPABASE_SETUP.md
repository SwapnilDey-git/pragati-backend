# Supabase Setup Guide for Pragati Backend

This guide will walk you through setting up Supabase (PostgreSQL) for the Pragati application.

## Prerequisites

- Node.js and npm installed
- Pragati backend code (already migrated to Supabase)

## Step 1: Create Supabase Account and Project

### 1.1 Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub, Google, or email

### 1.2 Create a New Project

1. Click **New Project**
2. Fill in the details:
   - **Name**: `Pragati`
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
   - **Pricing Plan**: Select **Free** tier
3. Click **Create new project**
4. Wait 2-3 minutes for project setup to complete

## Step 2: Set Up Database Schema

### 2.1 Enable PostGIS Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for `postgis`
3. Click **Enable** on the PostGIS extension
4. Wait for it to activate

### 2.2 Create Users Table

1. Go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste the contents of `supabase/schema.sql`:

```sql
-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('worker', 'contractor')),
  skill TEXT,
  location GEOGRAPHY(POINT, 4326),
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial queries
CREATE INDEX idx_users_location ON users USING GIST(location);

-- Index for common queries
CREATE INDEX idx_users_checked_in ON users(checked_in);
CREATE INDEX idx_users_skill ON users(skill);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

4. Click **Run** (or press F5)
5. Verify success message appears

### 2.3 Create Geospatial Function

1. Click **New query** again
2. Copy and paste the contents of `supabase/functions.sql`:

```sql
-- Function to find nearby workers using PostGIS
CREATE OR REPLACE FUNCTION nearby_workers(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  max_distance INTEGER,
  filter_skill TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  user_type TEXT,
  skill TEXT,
  location GEOGRAPHY,
  checked_in BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.user_type,
    u.skill,
    u.location,
    u.checked_in,
    u.created_at,
    u.updated_at,
    ST_Distance(u.location, ST_MakePoint(lng, lat)::geography) as distance
  FROM users u
  WHERE u.user_type = 'worker'
    AND u.checked_in = true
    AND ST_DWithin(u.location, ST_MakePoint(lng, lat)::geography, max_distance)
    AND (filter_skill IS NULL OR u.skill = filter_skill)
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

3. Click **Run**
4. Verify success

### 2.4 Verify Database Setup

1. Go to **Table Editor** in the left sidebar
2. You should see the `users` table
3. Click on it to view the schema
4. Verify all columns are present

## Step 3: Get API Credentials

### 3.1 Find Your Project URL and API Key

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` key (this is what you need)
     - `service_role` key (keep this secret, don't use in frontend)

### 3.2 Copy Your Credentials

Copy these two values:
- **URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## Step 4: Configure Backend Application

### 4.1 Update .env File

1. Open `pragati-backend/.env`
2. Replace the placeholder values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-anon-key

# Server Configuration
PORT=3001

# Node Environment
NODE_ENV=development
```

**Example:**
```env
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg1NjE2MDAsImV4cCI6MjAwNDEzNzYwMH0.example_signature
PORT=3001
NODE_ENV=development
```

## Step 5: Test the Application

### 5.1 Start the Server

```bash
cd pragati-backend
npm start
```

### 5.2 Verify Connection

You should see:
```
Server is running on port 3001
Using Supabase PostgreSQL database
```

✅ If you see this, your Supabase connection is successful!

### 5.3 Test API Endpoints

**Test User Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Worker", "userType": "worker"}'
```

Expected response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "name": "Test Worker",
    "user_type": "worker",
    "checked_in": false,
    ...
  }
}
```

**Verify in Supabase:**
1. Go to **Table Editor** → **users**
2. You should see your test user!

## Step 6: Production Deployment

### 6.1 Environment Variables for Deployment

When deploying to platforms like Railway, Render, or Vercel, set these environment variables:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `SUPABASE_URL` | Your project URL | Project Settings → API |
| `SUPABASE_ANON_KEY` | Your anon public key | Project Settings → API |
| `PORT` | 3001 (or auto-assigned) | - |
| `NODE_ENV` | production | - |

### 6.2 Update CORS for Production

In `server.js`, add your production frontend URL:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend.vercel.app", // Add your production URL
];
```

### 6.3 Deployment Platforms

#### **Railway**
1. Create new project
2. Connect GitHub repository
3. Add environment variables in "Variables" tab
4. Deploy automatically

#### **Render**
1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

#### **Vercel** (for serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Add environment variables in Vercel dashboard

## Database Schema Reference

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | TEXT | User's name (unique) |
| `user_type` | TEXT | 'worker' or 'contractor' |
| `skill` | TEXT | Worker's skill (optional) |
| `location` | GEOGRAPHY | PostGIS point (longitude, latitude) |
| `checked_in` | BOOLEAN | Worker availability status |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time (auto-updated) |

### Indexes

- `idx_users_location` (GIST): For geospatial queries
- `idx_users_checked_in`: For filtering checked-in workers
- `idx_users_skill`: For skill-based filtering
- `idx_users_user_type`: For user type filtering

### Functions

- `nearby_workers(lat, lng, max_distance, filter_skill)`: Returns workers within specified distance, sorted by proximity

## Troubleshooting

### "Missing Supabase environment variables"

**Problem**: Server won't start
**Solution**: 
- Verify `.env` file exists in `pragati-backend/`
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Ensure no extra spaces or quotes around values

### "relation 'users' does not exist"

**Problem**: API calls fail with database error
**Solution**:
- Run the SQL from `supabase/schema.sql` in Supabase SQL Editor
- Verify table was created in Table Editor

### "function nearby_workers does not exist"

**Problem**: Location-based worker search fails
**Solution**:
- Run the SQL from `supabase/functions.sql` in Supabase SQL Editor
- Verify function exists in Database → Functions

### PostGIS Extension Not Found

**Problem**: Cannot create GEOGRAPHY columns
**Solution**:
- Go to Database → Extensions
- Enable PostGIS extension
- Re-run schema.sql

### CORS Errors in Production

**Problem**: Frontend can't connect to backend
**Solution**:
- Add your production frontend URL to `allowedOrigins` in `server.js`
- Redeploy backend

## Supabase Features You Can Use

### Real-time Subscriptions

Supabase supports real-time database changes. You can replace Socket.io with Supabase real-time:

```javascript
// Frontend example
const subscription = supabase
  .channel('workers')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Row Level Security (RLS)

Add security policies to control data access:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Storage

Upload images (profile pictures, etc.):
- Go to **Storage** in Supabase dashboard
- Create a bucket
- Use Supabase Storage API

## Monitoring and Maintenance

### Supabase Dashboard

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Database**: Manage tables, functions, triggers
- **Logs**: View database logs
- **Reports**: Monitor usage and performance

### Free Tier Limits

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB
- **Monthly Active Users**: 50,000

Perfect for development and small-scale production!

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

## Need Help?

1. Check Supabase logs in dashboard
2. Review server console output
3. Test queries in SQL Editor
4. Join [Supabase Discord](https://discord.supabase.com/)
