# Supabase Edge Functionsのデプロイ方法

## 問題

`send-admin-notification` Edge Functionが404エラーを返している。

```
POST | 404 | https://uheuaetcwqabmbpyhnio.supabase.co/functions/v1/send-admin-notification
```

これは、Edge Functionがデプロイされていないことを示しています。

## 解決方法

### 方法1: Supabase CLIを使用してデプロイ（推奨）

#### Step 1: Supabase CLIにログイン

```bash
npx supabase login
```

ブラウザが開き、Supabaseアカウントでログインします。

#### Step 2: プロジェクトをリンク

```bash
npx supabase link --project-ref uheuaetcwqabmbpyhnio
```

#### Step 3: Edge Functionsをデプロイ

```bash
# send-admin-notificationをデプロイ
npx supabase functions deploy send-admin-notification --project-ref uheuaetcwqabmbpyhnio

# send-discord-notificationをデプロイ
npx supabase functions deploy send-discord-notification --project-ref uheuaetcwqabmbpyhnio

# send-approval-notificationをデプロイ
npx supabase functions deploy send-approval-notification --project-ref uheuaetcwqabmbpyhnio

# send-rejection-notificationをデプロイ
npx supabase functions deploy send-rejection-notification --project-ref uheuaetcwqabmbpyhnio
```

### 方法2: Supabaseダッシュボードからデプロイ

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Edge Functions** に移動
4. 各Edge Functionを確認：
   - `send-admin-notification`
   - `send-discord-notification`
   - `send-approval-notification`
   - `send-rejection-notification`
5. デプロイされていない場合は、**Deploy** をクリック

### 方法3: 一括デプロイ

すべてのEdge Functionsを一度にデプロイする場合：

```bash
# すべてのEdge Functionsをデプロイ
npx supabase functions deploy --project-ref uheuaetcwqabmbpyhnio
```

## 必要なEdge Functions

以下のEdge Functionsが必要です：

1. **send-admin-notification**
   - 新しい記録が投稿されたときに管理者にメール通知を送信
   - 必要な環境変数: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `ADMIN_EMAIL`

2. **send-discord-notification**
   - 新しい記録が投稿されたときにDiscordに通知を送信
   - 必要な環境変数: `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`, `DISCORD_WEBHOOK_URL`（オプション）

3. **send-approval-notification**
   - 記録が承認されたときに投稿者にメール通知を送信
   - 必要な環境変数: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

4. **send-rejection-notification**
   - 記録が却下されたときに投稿者にメール通知を送信
   - 必要な環境変数: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

## 環境変数の設定

各Edge Functionをデプロイする前に、必要な環境変数を設定してください：

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets**:

### メール通知用

- `MAILGUN_API_KEY`: MailgunのAPIキー
- `MAILGUN_DOMAIN`: Mailgunのドメイン
- `ADMIN_EMAIL`: 管理者のメールアドレス（`send-admin-notification`用）

### Discord通知用

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID
- `DISCORD_WEBHOOK_URL`: Webhook URL（オプション、フォールバック用）
- `ADMIN_URL`: 承認ページのURL（例: `https://www.skateright.io/admin`）
- `API_BASE_URL`: APIのベースURL（例: `https://www.skateright.io`）

## デプロイ後の確認

### 1. Edge Functionsのリストを確認

Supabaseダッシュボード → **Edge Functions** で、すべてのEdge Functionsが表示されているか確認してください。

### 2. ログを確認

Supabaseダッシュボード → **Edge Functions** → 各Edge Function → **Logs** で、エラーがないか確認してください。

### 3. 動作確認

1. 記録を投稿してテスト
2. 管理者にメール通知が送信されるか確認
3. Discordに通知が送信されるか確認

## トラブルシューティング

### デプロイが失敗する

- Supabase CLIにログインしているか確認
- プロジェクトが正しくリンクされているか確認
- Edge Functionのコードにエラーがないか確認

### 404エラーが続く

- Edge Functionが正しくデプロイされているか確認
- Edge Functionの名前が正しいか確認（大文字小文字を区別）
- SupabaseダッシュボードでEdge Functionsのリストを確認

### 環境変数が設定されていない

- Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets** で環境変数を確認
- 各Edge Functionに必要な環境変数がすべて設定されているか確認

## 次のステップ

1. すべてのEdge Functionsをデプロイ
2. 必要な環境変数を設定
3. 動作確認

