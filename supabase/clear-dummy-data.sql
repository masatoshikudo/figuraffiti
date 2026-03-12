-- 開発用ダミーデータの削除
-- Supabase SQL Editor で実行

DELETE FROM discovery_logs WHERE spot_id LIKE 'test-%' OR spot_id LIKE 'hotspot-%';
DELETE FROM spots WHERE id LIKE 'test-%' OR id LIKE 'hotspot-%';
