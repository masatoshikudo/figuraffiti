# Discord Bot設定の具体的な手順

## 取得した情報

✅ Bot招待URL: `https://discord.com/oauth2/authorize?client_id=1455495626270965975&permissions=52224&integration_type=0&scope=bot+applications.commands`
✅ Botトークン: `YOUR_DISCORD_BOT_TOKEN`（Discord Developer Portal で取得。リポジトリには記載しないこと）

## 設定手順

### Step 1: Botをサーバーに招待

1. 上記の招待URLをブラウザで開く
2. **サーバーを選択** ドロップダウンから、通知を送信したいサーバーを選択
3. **認証** をクリック
4. Botがサーバーに追加されたことを確認

### Step 2: チャンネルIDを取得

1. Discordで開発者モードを有効にする：
   - 設定 → 詳細設定 → 開発者モードをON
2. 通知を送信したいチャンネルを右クリック
3. **IDをコピー** を選択
4. このIDをメモしておく（例: `123456789012345678`）

### Step 3: Supabase Edge FunctionのSecretsを設定

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets** で以下を設定：

#### 必須の環境変数

1. **DISCORD_BOT_TOKEN**
   - 値: Discord Developer Portal で取得した Bot トークン（ここには記載しない）
   - 説明: Discord Botのトークン

2. **DISCORD_CHANNEL_ID**
   - 値: Step 2で取得したチャンネルID（例: `123456789012345678`）
   - 説明: 通知を送信するチャンネルID

#### オプションの環境変数

3. **DISCORD_WEBHOOK_URL**（オプション）
   - 値: Webhook URL（フォールバック用）
   - 説明: Bot APIが失敗した場合のフォールバック用

4. **ADMIN_URL**
   - 値: `https://www.skateright.io/admin`
   - 説明: 承認ページのURL

5. **API_BASE_URL**
   - 値: `https://www.skateright.io`
   - 説明: APIのベースURL

### Step 4: Edge Functionをデプロイ

```bash
# 本番環境にデプロイ
npx supabase functions deploy send-discord-notification --project-ref YOUR_PROJECT_REF
```

または、Supabaseダッシュボードから：
1. **Edge Functions** → `send-discord-notification`
2. **Deploy** をクリック

### Step 5: 管理者のDiscordユーザーIDを設定

1. Discordで開発者モードを有効にする（既に有効ならスキップ）
2. 自分のユーザー名を右クリック
3. **IDをコピー** を選択
4. Supabase SQL Editorで以下を実行：

```sql
-- 管理者のDiscordユーザーIDを設定
-- YOUR_DISCORD_USER_ID をコピーしたIDに置き換え
-- YOUR_SUPABASE_USER_ID を自分のSupabaseユーザーIDに置き換え
UPDATE admin_users
SET discord_user_id = 'YOUR_DISCORD_USER_ID'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

### Step 6: Discord Interaction Endpoint URLの設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. アプリケーション（Client ID: `1455495626270965975`）を選択
3. **General Information** タブを開く
4. **Interactions Endpoint URL** に以下を設定：
   ```
   https://www.skateright.io/api/discord/interactions
   ```
5. **Save Changes** をクリック
6. Discordがエンドポイントを検証します（数秒かかる場合があります）

### Step 7: 動作確認

1. 記録を投稿してテスト
2. Discordチャンネルに通知が送信されるか確認
3. 「承認」と「却下」のボタンが表示されるか確認
4. ボタンをクリックして動作を確認

## トラブルシューティング

### Botがメッセージを送信できない

- Botがサーバーに追加されているか確認
- Botに「Send Messages」権限が付与されているか確認
- チャンネルIDが正しいか確認

### ボタンが動作しない

- Interaction Endpoint URLが正しく設定されているか確認
- Vercelのログでエラーを確認
- 管理者のDiscordユーザーIDが正しく設定されているか確認

### 通知が来ない

- Vercelのログで `[sendDiscordNotification]` のログを確認
- Supabase Edge Functionのログを確認
- 環境変数が正しく設定されているか確認

## セキュリティ注意事項

⚠️ **重要**: Botトークンは機密情報です。以下の点に注意してください：

- BotトークンをGitHubにコミットしない
- Botトークンを公開しない
- Botトークンが漏洩した場合は、Discord Developer Portalで再生成してください

## 次のステップ

設定が完了したら、記録を投稿してDiscord通知が正常に動作するか確認してください。

