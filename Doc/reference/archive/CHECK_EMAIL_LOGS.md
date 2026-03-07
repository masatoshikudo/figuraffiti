# メール送信ログの確認方法

## 現在のログについて

表示されているログ：
```
/admin/oauth/clients | request completed
/signup | request completed
apiworker: template cache worker started
DEPRECATION NOTICE: GOTRUE_JWT_DEFAULT_GROUP_NAME not supported by Supabase's GoTrue, will be removed soon
apiworker: config notifier exited
```

このログだけでは、メール送信に関する情報が不足しています。

## 確認すべきログ

### 1. Supabase Authentication Logs（最重要）

**確認場所**: Supabaseダッシュボード → **Authentication** → **Logs**

ここで確認すべき情報：
- サインアップリクエストの詳細
- メール送信の試行記録
- SMTPエラー
- リダイレクトURLエラー

**確認方法**:
1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左メニューから **Authentication** をクリック
4. **Logs** タブをクリック
5. 最近のログを確認：
   - `/signup` リクエストの詳細を確認
   - エラーメッセージがないか確認
   - メール送信の試行が記録されているか確認

**探すべきエラー**:
- `Failed to send email`
- `SMTP connection failed`
- `Invalid redirect URL`
- `Rate limit exceeded`

### 2. Resendダッシュボードのログ

**確認場所**: [Resendダッシュボード](https://resend.com/) → **Logs**

ここで確認すべき情報：
- SupabaseからResendへのメール送信リクエスト
- メール送信の成功/失敗
- エラーメッセージ

**確認方法**:
1. [Resendダッシュボード](https://resend.com/)にログイン
2. 左メニューから **Logs** をクリック
3. 最近のログを確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

**期待される結果**:
- メール送信の試行が記録されている場合: Resend側は正常に動作している
- メール送信の試行が記録されていない場合: SupabaseからResendへの接続に問題がある可能性

### 3. ブラウザのコンソールログ

**確認方法**:
1. ブラウザの開発者ツールを開く（F12）
2. **Console**タブを確認
3. エラーメッセージがないか確認

### 4. ネットワークタブでリクエストを確認

**確認方法**:
1. ブラウザの開発者ツールを開く（F12）
2. **Network**タブを確認
3. `/signup`リクエストをクリック
4. **Response**タブでレスポンスを確認：
   - エラーメッセージがないか
   - `user`オブジェクトが返されているか
   - `session`が`null`になっているか（メール確認が必要な場合）

## ログの見方

### 正常な場合のログ

**Supabase Authentication Logs**:
- `/signup`リクエストが成功
- `Email sent`または`Confirmation email sent`のメッセージ

**Resend Logs**:
- メール送信の試行が記録されている
- ステータスが`delivered`または`sent`

### エラーがある場合のログ

**Supabase Authentication Logs**:
- `Failed to send email`エラー
- `SMTP connection failed`エラー
- `Invalid redirect URL`エラー

**Resend Logs**:
- メール送信の試行が記録されていない
- エラーメッセージが表示されている

## 次のステップ

1. **SupabaseダッシュボードのAuthentication Logsを確認**（最重要）
2. **ResendダッシュボードのLogsを確認**
3. エラーメッセージがあれば、その内容を共有してください

現在のログだけでは判断できないため、上記のログを確認してください。

