# メールが届かない問題の最終確認チェックリスト

## メールテンプレートについて

表示されているメールテンプレートは問題ありません：
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

このテンプレートは、Supabaseがメール送信時に使用する標準的なテンプレートです。

## メールが届かない原因の確認手順

### ✅ チェック1: 「Confirm sign up」が有効になっているか

**確認場所**: Supabaseダッシュボード → **Authentication** → **Email Templates**

- [ ] **Confirm sign up** のトグルスイッチが **ON** になっているか確認
- [ ] 無効の場合は有効にする

### ✅ チェック2: SMTP設定が有効になっているか

**確認場所**: Supabaseダッシュボード → **Authentication** → **SMTP Settings**

- [ ] **Enable custom SMTP** が有効になっているか確認
- [ ] すべてのフィールドが入力されているか確認：
  - **Sender email address**: `noreply@resend.dev` または独自ドメイン
  - **Sender name**: `Skateright`
  - **Host**: `smtp.resend.com`
  - **Port number**: `587`
  - **Username**: `resend`
  - **Password**: ResendのAPIキー
- [ ] **Save changes** をクリックして保存したか確認

### ✅ チェック3: リダイレクトURLが設定されているか

**確認場所**: Supabaseダッシュボード → **Authentication** → **URL Configuration**

- [ ] **Site URL** が設定されているか確認（例: `https://your-domain.vercel.app`）
- [ ] **Redirect URLs** に以下が追加されているか確認：
  ```
  https://your-domain.vercel.app/auth/callback
  https://your-domain.vercel.app/**
  ```

### ✅ チェック4: Supabase Authentication Logsでエラーを確認

**確認場所**: Supabaseダッシュボード → **Authentication** → **Logs**

- [ ] `/signup` リクエストの詳細を確認
- [ ] エラーメッセージがないか確認：
  - `Failed to send email`
  - `SMTP connection failed`
  - `Invalid redirect URL`
  - `Rate limit exceeded`

### ✅ チェック5: Resendダッシュボードでログを確認

**確認場所**: [Resendダッシュボード](https://resend.com/) → **Logs**

- [ ] メール送信の試行が記録されているか確認
- [ ] エラーメッセージがないか確認

## よくある問題と解決策

### 問題1: 「Confirm sign up」が無効になっている

**症状**: メールが送信されない

**解決策**: 
1. **Authentication** → **Email Templates** に移動
2. **Confirm sign up** を有効にする

### 問題2: SMTP設定が無効になっている

**症状**: Resendにログが表示されない

**解決策**:
1. **Authentication** → **SMTP Settings** に移動
2. すべてのフィールドを入力
3. **Save changes** をクリック
4. **Enable custom SMTP** が有効になることを確認

### 問題3: リダイレクトURLが設定されていない

**症状**: メールは届くが、リンクをクリックしてもエラーになる

**解決策**:
1. **Authentication** → **URL Configuration** に移動
2. **Site URL** を設定
3. **Redirect URLs** にリダイレクト先を追加

## テスト手順

1. 上記のチェックリストをすべて確認
2. アプリでサインアップを実行
3. Resendダッシュボードの **Logs** を確認
4. Supabaseダッシュボードの **Authentication** → **Logs** を確認
5. メールボックスを確認（迷惑メールフォルダも確認）

## 次のステップ

1. **「Confirm sign up」が有効になっているか確認**（最重要）
2. **SMTP設定が有効になっているか確認**
3. **リダイレクトURLが設定されているか確認**
4. すべて確認後、サインアップを再試行

すべての設定が正しく行われていれば、メールが届くはずです。

