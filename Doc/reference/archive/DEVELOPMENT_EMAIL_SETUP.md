# 開発環境でのメール認証設定

## 概要

開発環境では、Supabaseのローカル開発環境（Supabase CLI）を使用している場合、メールは実際には送信されません。代わりに、**Inbucket**というメールテストサーバーが使用されます。

## Inbucketでメールを確認する方法

1. Supabaseローカル環境を起動していることを確認：
   ```bash
   supabase start
   ```

2. InbucketのWebインターフェースにアクセス：
   ```
   http://127.0.0.1:54324
   ```

3. サインアップまたはパスワードリセットを実行すると、Inbucketにメールが表示されます。

4. メール内のリンクをクリックして、メール認証を完了できます。

## 設定確認

### 1. `supabase/config.toml`の設定

以下の設定が有効になっていることを確認：

```toml
[auth.email]
enable_signup = true
enable_confirmations = true  # メール確認を有効化
```

### 2. Inbucketの設定

```toml
[inbucket]
enabled = true
port = 54324  # InbucketのWebインターフェースのポート
```

### 3. メール確認後のリダイレクト先

`contexts/auth-context.tsx`の`signUp`関数で、`emailRedirectTo`を設定しています：

```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

これにより、メール確認リンクをクリックすると、`/auth/callback`にリダイレクトされます。

## トラブルシューティング

### メールが表示されない場合

1. **Supabaseローカル環境が起動しているか確認**：
   ```bash
   supabase status
   ```

2. **Inbucketが起動しているか確認**：
   ```bash
   curl http://127.0.0.1:54324
   ```

3. **Supabaseを再起動**：
   ```bash
   supabase stop
   supabase start
   ```

### メール確認が完了しない場合

1. **リダイレクトURLの確認**：
   - `supabase/config.toml`の`site_url`と`additional_redirect_urls`を確認
   - 開発環境では`http://127.0.0.1:3000`が設定されている必要があります

2. **認証コールバックの確認**：
   - `/auth/callback`ルートが正しく動作しているか確認

## 本番環境での設定

本番環境では、実際のSMTPサーバーを使用する必要があります。`supabase/config.toml`の`[auth.email.smtp]`セクションをコメントアウトして設定してください。

```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "admin@email.com"
sender_name = "Admin"
```

