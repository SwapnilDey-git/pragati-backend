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
