-- ============================================
-- ダミーデータ削除SQL
-- 開発環境・本番環境共通で使用可能
-- Supabase DashboardのSQL Editorから実行してください
-- ============================================

-- 注意: このSQLを実行すると、すべてのダミーデータが削除されます
-- 実行前に必ず確認してください

-- 1. メディアデータを削除（外部キー制約のため、先に削除）
DELETE FROM spot_media 
WHERE spot_id LIKE 'test-%' 
   OR spot_id LIKE 'hotspot-%' 
   OR spot_id LIKE 'update-demo-%' 
   OR spot_id LIKE 'dummy-%';

-- 2. スポットデータを削除
DELETE FROM spots 
WHERE id LIKE 'test-%' 
   OR id LIKE 'hotspot-%' 
   OR id LIKE 'update-demo-%' 
   OR id LIKE 'dummy-%';

-- ============================================
-- 確認用クエリ（削除後に実行して確認）
-- ============================================

-- 削除されたか確認（結果が0件であれば削除成功）
SELECT 
  COUNT(*) as remaining_dummy_spots
FROM spots
WHERE id LIKE 'test-%' 
   OR id LIKE 'hotspot-%' 
   OR id LIKE 'update-demo-%' 
   OR id LIKE 'dummy-%';

-- 削除されたメディアデータの確認（結果が0件であれば削除成功）
SELECT 
  COUNT(*) as remaining_dummy_media
FROM spot_media
WHERE spot_id LIKE 'test-%' 
   OR spot_id LIKE 'hotspot-%' 
   OR spot_id LIKE 'update-demo-%' 
   OR spot_id LIKE 'dummy-%';

