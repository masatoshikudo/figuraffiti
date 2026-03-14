-- ============================================
-- AhhHum Phase1 最小スキーマ
-- 新規プロジェクト用。Supabase SQL Editor で実行。
-- ============================================

-- ============================================
-- 1. spots（最小）
-- ============================================
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
  expires_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  archive_reason TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spots ADD COLUMN IF NOT EXISTS display_lat DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS display_lng DOUBLE PRECISION;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS visible_after TIMESTAMP WITH TIME ZONE;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS archive_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_spots_lat_lng ON spots(lat, lng);
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_last_seen ON spots(last_seen);
CREATE INDEX IF NOT EXISTS idx_spots_spot_number ON spots(spot_number);
CREATE INDEX IF NOT EXISTS idx_spots_visible_after ON spots(visible_after);
CREATE INDEX IF NOT EXISTS idx_spots_expires_at ON spots(expires_at);
CREATE INDEX IF NOT EXISTS idx_spots_archived_at ON spots(archived_at);

-- spot_number 採番（既存データ用）
DO $$
DECLARE
  r RECORD;
  n INTEGER := 1;
BEGIN
  FOR r IN (SELECT id FROM spots WHERE (status = 'approved' OR status IS NULL) ORDER BY created_at ASC)
  LOOP
    UPDATE spots SET spot_number = n WHERE id = r.id;
    n := n + 1;
  END LOOP;
END $$;

-- ============================================
-- 2. discovery_logs（ティッカー用）
-- ============================================
CREATE TABLE IF NOT EXISTS discovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_logs_spot_id ON discovery_logs(spot_id);
CREATE INDEX IF NOT EXISTS idx_discovery_logs_discovered_at ON discovery_logs(discovered_at DESC);

CREATE TABLE IF NOT EXISTS exploration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exploration_sessions_spot_id ON exploration_sessions(spot_id);
CREATE INDEX IF NOT EXISTS idx_exploration_sessions_user_id ON exploration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exploration_sessions_started_at ON exploration_sessions(started_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exploration_sessions_active_user
  ON exploration_sessions(user_id)
  WHERE ended_at IS NULL;

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

-- ============================================
-- 3. admin_users（管理者用・承認に必要）
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. user_profiles（ティッカー表示名用）
-- ============================================
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

-- ============================================
-- 5. RLS
-- ============================================
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_create_submissions ENABLE ROW LEVEL SECURITY;

-- spots: 承認済みは誰でも読める、自分の申請は本人のみ
DROP POLICY IF EXISTS "Allow public read access on spots" ON spots;
DROP POLICY IF EXISTS "Allow public read access on approved spots" ON spots;
DROP POLICY IF EXISTS "Users can view their own submissions" ON spots;
DROP POLICY IF EXISTS "Allow authenticated users to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow trusted users to submit approved spots" ON spots;
DROP POLICY IF EXISTS "Admins can select all spots" ON spots;
DROP POLICY IF EXISTS "Admins can update all spots" ON spots;
DROP POLICY IF EXISTS "Admins can delete all spots" ON spots;
DROP POLICY IF EXISTS "Read approved spots" ON spots;
DROP POLICY IF EXISTS "Users see own submissions" ON spots;
DROP POLICY IF EXISTS "Authenticated insert pending" ON spots;
DROP POLICY IF EXISTS "Admins full access" ON spots;

CREATE POLICY "Read approved spots" ON spots
  FOR SELECT USING (status = 'approved' OR status IS NULL);

CREATE POLICY "Users see own submissions" ON spots
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'approved' OR
      (submitted_by = auth.uid())
    )
  );

CREATE POLICY "Authenticated insert pending" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    status = 'pending' AND
    submitted_by = auth.uid()
  );

CREATE POLICY "Admins full access" ON spots
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- discovery_logs
DROP POLICY IF EXISTS "Allow public read discovery logs" ON discovery_logs;
DROP POLICY IF EXISTS "Authenticated users can insert discovery logs" ON discovery_logs;
DROP POLICY IF EXISTS "Read discovery logs" ON discovery_logs;
DROP POLICY IF EXISTS "Insert own discovery" ON discovery_logs;

CREATE POLICY "Read discovery logs" ON discovery_logs
  FOR SELECT USING (true);

CREATE POLICY "Insert own discovery" ON discovery_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- exploration_sessions
DROP POLICY IF EXISTS "Read exploration sessions" ON exploration_sessions;
DROP POLICY IF EXISTS "Users manage own exploration sessions" ON exploration_sessions;

CREATE POLICY "Read exploration sessions" ON exploration_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users manage own exploration sessions" ON exploration_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- nfc_tags
DROP POLICY IF EXISTS "Admins full access nfc_tags" ON nfc_tags;

CREATE POLICY "Admins full access nfc_tags" ON nfc_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE OR REPLACE FUNCTION start_exploration_session(p_spot_id TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, exploration_id UUID, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_expires_at TIMESTAMP WITH TIME ZONE := NOW() + INTERVAL '30 minutes';
  v_inserted_id UUID;
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

  UPDATE exploration_sessions
  SET ended_at = NOW()
  WHERE user_id = v_user_id
    AND ended_at IS NULL;

  INSERT INTO exploration_sessions (spot_id, user_id, expires_at)
  VALUES (p_spot_id, v_user_id, v_expires_at)
  RETURNING id INTO v_inserted_id;

  RETURN QUERY
  SELECT TRUE, '探索を開始しました', v_inserted_id, v_expires_at;
END;
$$;

REVOKE ALL ON FUNCTION start_exploration_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION start_exploration_session(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION record_discovery(p_spot_id TEXT)
RETURNS TABLE(success BOOLEAN, duplicate BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM spots
    WHERE id = p_spot_id
      AND status = 'approved'
      AND archived_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  ) THEN
    RAISE EXCEPTION 'SPOT_NOT_FOUND';
  END IF;

  INSERT INTO discovery_logs (spot_id, user_id)
  VALUES (p_spot_id, v_user_id);

  UPDATE exploration_sessions
  SET ended_at = NOW()
  WHERE user_id = v_user_id
    AND ended_at IS NULL;

  UPDATE spots
  SET
    last_seen = NOW(),
    archived_at = NOW(),
    archive_reason = 'discovered'
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
  v_existing_spot_id TEXT;
BEGIN
  SELECT spot_id
  INTO v_existing_spot_id
  FROM nfc_tags
  WHERE token = p_token
  LIMIT 1;

  IF v_existing_spot_id IS NULL THEN
    RAISE EXCEPTION 'NFC_TAG_NOT_FOUND';
  END IF;

  UPDATE nfc_tags
  SET is_active = false
  WHERE token = p_token
    AND is_active = true
  RETURNING spot_id INTO v_spot_id;

  IF v_spot_id IS NULL THEN
    RAISE EXCEPTION 'NFC_TAG_ALREADY_USED';
  END IF;

  RETURN QUERY
  SELECT rd.success, rd.duplicate, rd.message, v_spot_id
  FROM record_discovery(v_spot_id) AS rd;
END;
$$;

REVOKE ALL ON FUNCTION record_discovery_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_discovery_by_token(TEXT) TO authenticated;

-- admin_users
DROP POLICY IF EXISTS "Admins can view their own admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins see self" ON admin_users;
CREATE POLICY "Admins see self" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- user_profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;

CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

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

-- ============================================
-- 6. トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spots_updated_at ON spots;
CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_co_create_submissions_updated_at ON co_create_submissions;
CREATE TRIGGER update_co_create_submissions_updated_at
  BEFORE UPDATE ON co_create_submissions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
