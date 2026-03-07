-- 承認制システムのマイグレーション
-- このSQLをSupabaseのSQL Editorで実行してください

-- spotsテーブルに承認関連のカラムを追加
-- 注意: PostgreSQLではIF NOT EXISTSはALTER TABLE ADD COLUMNでサポートされていないため、
-- 各カラムを個別に追加します（既に存在する場合はエラーになりますが、無視してください）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'status') THEN
    ALTER TABLE spots ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'submitted_by') THEN
    ALTER TABLE spots ADD COLUMN submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'approved_by') THEN
    ALTER TABLE spots ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'approved_at') THEN
    ALTER TABLE spots ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'rejection_reason') THEN
    ALTER TABLE spots ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_submitted_by ON spots(submitted_by);
CREATE INDEX IF NOT EXISTS idx_spots_approved_by ON spots(approved_by);

-- 既存のスポットをすべて承認済みとしてマーク（後方互換性のため）
UPDATE spots SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 管理者を管理するテーブル
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT
);

-- admin_usersテーブルのRLSを有効化
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 管理者は自分自身の情報を閲覧可能
CREATE POLICY "Admins can view their own admin status" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者のみがadmin_usersテーブルを管理可能（サービスロールキーを使用）

-- 信頼できるユーザーを管理するテーブル
CREATE TABLE IF NOT EXISTS trusted_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT
);

-- trusted_usersテーブルのRLSを有効化
ALTER TABLE trusted_users ENABLE ROW LEVEL SECURITY;

-- 信頼できるユーザーは自分自身の情報を閲覧可能
CREATE POLICY "Users can view their own trusted status" ON trusted_users
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者のみがtrusted_usersテーブルを管理可能（サービスロールキーを使用）

-- RLSポリシーの更新: 承認済みのスポットのみ公開表示
DROP POLICY IF EXISTS "Allow public read access on spots" ON spots;
CREATE POLICY "Allow public read access on approved spots" ON spots
  FOR SELECT USING (status = 'approved');

-- 認証済みユーザーは自分の投稿を閲覧可能
CREATE POLICY "Users can view their own submissions" ON spots
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'approved' OR 
      submitted_by = auth.uid()
    )
  );

-- 投稿時のポリシー: 誰でも投稿可能（認証不要、status=pendingで作成）
DROP POLICY IF EXISTS "Allow public insert on spots" ON spots;
CREATE POLICY "Allow public to submit spots" ON spots
  FOR INSERT WITH CHECK (status = 'pending');

-- 信頼できるユーザーは自動承認で投稿可能
CREATE POLICY "Allow trusted users to submit approved spots" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM trusted_users 
      WHERE user_id = auth.uid()
    ) AND
    status = 'approved'
  );

-- 管理者はすべてのスポットを閲覧・更新・削除可能
CREATE POLICY "Admins can select all spots" ON spots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all spots" ON spots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete all spots" ON spots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- spot_mediaテーブルのRLSポリシーも更新
DROP POLICY IF EXISTS "Allow public read access on spot_media" ON spot_media;
CREATE POLICY "Allow public read access on approved spot media" ON spot_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND spots.status = 'approved'
    )
  );

-- 認証済みユーザーは自分の投稿のメディアを閲覧可能
CREATE POLICY "Users can view media of their own submissions" ON spot_media
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND (
        spots.status = 'approved' OR 
        spots.submitted_by = auth.uid()
      )
    )
  );

-- メディアの挿入ポリシー（スポットの投稿と同時に作成される）
DROP POLICY IF EXISTS "Allow public insert on spot_media" ON spot_media;
CREATE POLICY "Allow public to insert media" ON spot_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND (
        spots.status = 'pending' OR
        (spots.status = 'approved' AND 
         auth.uid() IS NOT NULL AND
         EXISTS (
           SELECT 1 FROM trusted_users 
           WHERE user_id = auth.uid()
         ))
      )
    )
  );

-- 管理者はすべてのメディアを管理可能
CREATE POLICY "Admins can select all spot media" ON spot_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all spot media" ON spot_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete all spot media" ON spot_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

