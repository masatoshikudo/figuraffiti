-- 投稿を認証必須にするマイグレーション
-- このSQLをSupabaseのSQL Editorで実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow public to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow authenticated users to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow public to insert media" ON spot_media;
DROP POLICY IF EXISTS "Allow authenticated users to insert media" ON spot_media;

-- 投稿: 認証済みユーザーのみ投稿可能（status=pendingで作成）
CREATE POLICY "Allow authenticated users to submit spots" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    status = 'pending' AND
    submitted_by = auth.uid()
  );

-- メディアの挿入: 認証済みユーザーがスポットの投稿と同時に作成される
CREATE POLICY "Allow authenticated users to insert media" ON spot_media
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND spots.submitted_by = auth.uid()
      AND (
        spots.status = 'pending' OR
        (spots.status = 'approved' AND 
         EXISTS (
           SELECT 1 FROM trusted_users 
           WHERE user_id = auth.uid()
         ))
      )
    )
  );

