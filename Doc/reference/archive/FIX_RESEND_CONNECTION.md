# Resendにログが表示されない場合の解決方法

## 問題: Resendにログが表示されない

`confirmation_sent_at` が設定されているにもかかわらず、Resendにログが表示されない場合、**SupabaseからResendへの接続に問題がある**可能性が高いです。

## 原因の特定

### 考えられる原因

1. **SMTP設定が正しく保存されていない**
2. **ResendのAPIキーが間違っている**
3. **SMTP接続に失敗している**
4. **Enable custom SMTPが実際には有効になっていない**

## 解決手順

### 1. SMTP設定を完全に再設定（推奨）

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. すべてのフィールドを一度クリア
3. 以下を再入力：

   **Sender details**:
   - **Sender email address**: `noreply@resend.dev`
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.resend.com`
   - **Port number**: `587`
   - **Username**: `resend`
   - **Password**: ResendのAPIキー（`re_it6bQBLJ_Kh3Rcqky9WzVdud9YRwm1F9Z`）
   - **Minimum interval per user**: `60`

4. **Save changes** をクリック
5. ページをリロード
6. **Enable custom SMTP** が有効になっているか確認

### 2. ResendのAPIキーを再確認

1. [Resendダッシュボード](https://resend.com/)にログイン
2. **API Keys** に移動
3. APIキーが有効か確認：
   - APIキーが削除されていないか
   - `Sending access` 権限があるか
4. 必要に応じて新しいAPIキーを作成
5. SupabaseのSMTP設定で新しいAPIキーを入力

### 3. SMTP設定のテスト

1. Supabaseダッシュボードで **SMTP Settings** に移動
2. 設定を保存後、数分待つ
3. アプリでサインアップを実行
4. Resendダッシュボードの **Logs** を確認

### 4. 別のSMTPサービスでテスト（オプション）

Resendで問題が解決しない場合、別のSMTPサービスでテスト：

**SendGrid**:
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **Username**: `apikey`
- **Password**: SendGridのAPIキー

**Mailgun**:
- **Host**: `smtp.mailgun.org`
- **Port**: `587`
- **Username**: `postmaster@yourdomain.mailgun.org`
- **Password**: Mailgunのパスワード

## 確認チェックリスト

- [ ] すべてのSMTPフィールドが正しく入力されている
- [ ] **Save changes** をクリックして保存した
- [ ] ページをリロードして設定が保存されていることを確認した
- [ ] **Enable custom SMTP** が有効になっている
- [ ] ResendのAPIキーが正しい
- [ ] ResendのAPIキーに `Sending access` 権限がある

## トラブルシューティング

### 問題1: SMTP設定を保存してもログが表示されない

**解決策**:
1. ブラウザのキャッシュをクリア
2. 別のブラウザでSupabaseダッシュボードにログイン
3. SMTP設定を再確認

### 問題2: ResendのAPIキーが間違っている

**解決策**:
1. Resendダッシュボードで新しいAPIキーを作成
2. SupabaseのSMTP設定で新しいAPIキーを入力
3. **Save changes** をクリック

### 問題3: SMTP接続がタイムアウトしている

**解決策**:
1. ポート番号を `587` から `465` に変更してテスト
2. ファイアウォールやネットワーク設定を確認

## 次のステップ

1. **SMTP設定を完全に再設定**（推奨）
2. **ResendのAPIキーを再確認**
3. 設定を保存後、サインアップを再試行
4. Resendダッシュボードの **Logs** を確認

## 重要

`confirmation_sent_at` が設定されているにもかかわらず、Resendにログが表示されない場合、**SupabaseからResendへの接続に問題がある**可能性が高いです。

**SMTP設定を完全に再設定**して、**ResendのAPIキーを再確認**してください。

