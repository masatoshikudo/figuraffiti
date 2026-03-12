-- ============================================
-- AhhHum Phase1 開発用シードデータ
-- 実行: Supabase SQL Editor または npx supabase db reset
-- ============================================

-- ダミーサークル（1件・マップ中央付近で確認しやすい）
INSERT INTO spots (
  id, spot_name, context, prefecture, lat, lng, status, last_seen, spot_number, cover_url, created_at
) VALUES
  ('dummy-circle-1', 'ダミーサークル', 'かつて川だった場所', '東京都', 35.6595, 139.7034, 'approved', NOW(), 1, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  context = EXCLUDED.context,
  prefecture = EXCLUDED.prefecture,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  status = EXCLUDED.status,
  last_seen = EXCLUDED.last_seen,
  spot_number = EXCLUDED.spot_number;

-- ダミーNFCタグ（dummy-circle-1 に紐づく）
INSERT INTO nfc_tags (
  token, spot_id, is_active, note
) VALUES (
  'dummy-circle-1-nfc',
  'dummy-circle-1',
  true,
  '開発用ダミーNFCタグ'
)
ON CONFLICT (token) DO UPDATE SET
  spot_id = EXCLUDED.spot_id,
  is_active = EXCLUDED.is_active,
  note = EXCLUDED.note;
