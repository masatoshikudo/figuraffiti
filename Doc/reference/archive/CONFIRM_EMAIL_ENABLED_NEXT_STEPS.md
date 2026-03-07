# 「Confirm email」が有効になっている場合の次のステップ

## ✅ 確認済み: 「Confirm email」が有効

「Confirm email」が有効になっていることは確認できました。これは良いニュースです。

しかし、メールが届かないということは、**他の設定に問題がある可能性が高い**です。

## 次に確認すべき設定

### 1. SMTP設定が有効になっているか（最重要）

「Confirm email」が有効でも、SMTP設定が無効だとメールは送信されません。

**確認手順**:
1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を確認：
   - ✅ **Enable custom SMTP** が有効になっているか
   - ✅ すべてのフィールドが入力されているか：
     - **Sender email address**: `noreply@resend.dev`
     - **Sender name**: `Skateright`
     - **Host**: `smtp.resend.com`
     - **Port number**: `587`
     - **Username**: `resend`
     - **Password**: ResendのAPIキー（`re_it6bQBLJ_Kh3Rcqky9WzVdud9YRwm1F9Z`）
   - ✅ **Save changes** をクリックして保存したか

**重要**: **Enable custom SMTP** が無効の場合、メールは送信されません。

### 2. リダイレクトURLが設定されているか

リダイレクトURLが設定されていない場合、メール送信がブロックされる可能性があります。

**確認手順**:
1. **Authentication** → **URL Configuration** に移動
2. 以下を確認：
   - ✅ **Site URL** が設定されているか（例: `https://your-domain.vercel.app`）
   - ✅ **Redirect URLs** に以下が追加されているか：
     ```
     https://your-domain.vercel.app/auth/callback
     https://your-domain.vercel.app/**
     ```

### 3. Supabase Authentication Logsでエラーを確認

**確認手順**:
1. **Authentication** → **Logs** に移動
2. 最近のログを確認：
   - `/signup` リクエストの詳細
   - エラーメッセージがないか：
     - `Failed to send email`
     - `SMTP connection failed`
     - `Invalid redirect URL`
     - `Rate limit exceeded`

## 確認チェックリスト

- [x] **Confirm email** が有効になっている ✅（確認済み）
- [ ] **SMTP Settings** で **Enable custom SMTP** が有効になっている（確認が必要）
- [ ] すべてのSMTPフィールドが入力されている（確認が必要）
- [ ] リダイレクトURLが設定されている（確認が必要）

## 次のステップ

1. **SMTP Settings** タブに移動して、**Enable custom SMTP** が有効になっているか確認（最重要）
2. 無効の場合は、すべてのフィールドを入力して **Save changes** をクリック
3. リダイレクトURLが設定されているか確認
4. すべて確認後、サインアップを再試行
5. Resendダッシュボードの **Logs** を確認

## よくある問題

### 問題: SMTP設定が無効になっている

**症状**: 「Confirm email」が有効でも、メールが送信されない

**原因**: **Enable custom SMTP** が無効になっている

**解決策**:
1. **SMTP Settings** タブに移動
2. すべてのフィールドを入力
3. **Save changes** をクリック
4. **Enable custom SMTP** が自動的に有効になることを確認

## 重要

「Confirm email」が有効でも、**SMTP設定が無効だとメールは送信されません**。

まずは **SMTP Settings** タブで **Enable custom SMTP** が有効になっているか確認してください。

