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
