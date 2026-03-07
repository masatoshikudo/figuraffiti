-- admin_usersテーブルにDiscord user IDを追加
-- Discord Bot + インタラクションで管理者を識別するため

-- discord_user_idカラムの追加
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS discord_user_id TEXT;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_admin_users_discord_user_id ON admin_users(discord_user_id);

-- コメント
COMMENT ON COLUMN admin_users.discord_user_id IS 'DiscordユーザーID。Discord Bot + インタラクションで管理者を識別するために使用。';

