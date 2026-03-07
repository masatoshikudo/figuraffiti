-- ============================================
-- user_profilesテーブルの作成
-- ユーザーのスケーターレベルを管理
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_level INTEGER NOT NULL DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
  -- レベル設定方法を記録
  level_set_by TEXT NOT NULL CHECK (level_set_by IN ('questionnaire', 'auto_detected', 'manual')),
  -- 自動判定の場合、どのスケーター名で判定したかを記録
  detected_skater_name TEXT,
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skill_level ON user_profiles(skill_level);

-- RLSを有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
-- 1. すべてのユーザーが自分のプロフィールを読み取り可能
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
CREATE POLICY "Users can read their own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. すべてのユーザーが自分のプロフィールを更新可能
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. すべてのユーザーが自分のプロフィールを挿入可能
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. 管理者はすべてのプロフィールを読み取り可能（将来的に必要になる可能性がある）
-- 現時点では実装しない（必要になったら追加）

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

