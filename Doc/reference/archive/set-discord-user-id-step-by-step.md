# DiscordユーザーIDの設定手順（ステップバイステップ）

## 概要

DiscordユーザーIDを`admin_users`テーブルに設定して、Discord Bot + インタラクションで管理者を識別できるようにします。

## 必要な情報

- **DiscordユーザーID**: `784181261756792852`（既に取得済み）
- **SupabaseユーザーID**: 自分のSupabaseアカウントのユーザーID（確認が必要）

## 手順

### Step 1: 自分のSupabaseユーザーIDを確認

Supabase SQL Editorで以下を実行：

```sql
-- 自分のメールアドレスでSupabaseユーザーIDを確認
SELECT id, email, created_at
FROM auth.users
WHERE email = 'mk@natrium.co.jp';
```

結果の`id`（UUID形式）をメモしてください。例: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 2: admin_usersテーブルに自分のレコードがあるか確認

```sql
-- admin_usersテーブルを確認
SELECT id, user_id, discord_user_id, created_at
FROM admin_users;
```

自分の`user_id`が存在するか確認してください。

### Step 3: admin_usersテーブルにレコードがない場合

自分のレコードがない場合は、まず追加する必要があります：

```sql
-- 自分のSupabaseユーザーIDを確認（Step 1で取得したIDを使用）
-- YOUR_SUPABASE_USER_ID をStep 1で取得したidに置き換え
INSERT INTO admin_users (user_id)
VALUES ('YOUR_SUPABASE_USER_ID')
ON CONFLICT (user_id) DO NOTHING;
```

### Step 4: DiscordユーザーIDを設定

```sql
-- DiscordユーザーIDを設定
-- YOUR_SUPABASE_USER_ID をStep 1で取得したidに置き換え
UPDATE admin_users
SET discord_user_id = '784181261756792852'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

### Step 5: 設定を確認

```sql
-- 設定が正しく反映されたか確認
SELECT 
  id,
  user_id,
  discord_user_id,
  created_at
FROM admin_users
WHERE discord_user_id = '784181261756792852';
```

`discord_user_id`が`784181261756792852`になっていれば成功です。

## 一括実行用SQL（すべてのステップを含む）

以下を順番に実行してください：

```sql
-- Step 1: 自分のSupabaseユーザーIDを確認
SELECT id, email, created_at
FROM auth.users
WHERE email = 'mk@natrium.co.jp';

-- Step 2: 上記で取得したidを使用して、admin_usersにレコードがない場合は追加
-- （idを確認してから実行）
-- INSERT INTO admin_users (user_id)
-- VALUES ('上記で取得したid')
-- ON CONFLICT (user_id) DO NOTHING;

-- Step 3: DiscordユーザーIDを設定
-- （idを確認してから実行）
-- UPDATE admin_users
-- SET discord_user_id = '784181261756792852'
-- WHERE user_id = '上記で取得したid';

-- Step 4: 設定を確認
SELECT 
  id,
  user_id,
  discord_user_id,
  created_at
FROM admin_users
WHERE discord_user_id = '784181261756792852';
```

## トラブルシューティング

### admin_usersテーブルにレコードがない

**症状**: Step 2で自分のレコードが見つからない

**解決方法**: 
1. まず、自分を管理者として追加する必要があります
2. Supabase SQL Editorで以下を実行：

```sql
-- 自分のSupabaseユーザーIDを確認
SELECT id, email FROM auth.users WHERE email = 'mk@natrium.co.jp';

-- 上記で取得したidを使用して管理者として追加
INSERT INTO admin_users (user_id)
VALUES ('YOUR_SUPABASE_USER_ID')
ON CONFLICT (user_id) DO NOTHING;
```

### UPDATEが実行されても反映されない

**症状**: Step 4で`discord_user_id`が`NULL`のまま

**解決方法**:
1. `WHERE`句の`user_id`が正しいか確認
2. 再度UPDATE文を実行
3. スキーマキャッシュをリフレッシュ：

```sql
NOTIFY pgrst, 'reload schema';
```

## 確認方法

設定が完了したら、Discordで承認ボタンをクリックして動作を確認してください。

Vercelのログで以下が表示されれば成功です：

```
[Discord Interaction] Admin check result: {
  adminUser: { user_id: '...' },
  adminError: null
}
```

