# Resendにログがない場合の解決方法

## 問題: Resendダッシュボードにログが表示されない

Resendにログがない場合、SupabaseからResendへのメール送信リクエストが届いていません。これは、SMTP設定が正しく有効になっていない可能性が高いです。

## 解決手順

### 1. SupabaseダッシュボードでSMTP設定を確認

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **SMTP Settings** に移動
4. 以下を確認：

   **重要**: **Enable custom SMTP** が有効になっているか確認
   
   - ✅ 有効になっている場合: 次のステップへ
   - ❌ 無効になっている場合: 以下を確認

### 2. SMTP設定が無効になっている場合の対処

**Enable custom SMTP** が無効になっている場合、以下の原因が考えられます：

#### 原因1: すべてのフィールドが入力されていない

Supabaseは、すべてのフィールドが入力されていないとSMTP設定を有効にできません。

**確認項目**:
- ✅ **Sender email address**: 入力されているか（例: `noreply@resend.dev`）
- ✅ **Sender name**: 入力されているか（例: `Skateright`）
- ✅ **Host**: `smtp.resend.com` が入力されているか
- ✅ **Port number**: `587` が入力されているか
- ✅ **Username**: `resend` が入力されているか
- ✅ **Password**: ResendのAPIキーが入力されているか

**解決策**:
1. すべてのフィールドを入力
2. **Save changes** をクリック
3. ページをリロード
4. **Enable custom SMTP** が有効になっているか確認

#### 原因2: SMTP設定の保存に失敗している

**解決策**:
1. すべてのフィールドを再入力
2. **Save changes** をクリック
3. 保存が成功したことを確認（エラーメッセージがないか確認）
4. ページをリロードして設定が保存されているか確認

### 3. SMTP設定の再設定（推奨）

念のため、SMTP設定を一度クリアして再設定することをお勧めします：

1. **Authentication** → **Settings** → **SMTP Settings** に移動
2. すべてのフィールドを確認・再入力：

   **Sender details**:
   - **Sender email address**: `noreply@resend.dev`（テストドメインの場合）
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.resend.com`
   - **Port number**: `587`
   - **Username**: `resend`
   - **Password**: ResendのAPIキー（`re_it6bQBLJ_Kh3Rcqky9WzVdud9YRwm1F9Z`）
   - **Minimum interval per user**: `60`

3. **Save changes** をクリック
4. **Enable custom SMTP** が自動的に有効になることを確認

### 4. Supabase Authentication Logsでエラーを確認

1. **Authentication** → **Logs** に移動
2. 最近のログを確認：
   - `/signup` リクエストの詳細
   - `Failed to send email` エラーがないか
   - `SMTP connection failed` エラーがないか
   - `Invalid SMTP configuration` エラーがないか

### 5. メール認証設定の確認

1. **Authentication** → **Settings** → **Email Auth** に移動
2. 以下の設定を確認：
   - ✅ **Enable email signup**: 有効
   - ✅ **Confirm email**: 有効（メール確認を必須にする）

### 6. リダイレクトURLの確認

1. **Authentication** → **URL Configuration** に移動
2. **Site URL** が設定されているか確認
3. **Redirect URLs** に以下が追加されているか確認：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

## 確認チェックリスト

- [ ] **Enable custom SMTP** が有効になっている
- [ ] すべてのSMTPフィールドが入力されている
- [ ] **Save changes** をクリックして保存した
- [ ] ページをリロードして設定が保存されていることを確認した
- [ ] **Confirm email** が有効になっている
- [ ] リダイレクトURLが設定されている

## テスト手順

1. SMTP設定を保存後、数分待つ
2. アプリでサインアップを実行
3. Resendダッシュボードの **Logs** を確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか
4. Supabaseダッシュボードの **Authentication** → **Logs** を確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

## それでも解決しない場合

1. **SupabaseダッシュボードのAuthentication Logs** の内容を確認
2. エラーメッセージがあれば、その内容を共有してください
3. SMTP設定のスクリーンショットを共有してください（APIキーは隠してください）

