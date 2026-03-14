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

ALTER TABLE exploration_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read exploration sessions" ON exploration_sessions;
DROP POLICY IF EXISTS "Users manage own exploration sessions" ON exploration_sessions;

CREATE POLICY "Read exploration sessions" ON exploration_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users manage own exploration sessions" ON exploration_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

  UPDATE exploration_sessions
  SET ended_at = NOW()
  WHERE user_id = v_user_id
    AND ended_at IS NULL;

  UPDATE spots
  SET last_seen = NOW()
  WHERE id = p_spot_id;

  RETURN QUERY SELECT TRUE, FALSE, '発見を記録しました';
END;
$$;

REVOKE ALL ON FUNCTION record_discovery(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_discovery(TEXT) TO authenticated;
