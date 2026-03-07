-- 記録主役のミニマム設計に合わせたスキーマ更新
-- このSQLをSupabaseのSQL Editorで実行してください
-- 既存のデータも現在の登録内容に合わせて更新されます

-- ============================================
-- 1. spotsテーブルの更新
-- ============================================

-- 既存のテーブルが存在しない場合は作成
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 既存のテーブルがある場合のカラム追加・変更
DO $$ 
BEGIN
  -- spot_nameをNOT NULLに変更（既存データは空文字に更新）
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'spot_name' AND is_nullable = 'YES') THEN
    UPDATE spots SET spot_name = '' WHERE spot_name IS NULL;
    ALTER TABLE spots ALTER COLUMN spot_name SET NOT NULL;
    ALTER TABLE spots ALTER COLUMN spot_name SET DEFAULT '';
  END IF;
  
  -- addressカラムの追加（逆ジオコーディング用）
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'address') THEN
    ALTER TABLE spots ADD COLUMN address TEXT;
  END IF;
  
  -- 承認制関連のカラム追加（既に存在する場合はスキップ）
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
  
  -- updated_atカラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spots' AND column_name = 'updated_at') THEN
    ALTER TABLE spots ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- 不要なカラムの削除（credit, note, tags, titleは残すが、使用しない）
  -- 既存データとの互換性のため、削除は行わない
END $$;

-- 既存のスポットを承認済みとしてマーク（statusがNULLの場合）
UPDATE spots SET status = 'approved' WHERE status IS NULL;

-- 既存のスポットのspot_nameがNULLの場合は空文字に更新
UPDATE spots SET spot_name = '' WHERE spot_name IS NULL;

-- ============================================
-- 2. spot_mediaテーブルの更新
-- ============================================

-- 既存のテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS spot_media (
  id SERIAL PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cover', 'video')), -- 'article'を削除
  source TEXT NOT NULL CHECK (source IN ('Thrasher', 'KAWA', 'Transworld', 'Instagram', 'YouTube', 'Twitter', 'X', 'Threads', 'Other')),
  url TEXT NOT NULL,
  thumb_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 既存のテーブルがある場合の制約更新
DO $$
BEGIN
  -- typeのCHECK制約を更新（'article'を削除）
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'spot_media_type_check' 
    AND table_name = 'spot_media'
  ) THEN
    ALTER TABLE spot_media DROP CONSTRAINT spot_media_type_check;
    ALTER TABLE spot_media ADD CONSTRAINT spot_media_type_check CHECK (type IN ('cover', 'video'));
    -- 既存の'article'タイプを'cover'に変更
    UPDATE spot_media SET type = 'cover' WHERE type = 'article';
  END IF;
END $$;

-- ============================================
-- 3. インデックスの作成・更新
-- ============================================

-- 位置情報検索用のインデックス（既存スポット検索で使用）
CREATE INDEX IF NOT EXISTS idx_spots_lat_lng ON spots(lat, lng);

-- 承認制関連のインデックス
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_spots_submitted_by ON spots(submitted_by);
CREATE INDEX IF NOT EXISTS idx_spots_approved_by ON spots(approved_by);

-- 既存のインデックス（検索・フィルタリング用）
CREATE INDEX IF NOT EXISTS idx_spots_prefecture ON spots(prefecture);
CREATE INDEX IF NOT EXISTS idx_spots_year ON spots(year);
CREATE INDEX IF NOT EXISTS idx_spot_media_spot_id ON spot_media(spot_id);

-- ============================================
-- 4. 管理者・信頼ユーザーテーブル
-- ============================================

-- 管理者テーブル
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT
);

-- 信頼ユーザーテーブル
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

