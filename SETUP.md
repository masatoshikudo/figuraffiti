# セットアップガイド

## 概要

Skaterightの初期セットアップ手順です。

## 1. 環境変数の設定

### Vercel（本番環境）

Vercelダッシュボード → **Settings** → **Environment Variables** で以下を設定：

#### 必須の環境変数

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: SupabaseのAnon Key
- `SUPABASE_SERVICE_ROLE_KEY`: SupabaseのService Role Key（管理機能用）
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapboxのアクセストークン

#### オプションの環境変数

- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`: Google Places APIキー（場所検索用）

### ローカル開発環境

プロジェクトルートに`.env.local`ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## 2. Supabaseデータベースのセットアップ

### マイグレーションの実行

Supabase SQL Editorで以下を順番に実行：

1. `supabase/schema.sql` - 基本スキーマ
2. `supabase/migrations/20250101000000_create_spot_approvals.sql` - 承認履歴テーブル
3. `supabase/migrations/20250120000000_update_schema_for_minimal_features.sql` - 機能更新

### 管理者の設定

```sql
-- 管理者を追加
INSERT INTO admin_users (user_id)
VALUES ('YOUR_SUPABASE_USER_ID')
ON CONFLICT (user_id) DO NOTHING;

```

## 3. Supabase Edge Functionsのデプロイ

### 必要なEdge Functions

- `send-admin-notification` - 管理者へのメール通知
- `send-approval-notification` - 承認通知
- `send-rejection-notification` - 却下通知

### デプロイ方法

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

npx supabase functions deploy send-admin-notification --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-approval-notification --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-rejection-notification --project-ref YOUR_PROJECT_REF
```

### Edge Functionsの環境変数

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets** で以下を設定：

#### メール通知用

- `MAILGUN_API_KEY`: MailgunのAPIキー
- `MAILGUN_DOMAIN`: Mailgunのドメイン
- `MAILGUN_FROM_EMAIL`: 送信元メールアドレス（オプション）
- `ADMIN_URL`: 承認ページのURL
- `API_BASE_URL`: APIのベースURL

## 4. メール送信の設定（Mailgun）

### Mailgunアカウントの作成

1. [Mailgun](https://www.mailgun.com/)でアカウントを作成
2. ドメインを追加（またはサンドボックスドメインを使用）

**注意**: サンドボックスドメインは、認証済みの受信者のみにメールを送信できます。本番環境では独自ドメインの設定を推奨します。

### SMTP設定

Supabaseダッシュボード → **Settings** → **Auth** → **SMTP Settings** で以下を設定：

- **Host**: `smtp.mailgun.org`
- **Port**: `587`（推奨）または `465`（SSL/TLS）
- **Username**: 完全なメールアドレス（例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
- **Password**: MailgunのSMTPパスワード（**SMTP Credentials**タブで確認）
- **Sender Email**: 送信元メールアドレス（Usernameと同じ）
- **Sender Name**: `Skateright`
- **Enable custom SMTP**: 有効化

### 環境変数

Supabase Edge FunctionsのSecretsに以下を設定：

- `MAILGUN_API_KEY`: MailgunのAPIキー（**API Keys**タブで確認）
- `MAILGUN_DOMAIN`: Mailgunのドメイン（例: `sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）

### URL設定

Supabaseダッシュボード → **Settings** → **Auth** → **URL Configuration** で以下を設定：

- **Site URL**: `https://www.skateright.io/`
- **Redirect URLs**: `https://www.skateright.io/**`

## 5. 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- Docker Desktop（Supabaseローカル開発用）

### セットアップ手順

```bash
# 依存関係のインストール
npm install

# Supabaseローカル環境の起動
npx supabase start

# 開発サーバーの起動
npm run dev
```

### ローカル環境の確認

- アプリケーション: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323
- メール確認（Inbucket）: http://127.0.0.1:54324

## 6. 動作確認

### 記録の投稿

1. `/submit` ページで記録を投稿
2. 管理者にメール通知が送信されるか確認

### 承認

1. `/admin` ページで承認ボタンをクリック
2. 記録が承認されるか確認
3. 投稿者にメール通知が送信されるか確認

### 地図表示

1. `/mapping` ページで承認済み記録が表示されるか確認
2. 地図上でピンをクリックして詳細が表示されるか確認

## トラブルシューティング

詳細は `TROUBLESHOOTING.md` を参照してください。

