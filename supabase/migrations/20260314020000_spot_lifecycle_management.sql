ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_spots_visible_after ON spots(visible_after);
CREATE INDEX IF NOT EXISTS idx_spots_expires_at ON spots(expires_at);
CREATE INDEX IF NOT EXISTS idx_spots_archived_at ON spots(archived_at);

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
