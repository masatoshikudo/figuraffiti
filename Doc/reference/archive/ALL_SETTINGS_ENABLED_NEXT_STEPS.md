# すべての設定が有効になっている場合の次のステップ

## ✅ 確認済みの設定

- [x] **Confirm email** が有効になっている ✅
- [x] SMTP設定が正しく入力されている ✅
- [x] **Enable custom SMTP** が有効になっている ✅

すべての基本設定が正しく行われています。それでもメールが届かない場合、次に確認すべき点があります。

## 次に確認すべき設定

### 1. リダイレクトURLの設定（重要）

リダイレクトURLが設定されていない場合、メール送信がブロックされる可能性があります。

**確認手順**:
1. Supabaseダッシュボードで **Authentication** → **URL Configuration** に移動
2. 以下を確認：
   - ✅ **Site URL** が設定されているか（例: `https://your-domain.vercel.app`）
   - ✅ **Redirect URLs** に以下が追加されているか：
     ```
     https://your-domain.vercel.app/auth/callback
     https://your-domain.vercel.app/**
     ```

**重要**: リダイレクトURLが設定されていない場合、Supabaseはメール送信をブロックする可能性があります。

### 2. Supabase Authentication Logsでエラーを確認

**確認手順**:
1. **Authentication** → **Logs** に移動
2. 最近のログを確認：
   - `/signup` リクエストの詳細
   - エラーメッセージがないか：
     - `Failed to send email`
     - `SMTP connection failed`
     - `Invalid redirect URL`
     - `Rate limit exceeded`
     - `Email rate limit exceeded`

### 3. Resendダッシュボードでログを確認

**確認手順**:
1. [Resendダッシュボード](https://resend.com/)にログイン
2. **Logs** に移動
3. 最近のログを確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

### 4. 実際にサインアップを試してログを確認

1. アプリでサインアップを実行
2. すぐにSupabaseダッシュボードの **Authentication** → **Logs** を確認
3. すぐにResendダッシュボードの **Logs** を確認
4. エラーメッセージがあれば、その内容を確認

## よくある問題

### 問題1: リダイレクトURLが設定されていない

**症状**: すべての設定が有効でも、メールが送信されない

**原因**: リダイレクトURLが設定されていない

**解決策**:
1. **Authentication** → **URL Configuration** に移動
2. **Site URL** を設定（例: `https://your-domain.vercel.app`）
3. **Redirect URLs** に以下を追加：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

### 問題2: レート制限に達している

**症状**: Supabaseのログに `Rate limit exceeded` エラー

**原因**: メール送信のレート制限に達している

**解決策**:
1. しばらく待ってから再試行
2. Resendの無料プランは1日100通まで
3. 制限に達している場合は翌日まで待つ

### 問題3: SMTP接続エラー

**症状**: Supabaseのログに `SMTP connection failed` エラー

**原因**: Resendへの接続に失敗している

**解決策**:
1. ResendのAPIキーが正しいか確認
2. ResendダッシュボードでAPIキーが有効か確認
3. SMTP設定を再入力して保存

## 確認チェックリスト

- [x] **Confirm email** が有効になっている ✅
- [x] SMTP設定が正しく入力されている ✅
- [x] **Enable custom SMTP** が有効になっている ✅
- [ ] リダイレクトURLが設定されている（確認が必要）
- [ ] Supabase Authentication Logsでエラーを確認（確認が必要）
- [ ] Resendダッシュボードでログを確認（確認が必要）

## 次のステップ

1. **リダイレクトURLが設定されているか確認**（重要）
2. アプリでサインアップを実行
3. **すぐに** Supabaseダッシュボードの **Authentication** → **Logs** を確認
4. **すぐに** Resendダッシュボードの **Logs** を確認
5. エラーメッセージがあれば、その内容を共有してください

## 重要

すべての設定が正しく行われていても、**リダイレクトURLが設定されていないとメール送信がブロックされる可能性があります**。

まずは **リダイレクトURLが設定されているか確認**してください。

