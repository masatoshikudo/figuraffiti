# 本番環境でのメール認証設定ガイド

## 問題: 本番環境でメールが届かない

開発環境ではInbucketでメール認証ができたが、本番環境ではメールが届かない場合の解決方法です。

## 解決手順

### 1. Supabaseダッシュボードでの設定確認

#### 1-1. メール認証の有効化

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **Email Auth** に移動
4. 以下の設定を確認・変更：

   - ✅ **Enable email signup**: 有効
   - ✅ **Confirm email**: 有効（メール確認を必須にする）
   - ✅ **Secure email change**: 任意

#### 1-2. SMTP設定（重要）

本番環境でメールを送信するには、SMTPサーバーの設定が必要です。

**オプション1: SupabaseのデフォルトSMTP（無料プランでは制限あり）**

- Supabaseはデフォルトでメール送信機能を提供していますが、無料プランでは**1時間あたり3通まで**という制限があります
- 制限に達するとメールが送信されません

**オプション2: カスタムSMTPサーバー（推奨）**

1. **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下の情報を入力：

   - **Host**: SMTPサーバーのホスト名（例: `smtp.sendgrid.net`）
   - **Port**: SMTPポート（例: `587`）
   - **Username**: SMTPユーザー名
   - **Password**: SMTPパスワード
   - **Sender email**: 送信者メールアドレス（例: `noreply@yourdomain.com`）
   - **Sender name**: 送信者名（例: `Skateright`）

**推奨SMTPサービス**:
- **SendGrid**: 無料プランで1日100通まで
- **Resend**: 無料プランで1日100通まで
- **Mailgun**: 無料プランで1日100通まで

#### 1-3. リダイレクトURLの設定（重要）

メール認証後のリダイレクト先を設定する必要があります。

1. **Authentication** → **URL Configuration** に移動
2. **Site URL**を設定（例: `https://your-domain.vercel.app` または `https://yourdomain.com`）
3. **Redirect URLs**に以下を追加：

   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```

   **重要**: ワイルドカード（`**`）を使用することで、すべてのパスでリダイレクトが許可されます。

### 2. 環境変数の確認

Vercelダッシュボードで、以下の環境変数が設定されているか確認：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

確認方法：
1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 上記の環境変数が設定されているか確認

### 3. メール送信のテスト

1. アプリでサインアップを実行
2. メールボックスを確認（迷惑メールフォルダも確認）
3. メールが届かない場合：
   - Supabaseダッシュボードの **Authentication** → **Logs** でエラーを確認
   - SMTP設定が正しいか確認
   - リダイレクトURLが正しく設定されているか確認

## トラブルシューティング

### メールが届かない場合

1. **Supabaseダッシュボードでエラーを確認**:
   - **Authentication** → **Logs** でエラーログを確認
   - SMTP設定エラーやレート制限エラーがないか確認

2. **SMTP設定の確認**:
   - SMTPサーバーのホスト名、ポート、認証情報が正しいか確認
   - 送信者メールアドレスが正しいか確認

3. **リダイレクトURLの確認**:
   - **Authentication** → **URL Configuration** でリダイレクトURLが正しく設定されているか確認
   - ワイルドカード（`**`）を使用しているか確認

4. **レート制限の確認**:
   - SupabaseのデフォルトSMTPを使用している場合、1時間あたり3通の制限がある
   - カスタムSMTPサーバーを使用することを推奨

5. **迷惑メールフォルダの確認**:
   - メールが迷惑メールフォルダに振り分けられている可能性がある

### メール確認リンクが機能しない場合

1. **リダイレクトURLの確認**:
   - メール内のリンクのドメインが、Supabaseダッシュボードで設定したリダイレクトURLと一致しているか確認

2. **認証コールバックの確認**:
   - `/auth/callback`ルートが正しく動作しているか確認
   - ブラウザのコンソールでエラーがないか確認

## 次のステップ

1. Supabaseダッシュボードでメール認証設定を確認
2. SMTPサーバーを設定（カスタムSMTPを推奨）
3. リダイレクトURLを設定
4. 実際のメールアドレスでサインアップしてテスト

