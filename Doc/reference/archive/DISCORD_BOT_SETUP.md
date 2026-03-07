# Discord Bot + インタラクション設定ガイド

## 概要

Discord Bot + インタラクションを使用して、Discord内で承認/却下を実行できるようにします。

## 実装内容

### Phase 1: 一人承認（現在）

- 一人の管理者がDiscordのボタンをクリックして承認/却下を実行
- 承認/却下は即座に反映される
- 承認履歴を`spot_approvals`テーブルに記録

### Phase 2: 複数人承認（将来）

- 複数の管理者が承認/却下を実行
- 必要な承認数に達したら自動的に承認される
- 承認状況をDiscordメッセージに表示

## 設定手順

### Step 1: Discord Botの作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. **New Application** をクリックしてアプリケーションを作成
3. **Bot** タブでBotを作成
4. **OAuth2** → **URL Generator** で以下を設定：
   - **Scopes**: `bot`, `applications.commands`
   - **Bot Permissions**: 
     - `Send Messages`
     - `Use Slash Commands`
     - `Use External Emojis`
     - `Embed Links`
     - `Read Message History`
5. BotをDiscordサーバーに招待
6. **Bot** タブで **Token** をコピー（環境変数に設定）
7. **General Information** タブで **Public Key** をコピー（環境変数に設定）

### Step 2: 環境変数の設定

#### Supabase Edge Function

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets**:

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID
- `DISCORD_WEBHOOK_URL`: Webhook URL（フォールバック用、オプション）
- `ADMIN_URL`: 承認ページのURL（例: `https://www.skateright.io/admin`）

#### Next.js（Vercel）

Vercelダッシュボード → **Settings** → **Environment Variables**:

- `DISCORD_PUBLIC_KEY`: Discord Applicationの公開鍵（署名検証用）

### Step 3: データベースマイグレーションの実行

Supabase SQL Editorで以下を実行：

```sql
-- spot_approvalsテーブルの作成
-- supabase/migrations/20250101000000_create_spot_approvals.sql

-- admin_usersテーブルにdiscord_user_idを追加
-- supabase/migrations/20250101000001_add_discord_user_id_to_admin_users.sql
```

### Step 4: 管理者のDiscordユーザーIDを設定

Supabase SQL Editorで実行：

```sql
-- 管理者のDiscordユーザーIDを設定
-- discord_user_idは、Discordでユーザーを右クリック → 「IDをコピー」で取得できます
UPDATE admin_users
SET discord_user_id = 'YOUR_DISCORD_USER_ID'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

### Step 5: Edge Functionのデプロイ

```bash
# Discord通知用のEdge Functionをデプロイ
npx supabase functions deploy send-discord-notification

# ローカルでテスト
npx supabase functions serve send-discord-notification
```

### Step 6: Discord Interaction Endpointの設定

1. Discord Developer Portal → **General Information** → **Interactions Endpoint URL**
2. 以下のURLを設定：
   ```
   https://www.skateright.io/api/discord/interactions
   ```
3. **Save Changes** をクリック

## 使用方法

### 記録が投稿されたとき

1. Discordチャンネルに通知が送信される
2. メッセージに「承認」と「却下」のボタンが表示される

### 承認する場合

1. 「承認」ボタンをクリック
2. 記録が即座に承認される
3. Discordメッセージが更新される（承認済み表示）
4. 投稿者にメール通知が送信される

### 却下する場合

1. 「却下」ボタンをクリック
2. 却下理由を入力するモーダルが表示される
3. 却下理由を入力して送信
4. 記録が却下される
5. Discordメッセージが更新される（却下済み表示）
6. 投稿者にメール通知が送信される

## セキュリティ

### 管理者認証

- DiscordユーザーIDと`admin_users`テーブルの`discord_user_id`を照合
- 管理者でない場合はエラーメッセージを表示

### 署名検証

- Discord Interactionの署名を検証
- 不正なリクエストを拒否

### 重複承認の防止

- `spot_approvals`テーブルの`UNIQUE`制約で同じ人が2回承認できないようにする

## トラブルシューティング

### Botがメッセージを送信できない

1. Botがサーバーに追加されているか確認
2. Botに必要な権限があるか確認
3. チャンネルIDが正しいか確認

### ボタンが動作しない

1. Interaction Endpoint URLが正しく設定されているか確認
2. 署名検証が正しく動作しているか確認
3. 管理者のDiscordユーザーIDが正しく設定されているか確認

### 承認が反映されない

1. データベースマイグレーションが実行されているか確認
2. `spot_approvals`テーブルにデータが記録されているか確認
3. エラーログを確認

## 将来の拡張

### 複数人承認への対応

1. 承認設定テーブルを作成
2. 必要な承認数を設定
3. 承認ロジックを拡張
4. Discordメッセージに承認状況を表示

詳細は `doc/multi-approval-design.md` を参照してください。

