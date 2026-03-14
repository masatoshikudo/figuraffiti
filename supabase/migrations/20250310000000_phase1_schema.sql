-- AhhHum Phase1 最小スキーマ
-- supabase db reset で実行される。手動の場合は run-full-schema.sql を使用。

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  spot_name TEXT NOT NULL DEFAULT '',
  context TEXT,
  prefecture TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  display_lat DOUBLE PRECISION,
  display_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  spot_number INTEGER,
  visible_after TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spots ADD COLUMN IF NOT EXISTS display_lat DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS display_lng DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS visible_after TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_spots_lat_lng ON spots(lat, lng);
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_last_seen ON spots(last_seen);
CREATE INDEX IF NOT EXISTS idx_spots_spot_number ON spots(spot_number);

CREATE TABLE IF NOT EXISTS discovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_logs_spot_id ON discovery_logs(spot_id);
CREATE INDEX IF NOT EXISTS idx_discovery_logs_discovered_at ON discovery_logs(discovered_at DESC);

CREATE TABLE IF NOT EXISTS nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfc_tags_token ON nfc_tags(token);
CREATE INDEX IF NOT EXISTS idx_nfc_tags_spot_id ON nfc_tags(spot_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE TABLE IF NOT EXISTS co_create_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  intent_text TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'cover' CHECK (media_type IN ('cover', 'video')),
  media_source TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comment TEXT,
  linked_spot_id TEXT REFERENCES spots(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_co_create_submissions_status ON co_create_submissions(status);
CREATE INDEX IF NOT EXISTS idx_co_create_submissions_submitted_by ON co_create_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_co_create_submissions_created_at ON co_create_submissions(created_at DESC);

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_create_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on spots" ON spots;
DROP POLICY IF EXISTS "Allow public read access on approved spots" ON spots;
DROP POLICY IF EXISTS "Users can view their own submissions" ON spots;
DROP POLICY IF EXISTS "Allow authenticated users to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow trusted users to submit approved spots" ON spots;
DROP POLICY IF EXISTS "Admins can select all spots" ON spots;
DROP POLICY IF EXISTS "Admins can update all spots" ON spots;
DROP POLICY IF EXISTS "Admins can delete all spots" ON spots;

CREATE POLICY "Read approved spots" ON spots FOR SELECT USING (status = 'approved' OR status IS NULL);
CREATE POLICY "Users see own submissions" ON spots FOR SELECT USING (
  auth.uid() IS NOT NULL AND (status = 'approved' OR (submitted_by = auth.uid()))
);
CREATE POLICY "Authenticated insert pending" ON spots FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND status = 'pending' AND submitted_by = auth.uid()
);
CREATE POLICY "Admins full access" ON spots FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow public read discovery logs" ON discovery_logs;
DROP POLICY IF EXISTS "Authenticated users can insert discovery logs" ON discovery_logs;
CREATE POLICY "Read discovery logs" ON discovery_logs FOR SELECT USING (true);
CREATE POLICY "Insert own discovery" ON discovery_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins full access nfc_tags" ON nfc_tags;
CREATE POLICY "Admins full access nfc_tags" ON nfc_tags FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION record_discovery(p_spot_id TEXT)
RETURNS TABLE(success BOOLEAN, duplicate BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_has_recent_log BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM spots
    WHERE id = p_spot_id
      AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'SPOT_NOT_FOUND';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM discovery_logs
    WHERE spot_id = p_spot_id
      AND user_id = v_user_id
      AND discovered_at >= NOW() - INTERVAL '5 minutes'
  )
  INTO v_has_recent_log;

  IF v_has_recent_log THEN
    RETURN QUERY SELECT TRUE, TRUE, '発見を記録しました';
    RETURN;
  END IF;

  INSERT INTO discovery_logs (spot_id, user_id)
  VALUES (p_spot_id, v_user_id);

  UPDATE spots
  SET last_seen = NOW()
  WHERE id = p_spot_id;

  RETURN QUERY SELECT TRUE, FALSE, '発見を記録しました';
END;
$$;

REVOKE ALL ON FUNCTION record_discovery(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_discovery(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION record_discovery_by_token(p_token TEXT)
RETURNS TABLE(success BOOLEAN, duplicate BOOLEAN, message TEXT, spot_id TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_spot_id TEXT;
BEGIN
  SELECT nfc_tags.spot_id
  INTO v_spot_id
  FROM nfc_tags
  WHERE token = p_token
    AND is_active = true
  LIMIT 1;

  IF v_spot_id IS NULL THEN
    RAISE EXCEPTION 'NFC_TAG_NOT_FOUND';
  END IF;

  RETURN QUERY
  SELECT rd.success, rd.duplicate, rd.message, v_spot_id
  FROM record_discovery(v_spot_id) AS rd;
END;
$$;

REVOKE ALL ON FUNCTION record_discovery_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_discovery_by_token(TEXT) TO authenticated;

DROP POLICY IF EXISTS "Admins can view their own admin status" ON admin_users;
CREATE POLICY "Admins see self" ON admin_users FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own co-create submissions" ON co_create_submissions;
DROP POLICY IF EXISTS "Users insert own co-create submissions" ON co_create_submissions;
DROP POLICY IF EXISTS "Admins full access co-create" ON co_create_submissions;

CREATE POLICY "Users view own co-create submissions" ON co_create_submissions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      submitted_by = auth.uid() OR
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users insert own co-create submissions" ON co_create_submissions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    submitted_by = auth.uid() AND
    status = 'pending'
  );

CREATE POLICY "Admins full access co-create" ON co_create_submissions
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spots_updated_at ON spots;
CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
DROP TRIGGER IF EXISTS update_co_create_submissions_updated_at ON co_create_submissions;
CREATE TRIGGER update_co_create_submissions_updated_at BEFORE UPDATE ON co_create_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- spot_number 採番
DO $$
DECLARE r RECORD; n INTEGER := 1;
BEGIN
  FOR r IN (SELECT id FROM spots WHERE (status = 'approved' OR status IS NULL) ORDER BY created_at ASC)
  LOOP
    UPDATE spots SET spot_number = n WHERE id = r.id;
    n := n + 1;
  END LOOP;
END $$;
