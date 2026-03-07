-- Supabaseデータベーススキーマ
-- このSQLをSupabaseのSQL Editorで実行してください

-- spotsテーブル
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  title TEXT, -- Phase 1-1では任意（後方互換性のため）
  skater TEXT, -- Phase 1-1では任意（後方互換性のため）
  trick TEXT, -- Phase 1-1では任意（後方互換性のため）
  spot_name TEXT NOT NULL,
  prefecture TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  year INTEGER,
  credit TEXT,
  note TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- mediaテーブル（スポットと1対多の関係）
CREATE TABLE IF NOT EXISTS spot_media (
  id SERIAL PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cover', 'article', 'video')),
  source TEXT NOT NULL CHECK (source IN ('Thrasher', 'KAWA', 'Transworld', 'Instagram', 'YouTube', 'Twitter', 'X', 'Threads', 'Other')),
  url TEXT NOT NULL,
  thumb_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_spots_prefecture ON spots(prefecture);
CREATE INDEX IF NOT EXISTS idx_spots_year ON spots(year);
-- tagsカラムが存在する場合のみインデックスを作成
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'spots' AND column_name = 'tags'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_spots_tags ON spots USING GIN(tags);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_spot_media_spot_id ON spot_media(spot_id);

-- Row Level Security (RLS) の設定
-- すべてのユーザーが読み取り可能、書き込みは認証済みユーザーのみ（必要に応じて調整）
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_media ENABLE ROW LEVEL SECURITY;

-- ポリシー: すべてのユーザーが読み取り可能
CREATE POLICY "Allow public read access on spots" ON spots
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on spot_media" ON spot_media
  FOR SELECT USING (true);

-- ポリシー: 認証済みユーザーが書き込み可能（必要に応じて調整）
-- 現時点では、anon keyでも書き込み可能にする場合は以下のコメントを外してください
-- CREATE POLICY "Allow authenticated insert on spots" ON spots
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated insert on spot_media" ON spot_media
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 一時的にanon keyでも書き込み可能にする場合（開発用）
-- 本番環境では適切な認証を実装してください
CREATE POLICY "Allow public insert on spots" ON spots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on spot_media" ON spot_media
  FOR INSERT WITH CHECK (true);

-- 既存のテーブルがある場合のマイグレーション（オプション）
-- 以下のSQLを実行して、既存のテーブルを更新できます
-- ALTER TABLE spots ALTER COLUMN title DROP NOT NULL;
-- ALTER TABLE spots ALTER COLUMN skater DROP NOT NULL;
-- ALTER TABLE spots ALTER COLUMN trick DROP NOT NULL;
-- ALTER TABLE spot_media DROP CONSTRAINT IF EXISTS spot_media_source_check;
-- ALTER TABLE spot_media ADD CONSTRAINT spot_media_source_check CHECK (source IN ('Thrasher', 'KAWA', 'Transworld', 'Instagram', 'YouTube', 'Twitter', 'X', 'Threads', 'Other'));

