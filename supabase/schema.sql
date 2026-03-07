-- Supabaseデータベーススキーマ（記録主役のミニマム設計版）
-- このSQLをSupabaseのSQL Editorで実行してください
-- 既存のデータも現在の登録内容に合わせて更新されます

-- ============================================
-- 1. spotsテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  -- 基本情報（記録主役のミニマム設計）
  spot_name TEXT NOT NULL DEFAULT '', -- 空文字も許可（後で追加可能）
  trick TEXT, -- 技名（必須項目）
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  -- オプション情報（後から追加可能）
  skater TEXT, -- スケーター名（任意）
  year INTEGER, -- 年（任意）
  prefecture TEXT, -- 都道府県（任意、逆ジオコーディングで自動設定可能）
  address TEXT, -- 住所（逆ジオコーディングで取得、任意）
  -- 承認制関連
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 後方互換性のため残す（使用しない）
  title TEXT,
  credit TEXT,
  note TEXT,
  tags TEXT[]
);

-- ============================================
-- 2. spot_mediaテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS spot_media (
  id SERIAL PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cover', 'video')), -- 'article'は削除
  source TEXT NOT NULL CHECK (source IN ('Instagram', 'YouTube', 'Twitter', 'X', 'Threads', 'TikTok', 'Other')),
  url TEXT NOT NULL,
  thumb_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. インデックス
-- ============================================

-- 位置情報検索用（既存スポット検索で使用）
CREATE INDEX IF NOT EXISTS idx_spots_lat_lng ON spots(lat, lng);

-- 承認制関連
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_submitted_by ON spots(submitted_by);
CREATE INDEX IF NOT EXISTS idx_spots_approved_by ON spots(approved_by);

-- 検索・フィルタリング用
CREATE INDEX IF NOT EXISTS idx_spots_prefecture ON spots(prefecture);
CREATE INDEX IF NOT EXISTS idx_spots_year ON spots(year);
CREATE INDEX IF NOT EXISTS idx_spot_media_spot_id ON spot_media(spot_id);

-- ============================================
-- 4. 管理者・信頼ユーザーテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS trusted_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT
);

-- ============================================
-- 5. Row Level Security (RLS) の設定
-- ============================================

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. spotsテーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow public read access on approved spots" ON spots;
DROP POLICY IF EXISTS "Users can view their own submissions" ON spots;
DROP POLICY IF EXISTS "Allow authenticated users to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow trusted users to submit approved spots" ON spots;
DROP POLICY IF EXISTS "Admins can select all spots" ON spots;
DROP POLICY IF EXISTS "Admins can update all spots" ON spots;
DROP POLICY IF EXISTS "Admins can delete all spots" ON spots;

-- 公開: 承認済みのスポットのみ閲覧可能
CREATE POLICY "Allow public read access on approved spots" ON spots
  FOR SELECT USING (
    status = 'approved' OR status IS NULL -- 既存データ（statusがNULL）も表示
  );

-- 認証済みユーザー: 自分の投稿を全ステータスで閲覧可能
CREATE POLICY "Users can view their own submissions" ON spots
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    submitted_by IS NOT NULL AND
    submitted_by = auth.uid()
  );

-- 投稿: 認証済みユーザーのみ投稿可能（status=pendingで作成）
CREATE POLICY "Allow authenticated users to submit spots" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    status = 'pending' AND
    submitted_by = auth.uid()
  );

-- 信頼ユーザー: 自動承認で投稿可能
CREATE POLICY "Allow trusted users to submit approved spots" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM trusted_users 
      WHERE user_id = auth.uid()
    ) AND
    status = 'approved'
  );

-- 管理者: すべてのスポットを閲覧・更新・削除可能
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

-- ============================================
-- 7. spot_mediaテーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow public read access on approved spot media" ON spot_media;
DROP POLICY IF EXISTS "Users can view media of their own submissions" ON spot_media;
DROP POLICY IF EXISTS "Allow authenticated users to insert media" ON spot_media;
DROP POLICY IF EXISTS "Admins can select all spot media" ON spot_media;
DROP POLICY IF EXISTS "Admins can update all spot media" ON spot_media;
DROP POLICY IF EXISTS "Admins can delete all spot media" ON spot_media;

-- 公開: 承認済みスポットのメディアのみ閲覧可能
CREATE POLICY "Allow public read access on approved spot media" ON spot_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND (spots.status = 'approved' OR spots.status IS NULL)
    )
  );

-- 認証済みユーザー: 自分の投稿のメディアを閲覧可能
CREATE POLICY "Users can view media of their own submissions" ON spot_media
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND spots.submitted_by IS NOT NULL
      AND spots.submitted_by = auth.uid()
    )
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

-- 管理者: すべてのメディアを管理可能
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

-- ============================================
-- 8. admin_usersテーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Admins can view their own admin status" ON admin_users;

CREATE POLICY "Admins can view their own admin status" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 9. trusted_usersテーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own trusted status" ON trusted_users;

CREATE POLICY "Users can view their own trusted status" ON trusted_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 10. トリガー: updated_atの自動更新
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spots_updated_at ON spots;
CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
