-- ============================================================
-- Figuraffiti: キャラクター用テーブル（Dashboard 用・コピペ実行）
-- 実行先: https://supabase.com/dashboard/project/tomlonlbbsczslqxpdan/sql/new
-- ============================================================

-- 1. characters テーブル
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  story TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on characters" ON characters
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert characters" ON characters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can update characters" ON characters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can delete characters" ON characters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- 2. spots に character_id 追加
ALTER TABLE spots ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES characters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_spots_character_id ON spots(character_id);

-- 3. トリガー（updated_at 自動更新）
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE PROCEDURE update_characters_updated_at();

-- 4. サンプルキャラ「パイロット」
INSERT INTO characters (slug, name, story)
VALUES (
  'pilot',
  'パイロット',
  '都市の余白に現れた最初の一体。あなたがこのページを見ているということは、どこかで出会ったのだ。'
)
ON CONFLICT (slug) DO NOTHING;