-- RLSを有効化
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_users ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（再作成のため）
DROP POLICY IF EXISTS "Allow public read access on spots" ON spots;
DROP POLICY IF EXISTS "Allow public read access on approved spots" ON spots;
DROP POLICY IF EXISTS "Users can view their own submissions" ON spots;
DROP POLICY IF EXISTS "Allow public to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow trusted users to submit approved spots" ON spots;
DROP POLICY IF EXISTS "Admins can select all spots" ON spots;
DROP POLICY IF EXISTS "Admins can update all spots" ON spots;
DROP POLICY IF EXISTS "Admins can delete all spots" ON spots;
DROP POLICY IF EXISTS "Allow public update on spots" ON spots;
DROP POLICY IF EXISTS "Allow public delete on spots" ON spots;

DROP POLICY IF EXISTS "Allow public read access on spot_media" ON spot_media;
DROP POLICY IF EXISTS "Allow public read access on approved spot media" ON spot_media;
DROP POLICY IF EXISTS "Users can view media of their own submissions" ON spot_media;
DROP POLICY IF EXISTS "Allow public to insert media" ON spot_media;
DROP POLICY IF EXISTS "Admins can select all spot media" ON spot_media;
DROP POLICY IF EXISTS "Admins can update all spot media" ON spot_media;
DROP POLICY IF EXISTS "Admins can delete all spot media" ON spot_media;
DROP POLICY IF EXISTS "Allow public update on spot_media" ON spot_media;
DROP POLICY IF EXISTS "Allow public delete on spot_media" ON spot_media;

DROP POLICY IF EXISTS "Admins can view their own admin status" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own trusted status" ON trusted_users;

-- ============================================
-- 6. spotsテーブルのRLSポリシー
-- ============================================

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

-- 管理者は自分自身の情報を閲覧可能
CREATE POLICY "Admins can view their own admin status" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者はすべての管理者情報を閲覧可能（サービスロールキーを使用するため、RLSは最小限）

-- ============================================
-- 9. trusted_usersテーブルのRLSポリシー
-- ============================================

-- ユーザーは自分自身の信頼ユーザー情報を閲覧可能
CREATE POLICY "Users can view their own trusted status" ON trusted_users
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者はすべての信頼ユーザー情報を閲覧可能（サービスロールキーを使用するため、RLSは最小限）

-- ============================================
-- 10. トリガー: updated_atの自動更新
-- ============================================

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- spotsテーブルのupdated_atを自動更新するトリガー
DROP TRIGGER IF EXISTS update_spots_updated_at ON spots;
CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. 既存データの更新（記録主役のミニマム設計に合わせる）
-- ============================================

-- spot_nameがNULLまたは空の場合は、trick名または"スポット名なし"を設定
UPDATE spots 
SET spot_name = COALESCE(NULLIF(spot_name, ''), trick, 'スポット名なし')
WHERE spot_name IS NULL OR spot_name = '';

-- 既存のスポットでstatusがNULLの場合は'approved'に設定（既存データは承認済みとして扱う）
UPDATE spots 
SET status = 'approved' 
WHERE status IS NULL;

-- 既存のメディアでtypeが'article'の場合は'cover'に変更
UPDATE spot_media 
SET type = 'cover' 
WHERE type = 'article';

-- ============================================
-- 12. コメント（ドキュメント）
-- ============================================

COMMENT ON TABLE spots IS '記録主役のミニマム設計に合わせたスポットテーブル。最小限の情報（場所、技名、メディアURL）で記録を残す。';
COMMENT ON COLUMN spots.spot_name IS 'スポット名（空文字も許可、後で追加可能）';
COMMENT ON COLUMN spots.trick IS '技名（必須項目）';
COMMENT ON COLUMN spots.status IS '承認ステータス: pending（承認待ち）、approved（承認済み）、rejected（却下）';
COMMENT ON COLUMN spots.submitted_by IS '投稿者（匿名投稿の場合はNULL）';
COMMENT ON COLUMN spots.approved_by IS '承認者（管理者）';
COMMENT ON COLUMN spots.address IS '住所（逆ジオコーディングで自動取得、任意）';

COMMENT ON TABLE spot_media IS 'スポットのメディア（動画・写真）情報。記録主役のミニマム設計では1つのメディアURLのみ。';
COMMENT ON COLUMN spot_media.type IS 'メディアタイプ: cover（写真）、video（動画）';

