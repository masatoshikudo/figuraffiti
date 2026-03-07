-- Figuraffiti: キャラクター（QR/NFCの飛び先）用テーブル
-- 1体のフィギュア = 1キャラクター。発見ログは spots.character_id で紐づく

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

-- 公開: 全員がキャラクターを閲覧可能
CREATE POLICY "Allow public read access on characters" ON characters
  FOR SELECT USING (true);

-- 管理者のみ挿入・更新・削除（admin_users が存在する場合）
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

-- spots に character_id を追加（任意: このキャラの設置場所 or 発見報告）
ALTER TABLE spots ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES characters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_spots_character_id ON spots(character_id);

-- updated_at トリガー
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

-- フェーズ1用: サンプルキャラクター1体（QR/NFCの飛び先として使用）
INSERT INTO characters (slug, name, story)
VALUES (
  'pilot',
  'パイロット',
  '都市の余白に現れた最初の一体。あなたがこのページを見ているということは、どこかで出会ったのだ。'
)
ON CONFLICT (slug) DO NOTHING;
