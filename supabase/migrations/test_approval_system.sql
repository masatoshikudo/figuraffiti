-- 承認制システムのマイグレーションテスト
-- このSQLを実行して、マイグレーションが正しく動作するか確認してください

-- 1. カラムが正しく追加されているか確認
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'spots' 
  AND column_name IN ('status', 'submitted_by', 'approved_by', 'approved_at', 'rejection_reason')
ORDER BY column_name;

-- 2. インデックスが作成されているか確認
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'spots' 
  AND indexname IN ('idx_spots_status', 'idx_spots_submitted_by', 'idx_spots_approved_by');

-- 3. テーブルが作成されているか確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admin_users', 'trusted_users');

-- 4. RLSポリシーが正しく設定されているか確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('spots', 'spot_media', 'admin_users', 'trusted_users')
ORDER BY tablename, policyname;

-- 5. 既存のスポットが承認済みになっているか確認
SELECT 
  status,
  COUNT(*) as count
FROM spots
GROUP BY status;

-- 6. チェック制約が正しく設定されているか確認
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'spots'::regclass
  AND conname LIKE '%status%';

