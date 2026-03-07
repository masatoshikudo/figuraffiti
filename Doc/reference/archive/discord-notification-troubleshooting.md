# Discord通知が来ない場合のトラブルシューティング

## 確認手順

### 1. Vercelのログを確認

Vercelダッシュボード → **Functions** → `/api/spots` → **Logs** で以下を確認：

- `[sendDiscordNotification] Starting Discord notification` が表示されているか
- `[sendDiscordNotification] Edge Function response` のステータスコード
- エラーメッセージが表示されていないか

### 2. Supabase Edge Functionのログを確認

Supabaseダッシュボード → **Edge Functions** → `send-discord-notification` → **Logs** で以下を確認：

- Edge Functionが呼び出されているか
- エラーメッセージが表示されていないか

### 3. 環境変数の確認

#### Supabase Edge FunctionのSecrets

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets** で以下が設定されているか確認：

- `DISCORD_BOT_TOKEN`: Discord Botのトークン（Bot APIを使用する場合）
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID（Bot APIを使用する場合）
- `DISCORD_WEBHOOK_URL`: Webhook URL（フォールバック用、オプション）

#### 確認方法

Supabase SQL Editorで以下を実行（直接確認はできませんが、Edge Functionのログで確認できます）：

```sql
-- Edge Functionのログを確認するには、SupabaseダッシュボードのLogsを使用してください
```

### 4. Edge Functionがデプロイされているか確認

```bash
# ローカルで確認
npx supabase functions list

# 本番環境で確認
# Supabaseダッシュボード → Edge Functions で確認
```

### 5. Discord Botの設定確認

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. アプリケーションを選択
3. **Bot** タブで以下を確認：
   - Botが作成されているか
   - **Token** が正しく設定されているか
   - **MESSAGE CONTENT INTENT** が有効になっているか
4. **OAuth2** → **URL Generator** で以下を確認：
   - Botがサーバーに招待されているか
   - 必要な権限（Send Messages, Embed Links, Use External Emojis, Add Reactions）が付与されているか

### 6. DiscordチャンネルIDの確認

1. Discordで開発者モードを有効にする（設定 → 詳細設定 → 開発者モード）
2. 通知を送信したいチャンネルを右クリック
3. **IDをコピー** を選択
4. このIDが`DISCORD_CHANNEL_ID`環境変数と一致しているか確認

## よくある問題と解決方法

### 問題1: Edge Functionが呼び出されていない

**症状**: Vercelのログに`[sendDiscordNotification] Starting Discord notification`が表示されない

**原因**: 
- `status === SPOT_STATUS.PENDING`の条件が満たされていない
- エラーが発生して関数が呼び出されていない

**解決方法**:
- Vercelのログでエラーを確認
- `updatedSpot.status`が`pending`になっているか確認

### 問題2: Edge Functionが404エラーを返す

**症状**: `[sendDiscordNotification] Edge Function response` のステータスが404

**原因**: Edge Functionがデプロイされていない

**解決方法**:
```bash
npx supabase functions deploy send-discord-notification
```

### 問題3: Edge Functionが500エラーを返す

**症状**: `[sendDiscordNotification] Edge Function response` のステータスが500

**原因**: 
- 環境変数が設定されていない
- Discord APIへのリクエストが失敗している

**解決方法**:
1. SupabaseダッシュボードでSecretsを確認
2. Edge Functionのログで詳細なエラーを確認
3. Discord BotのトークンとチャンネルIDが正しいか確認

### 問題4: Discord Bot APIが失敗し、Webhookにフォールバックしている

**症状**: Edge Functionのログに`Error sending Discord notification via Bot API`が表示される

**原因**: 
- Bot APIの設定が不完全
- Botがチャンネルにアクセスできない

**解決方法**:
1. Botがサーバーに招待されているか確認
2. Botに必要な権限が付与されているか確認
3. チャンネルIDが正しいか確認
4. Webhook URLが設定されていれば、Webhook経由で通知が送信される

### 問題5: Webhookも失敗している

**症状**: Edge Functionのログに`Error sending Discord notification`が表示される

**原因**: 
- Webhook URLが無効
- Webhookが削除されている

**解決方法**:
1. Discordサーバーの設定 → 連携サービス → Webhooks でWebhookを確認
2. Webhook URLを再生成
3. `DISCORD_WEBHOOK_URL`環境変数を更新

## デバッグ用のログ追加

コードに詳細なログが追加されています。以下のログを確認してください：

- `[sendDiscordNotification] Starting Discord notification`: 関数の開始
- `[sendDiscordNotification] Calling Edge Function`: Edge Function呼び出し前
- `[sendDiscordNotification] Edge Function response`: Edge Functionのレスポンス
- `[sendDiscordNotification] Discord notification sent successfully`: 成功時
- `[sendDiscordNotification] Failed to send Discord notification`: 失敗時

## 次のステップ

1. Vercelのログを確認して、どの段階で失敗しているか特定
2. Supabase Edge Functionのログを確認して、詳細なエラーを確認
3. 上記のトラブルシューティング手順に従って問題を解決

