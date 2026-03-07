# Discord承認ボタンエラーのトラブルシューティング

## エラー内容

Discordの承認ボタンを押した際に「インタラクションに失敗しました」というエラーが表示される。

## 確認手順

### 1. Vercelのログを確認

Vercelダッシュボード → **Functions** → `/api/discord/interactions` → **Logs** で以下を確認：

- `[Discord Interaction] Received request` が表示されているか
- `[Discord Interaction] Signature verification result` の結果
- `[Discord Interaction] Button click received` が表示されているか
- エラーメッセージが表示されていないか

### 2. よくある原因と解決方法

#### 原因1: 署名検証の失敗

**症状**: ログに `Invalid signature` が表示される

**原因**: 
- `DISCORD_PUBLIC_KEY` 環境変数が正しく設定されていない
- Discord Developer PortalのPublic Keyと一致していない

**解決方法**:
1. Vercelダッシュボード → **Settings** → **Environment Variables** で `DISCORD_PUBLIC_KEY` を確認
2. [Discord Developer Portal](https://discord.com/developers/applications) → **General Information** → **Public Key** と一致しているか確認
3. 一致していない場合は、正しいPublic Keyを設定して再デプロイ

#### 原因2: 管理者のDiscordユーザーIDが設定されていない

**症状**: ログに `User is not an admin` が表示される

**原因**: `admin_users`テーブルの`discord_user_id`が設定されていない

**解決方法**:
1. Discordで開発者モードを有効にする
2. 自分のユーザー名を右クリック → **IDをコピー**
3. Supabase SQL Editorで以下を実行：

```sql
-- 管理者のDiscordユーザーIDを設定
UPDATE admin_users
SET discord_user_id = 'YOUR_DISCORD_USER_ID'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

#### 原因3: Interaction Endpoint URLが正しく設定されていない

**症状**: Discordからリクエストが届いていない

**原因**: Discord Developer PortalのInteraction Endpoint URLが正しく設定されていない

**解決方法**:
1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. アプリケーションを選択
3. **General Information** タブを開く
4. **Interactions Endpoint URL** が以下になっているか確認：
   ```
   https://www.skateright.io/api/discord/interactions
   ```
5. 正しくない場合は設定して **Save Changes** をクリック
6. Discordがエンドポイントを検証します（数秒かかる場合があります）

#### 原因4: データベースのマイグレーションが実行されていない

**症状**: `spot_approvals`テーブルが見つからないエラー

**原因**: マイグレーションが実行されていない

**解決方法**:
Supabase SQL Editorで以下を実行：

```sql
-- spot_approvalsテーブルの作成
-- supabase/migrations/20250101000000_create_spot_approvals.sql の内容を実行

-- admin_usersテーブルにdiscord_user_idを追加
-- supabase/migrations/20250101000001_add_discord_user_id_to_admin_users.sql の内容を実行
```

#### 原因5: スポットが既に承認/却下されている

**症状**: ログに `Spot is not pending` が表示される

**原因**: 既に承認または却下されたスポットに対して操作しようとしている

**解決方法**: これは正常な動作です。新しい記録で再度試してください。

### 3. デバッグ用のログ

コードに詳細なログが追加されています。以下のログを確認してください：

- `[Discord Interaction] Received request`: リクエストの受信
- `[Discord Interaction] Signature verification result`: 署名検証の結果
- `[Discord Interaction] Button click received`: ボタンクリックの受信
- `[Discord Interaction] Parsed interaction`: インタラクションの解析結果
- `[Discord Interaction] Unexpected error`: 予期しないエラー

### 4. 確認チェックリスト

- [ ] `DISCORD_PUBLIC_KEY` 環境変数がVercelに設定されているか
- [ ] Discord Developer PortalのPublic Keyと一致しているか
- [ ] Interaction Endpoint URLが正しく設定されているか
- [ ] 管理者のDiscordユーザーIDが`admin_users`テーブルに設定されているか
- [ ] `spot_approvals`テーブルが作成されているか
- [ ] `admin_users`テーブルに`discord_user_id`カラムが追加されているか
- [ ] Vercelのログでエラーが表示されていないか

## 次のステップ

1. Vercelのログを確認して、どの段階で失敗しているか特定
2. 上記のトラブルシューティング手順に従って問題を解決
3. エラーメッセージを共有していただければ、具体的な解決策を提案します

