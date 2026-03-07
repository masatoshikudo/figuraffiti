# admin_usersテーブルにdiscord_user_idカラムを追加

## エラー内容

```
column admin_users.discord_user_id does not exist
エラーコード: 42703
```

## 原因

`admin_users`テーブルに`discord_user_id`カラムが存在しないため、DiscordユーザーIDで管理者を検索できません。

## 解決方法

Supabase SQL Editorで以下を実行してください：

```sql
-- admin_usersテーブルにdiscord_user_idカラムを追加
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS discord_user_id TEXT;

-- インデックスを作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_admin_users_discord_user_id 
ON admin_users(discord_user_id);

-- コメントを追加
COMMENT ON COLUMN admin_users.discord_user_id IS 'DiscordユーザーID。Discord Bot + インタラクションで管理者を識別するために使用。';
```

## 確認方法

マイグレーション実行後、以下で確認：

```sql
-- admin_usersテーブルのカラム一覧を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;
```

`discord_user_id`カラムが表示されれば成功です。

## 次のステップ

1. マイグレーションを実行
2. 管理者のDiscordユーザーIDを設定：

```sql
-- 管理者のDiscordユーザーIDを設定
-- YOUR_DISCORD_USER_ID をDiscordで取得したユーザーIDに置き換え
-- YOUR_SUPABASE_USER_ID を自分のSupabaseユーザーIDに置き換え
UPDATE admin_users
SET discord_user_id = 'YOUR_DISCORD_USER_ID'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

3. Discordで承認ボタンを再度試す

## DiscordユーザーIDの取得方法

1. Discordで開発者モードを有効にする（設定 → 詳細設定 → 開発者モード）
2. 自分のユーザー名を右クリック
3. **IDをコピー** を選択

## トラブルシューティング

### マイグレーションが失敗する

- `admin_users`テーブルが存在するか確認
- 既に`discord_user_id`カラムが存在する場合は、`IF NOT EXISTS`によりエラーは発生しません

### カラムが追加されてもエラーが続く

- Supabaseのスキーマキャッシュをリフレッシュ：
  ```sql
  NOTIFY pgrst, 'reload schema';
  ```
- または、Supabaseダッシュボード → **API** → **Reload schema** をクリック

