# メールが届かない場合の包括的なデバッグガイド

## 問題: 正しく設定してもメールが届かない

SMTP設定が正しくても、メールが届かない場合、**他の設定や環境に問題が隠れている可能性**があります。

## 確認すべき項目（優先順位順）

### 1. Supabase Authentication Logsでエラーを確認（最重要）

1. Supabaseダッシュボードで **Authentication** → **Logs** に移動
2. 最近の `/signup` リクエストを確認
3. 以下のエラーがないか確認：
   - `Failed to send email`
   - `SMTP connection failed`
   - `Invalid SMTP configuration`
   - `Authentication failed`
   - `Connection timeout`

**確認ポイント**:
- エラーメッセージの内容を確認
- エラーが発生している時刻を確認
- エラーの詳細を確認

### 2. Mailgunダッシュボードでログを確認

1. [Mailgunダッシュボード](https://app.mailgun.com/)にログイン
2. **Logs** に移動
3. 最近のメール送信試行を確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか
   - ステータスが `sent` または `delivered` になっているか

**確認ポイント**:
- ✅ メール送信の試行が記録されている場合: Mailgun側は正常に動作している可能性が高い
- ❌ メール送信の試行が記録されていない場合: SupabaseからMailgunへの接続に問題がある

### 3. Supabase Email Auth設定を確認

1. Supabaseダッシュボードで **Authentication** → **Settings** → **Email Auth** に移動
2. 以下の設定を確認：

   **必須設定**:
   - ✅ **Enable email signup**: 有効になっているか
   - ✅ **Confirm email**: 有効になっているか（メール確認を必須にする）
   - ✅ **Secure email change**: 有効になっているか（推奨）

   **Email template**:
   - **Confirm signup** テンプレートが正しく設定されているか
   - `{{ .ConfirmationURL }}` が含まれているか

### 4. Supabase URL Configurationを確認

1. Supabaseダッシュボードで **Authentication** → **URL Configuration** に移動
2. 以下の設定を確認：

   **Site URL**:
   - 本番環境のURLが設定されているか（例: `https://www.skateright.io/`）
   - 末尾にスラッシュ（`/`）が含まれているか確認

   **Redirect URLs**:
   - 以下のURLが追加されているか：
     ```
     https://www.skateright.io/auth/callback
     https://www.skateright.io/**
     ```

### 5. Mailgunドメイン設定を確認

1. Mailgunダッシュボードで **Sending** → **Domain Settings** に移動
2. 使用しているドメインを確認：
   - **サンドボックスドメイン**を使用している場合: 認証済みのメールアドレスにのみ送信可能
   - **独自ドメイン**を使用している場合: ドメイン認証（SPF、DKIM、DMARC）が完了しているか

**サンドボックスドメインの制限**:
- Mailgunのサンドボックスドメイン（例: `sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）は、**認証済みのメールアドレスにのみ送信可能**です
- 認証済みでないメールアドレスには送信できません

**確認方法**:
1. Mailgunダッシュボードで **Sending** → **Authorized Recipients** に移動
2. 送信先のメールアドレスが認証済みか確認
3. 認証済みでない場合、メールアドレスを追加して認証

### 6. SMTP設定の再確認

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を確認：

   **Sender details**:
   - **Sender email address**: Mailgunのユーザー名と同じメールアドレスか
   - **Sender name**: 設定されているか

   **SMTP provider settings**:
   - **Host**: `smtp.mailgun.org` になっているか
   - **Port number**: `587` または `465` になっているか
   - **Username**: フルメールアドレス（例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）になっているか
   - **Password**: 正しく入力されているか（グレーアウトしていても問題なし）
   - **Enable custom SMTP**: 有効になっているか

### 7. メールボックスの確認

1. 送信先のメールアドレスを確認
2. **迷惑メールフォルダ**を確認
3. メールアドレスが正しいか確認（タイポがないか）
4. メールフィルタリング設定を確認

### 8. ブラウザの開発者ツールでネットワークリクエストを確認

1. ブラウザの開発者ツールを開く（F12）
2. **Network** タブを開く
3. サインアップを実行
4. `/auth/v1/signup` リクエストを確認：
   - ステータスコードが `200` か
   - レスポンスボディに `confirmation_sent_at` が含まれているか
   - エラーメッセージがないか

**確認ポイント**:
- `confirmation_sent_at` が設定されている場合: Supabaseはメール送信を試行した
- `confirmation_sent_at` が設定されていない場合: Supabaseがメール送信を試行していない

## よくある問題と解決策

### 問題1: Mailgunのサンドボックスドメインを使用している

**症状**: SMTP設定は正しいが、メールが届かない

**原因**: Mailgunのサンドボックスドメインは、認証済みのメールアドレスにのみ送信可能

**解決策**:
1. Mailgunダッシュボードで **Sending** → **Authorized Recipients** に移動
2. 送信先のメールアドレスを追加
3. 認証メールを確認して認証
4. 認証後、再度サインアップを実行

### 問題2: URL Configurationが正しく設定されていない

**症状**: メールは送信されるが、確認リンクが機能しない

**原因**: Site URLやRedirect URLsが正しく設定されていない

**解決策**:
1. **Site URL** を `https://www.skateright.io/` に設定
2. **Redirect URLs** に以下を追加：
   ```
   https://www.skateright.io/auth/callback
   https://www.skateright.io/**
   ```

### 問題3: Email Auth設定が無効になっている

**症状**: サインアップは成功するが、メールが送信されない

**原因**: **Confirm email** が無効になっている

**解決策**:
1. **Authentication** → **Settings** → **Email Auth** に移動
2. **Confirm email** を有効にする
3. 設定を保存

### 問題4: SMTP接続がタイムアウトしている

**症状**: Supabase Authentication Logsに `Connection timeout` エラーが表示される

**原因**: ポート番号やホスト名が間違っている、またはファイアウォールでブロックされている

**解決策**:
1. Port番号を `587` から `465` に変更してテスト
2. Host名が `smtp.mailgun.org` になっているか確認
3. ファイアウォール設定を確認

### 問題5: 認証エラー

**症状**: Supabase Authentication Logsに `Authentication failed` エラーが表示される

**原因**: UsernameまたはPasswordが間違っている

**解決策**:
1. Usernameがフルメールアドレスになっているか確認
2. Passwordが正しいか確認（Mailgunダッシュボードで再確認）
3. SMTP設定を再保存

## デバッグ手順（ステップバイステップ）

### Step 1: Supabase Authentication Logsを確認

1. Supabaseダッシュボードで **Authentication** → **Logs** に移動
2. 最近の `/signup` リクエストを確認
3. エラーメッセージがあれば、その内容を記録

### Step 2: Mailgun Logsを確認

1. Mailgunダッシュボードで **Logs** に移動
2. 最近のメール送信試行を確認
3. エラーメッセージがあれば、その内容を記録

### Step 3: ブラウザの開発者ツールで確認

1. ブラウザの開発者ツールを開く
2. **Network** タブを開く
3. サインアップを実行
4. `/auth/v1/signup` リクエストのレスポンスを確認
5. `confirmation_sent_at` が含まれているか確認

### Step 4: 設定を再確認

1. **Email Auth設定**を確認
2. **URL Configuration**を確認
3. **SMTP Settings**を確認
4. **Mailgunドメイン設定**を確認

### Step 5: テスト送信を実行

1. すべての設定を確認後、再度サインアップを実行
2. メールが届くか確認
3. まだ届かない場合、上記の手順を再度確認

## 確認チェックリスト

- [ ] Supabase Authentication Logsでエラーを確認した
- [ ] Mailgun Logsでメール送信試行を確認した
- [ ] Email Auth設定（Confirm email）が有効になっている
- [ ] URL Configuration（Site URL、Redirect URLs）が正しく設定されている
- [ ] Mailgunドメイン設定を確認した（サンドボックスドメインの制限を確認）
- [ ] SMTP設定が正しいか再確認した
- [ ] メールボックス（迷惑メールフォルダ）を確認した
- [ ] ブラウザの開発者ツールでネットワークリクエストを確認した

## 次のステップ

1. **Supabase Authentication Logs** と **Mailgun Logs** の内容を確認
2. エラーメッセージがあれば、その内容を共有してください
3. 上記の確認項目を順番に確認してください

## 重要

メールが届かない原因は、**SMTP設定以外にも隠れている可能性**があります。

**最も重要な確認項目**:
1. **Supabase Authentication Logs** でエラーを確認
2. **Mailgun Logs** でメール送信試行を確認
3. **Mailgunのサンドボックスドメイン制限**を確認（認証済みメールアドレスのみ送信可能）

これらの情報を確認することで、問題の原因を特定できます。

