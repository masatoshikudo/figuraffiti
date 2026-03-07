# 管理者へのメール通知設定ガイド

## 概要

新しい記録が投稿され、承認待ちになった際に、管理者（オーナー）にメール通知を送信する機能を実装しました。

## 実装内容

### 1. Edge Function: `send-admin-notification`

**場所**: `supabase/functions/send-admin-notification/index.ts`

**機能**:
- 管理者のメールアドレスを取得（`admin_users`テーブルから）
- 各管理者にメール通知を送信
- Mailgun APIを使用してメールを送信

### 2. API Route: `POST /api/spots`

**変更点**:
- 記録が`pending`（承認待ち）で作成された場合、管理者にメール通知を送信
- 通知は非同期で実行され、エラーが発生しても記録の作成は続行される

## 設定手順

### Step 1: Mailgun APIキーとドメインを環境変数に設定

Supabase Edge Functionで使用する環境変数を設定します。

1. Supabaseダッシュボードにログイン
2. **Edge Functions** → **Settings** → **Secrets** に移動
3. 以下の環境変数を追加：
   - `MAILGUN_API_KEY`: MailgunのAPIキー
   - `MAILGUN_DOMAIN`: Mailgunのドメイン（例: `sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
   - `MAILGUN_FROM_EMAIL`: 送信者メールアドレス（例: `noreply@skateright.io`）
   - `ADMIN_URL`: 承認ページのURL（例: `https://www.skateright.io/admin`）

### Step 2: Edge Functionをデプロイ

```bash
# ローカルでテスト
npx supabase functions serve send-admin-notification

# 本番環境にデプロイ
npx supabase functions deploy send-admin-notification
```

### Step 3: 管理者を`admin_users`テーブルに追加

管理者のユーザーIDを`admin_users`テーブルに追加します。

```sql
-- 管理者を追加（user_idは実際のユーザーIDに置き換えてください）
INSERT INTO admin_users (user_id, created_by, note)
VALUES ('ユーザーID', 'ユーザーID', 'オーナー');
```

## メール通知の内容

### 件名
「新しい記録が承認待ちです」

### 本文
- 記録ID
- 場所名
- 技名（入力されている場合）
- 投稿者（メールアドレス）
- メディアURL（入力されている場合）
- 投稿日時
- 承認ページへのリンク

## テスト方法

### 開発環境

1. ローカルSupabaseを起動：
   ```bash
   npx supabase start
   ```

2. Edge Functionをローカルで実行：
   ```bash
   npx supabase functions serve send-admin-notification
   ```

3. 記録を投稿して、管理者にメール通知が送信されることを確認

### 本番環境

1. Edge Functionをデプロイ：
   ```bash
   npx supabase functions deploy send-admin-notification
   ```

2. 環境変数を設定（上記のStep 1を参照）

3. 記録を投稿して、管理者にメール通知が送信されることを確認

## トラブルシューティング

### メールが送信されない場合

1. **環境変数の確認**:
   - `MAILGUN_API_KEY`が正しく設定されているか
   - `MAILGUN_DOMAIN`が正しく設定されているか
   - `MAILGUN_FROM_EMAIL`が正しく設定されているか

2. **管理者の確認**:
   - `admin_users`テーブルに管理者が登録されているか
   - 管理者のメールアドレスが正しく取得できているか

3. **Edge Functionのログを確認**:
   - Supabaseダッシュボードの **Edge Functions** → **Logs** でエラーを確認

4. **Mailgunのログを確認**:
   - Mailgunダッシュボードの **Logs** でメール送信状況を確認

## 注意事項

- メール通知のエラーは致命的ではないため、記録の作成は続行されます
- 開発環境では、Mailgunの設定がなくても動作します（通知はスキップされます）
- 本番環境では、Mailgunの設定が必要です

