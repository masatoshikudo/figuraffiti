# メール認証のトラブルシューティングガイド

## 問題: 開発環境と本番環境の両方でメールが届かない

### 開発環境の確認

#### 前提条件: Docker Desktopが必要

Supabaseローカル開発環境を使用するには、**Docker Desktop**が必要です。

- Docker Desktopがインストールされていない場合: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)をインストール
- Docker Desktopが起動していない場合: アプリケーションからDocker Desktopを起動

**注意**: Docker Desktopをインストールしたくない場合は、**本番環境のSupabase**を使用してメール認証をテストすることもできます（下記の「本番環境の確認」セクションを参照）。

#### 1. Supabaseローカル環境が起動しているか確認

```bash
npx supabase status
# または
npm run supabase:status
```

以下のような出力が表示されるはずです：
```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
```

**Inbucket URL**が表示されていない場合は、Supabaseローカル環境を起動してください：

```bash
npx supabase start
# または
npm run supabase:start
```

**エラーが発生する場合**: Docker Desktopが起動しているか確認してください。

#### 2. Inbucketでメールを確認

開発環境では、メールは実際には送信されません。代わりに、**Inbucket**というメールテストサーバーで確認できます。

1. ブラウザで以下にアクセス：
   ```
   http://127.0.0.1:54324
   ```

2. サインアップを実行すると、Inbucketにメールが表示されます。

3. メール内のリンクをクリックして、メール認証を完了できます。

#### 3. 環境変数の確認

開発環境では、`.env.local`にローカルSupabaseのURLを設定する必要があります：

```bash
# ローカル開発環境の場合
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**注意**: 現在の`.env.local`には本番環境のSupabase URLが設定されているため、開発環境ではローカルのURLに変更する必要があります。

---

### 本番環境の確認

#### 1. Supabaseダッシュボードでの設定確認

本番環境では、Supabaseダッシュボードでメール認証を有効にする必要があります。

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **Email Auth** に移動
4. 以下の設定を確認：

   - ✅ **Enable email signup**: 有効
   - ✅ **Confirm email**: 有効（メール確認を必須にする場合）
   - ✅ **Secure email change**: 任意

#### 2. SMTP設定（本番環境でメールを送信する場合）

本番環境で実際にメールを送信するには、SMTPサーバーの設定が必要です。

**オプション1: SupabaseのデフォルトSMTP（無料プランでは制限あり）**

Supabaseはデフォルトでメール送信機能を提供していますが、無料プランでは1時間あたり3通までという制限があります。

**オプション2: カスタムSMTPサーバー（推奨）**

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下の情報を入力：
   - **Host**: SMTPサーバーのホスト名（例: `smtp.sendgrid.net`）
   - **Port**: SMTPポート（例: `587`）
   - **Username**: SMTPユーザー名
   - **Password**: SMTPパスワード
   - **Sender email**: 送信者メールアドレス
   - **Sender name**: 送信者名

**推奨SMTPサービス**:
- **SendGrid**: 無料プランで1日100通まで
- **Resend**: 無料プランで1日100通まで
- **Mailgun**: 無料プランで1日100通まで

#### 3. リダイレクトURLの設定

Supabaseダッシュボードで、メール認証後のリダイレクト先を設定する必要があります。

1. **Authentication** → **URL Configuration** に移動
2. **Site URL**を設定（例: `https://your-domain.com`）
3. **Redirect URLs**に以下を追加：
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/**`

#### 4. 環境変数の確認

本番環境（Vercel）では、以下の環境変数が設定されている必要があります：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Vercelダッシュボードで確認：
1. プロジェクトを選択
2. **Settings** → **Environment Variables**
3. 上記の環境変数が設定されているか確認

---

## よくある問題と解決策

### 問題1: 開発環境でメールが表示されない

**原因**: Supabaseローカル環境が起動していない、またはInbucketが動作していない

**解決策**:
```bash
supabase stop
supabase start
```

その後、`http://127.0.0.1:54324`でInbucketを確認

### 問題2: 本番環境でメールが届かない

**原因1**: Supabaseダッシュボードでメール認証が無効になっている

**解決策**: Supabaseダッシュボードで **Authentication** → **Settings** → **Email Auth** で `Confirm email` を有効化

**原因2**: SMTP設定がない、または無効

**解決策**: Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** でSMTPサーバーを設定

**原因3**: リダイレクトURLが設定されていない

**解決策**: Supabaseダッシュボードで **Authentication** → **URL Configuration** でリダイレクトURLを設定

### 問題3: メール確認リンクが機能しない

**原因**: リダイレクトURLが許可されていない

**解決策**: 
1. Supabaseダッシュボードで **Authentication** → **URL Configuration** を確認
2. `https://your-domain.com/auth/callback` が **Redirect URLs** に追加されているか確認

---

## 次のステップ

1. **開発環境**: Supabaseローカル環境を起動し、Inbucketでメールを確認
2. **本番環境**: Supabaseダッシュボードでメール認証設定を確認し、必要に応じてSMTPサーバーを設定

