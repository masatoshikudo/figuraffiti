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
