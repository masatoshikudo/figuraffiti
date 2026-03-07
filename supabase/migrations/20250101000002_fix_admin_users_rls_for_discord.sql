-- admin_usersテーブルのRLSポリシーを修正
-- Discord Interaction Endpointからアクセスできるようにする

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow admins to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow public to read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role to read admin_users" ON admin_users;

-- admin_usersテーブルのRLSを有効化
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーがadmin_usersテーブルを読み取れるようにする
-- （discord_user_idで検索するため、公開読み取りが必要）
CREATE POLICY "Allow public to read admin_users"
ON admin_users
FOR SELECT
USING (true);

-- 管理者のみがadmin_usersテーブルを更新できるようにする
CREATE POLICY "Allow admins to update admin_users"
ON admin_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  )
);

-- 管理者のみがadmin_usersテーブルに挿入できるようにする
CREATE POLICY "Allow admins to insert admin_users"
ON admin_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  )
);

