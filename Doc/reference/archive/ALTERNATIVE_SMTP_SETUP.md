# Resend以外のSMTPサービス設定ガイド

## 対応しているSMTPサービス

Supabaseは、以下のSMTPサービスに対応しています：

1. **SendGrid**（推奨）
2. **Mailgun**
3. **AWS SES**
4. **Gmail SMTP**
5. **その他のSMTPサービス**

---

## 1. SendGrid（推奨）

### 特徴
- 無料プランあり（1日100通まで）
- 設定が簡単
- 高い配信率

### 設定手順

#### Step 1: SendGridアカウント作成

1. [SendGrid](https://sendgrid.com/)にアクセス
2. アカウントを作成
3. メールアドレスを確認

#### Step 2: APIキーの作成

1. SendGridダッシュボードにログイン
2. **Settings** → **API Keys** に移動
3. **Create API Key** をクリック
4. **API Key Name**: `Supabase SMTP` を入力
5. **API Key Permissions**: **Full Access** を選択
6. **Create & View** をクリック
7. **APIキーをコピー**（一度しか表示されません）

#### Step 3: Supabaseでの設定

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を入力：

   **Sender details**:
   - **Sender email address**: SendGridで認証済みのメールアドレス（例: `noreply@yourdomain.com`）
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.sendgrid.net`
   - **Port number**: `587`
   - **Username**: `apikey`
   - **Password**: SendGridのAPIキー（`SG.xxxxx` で始まる）
   - **Minimum interval per user**: `60`

3. **Save changes** をクリック
4. **Enable custom SMTP** が有効になることを確認

---

## 2. Mailgun

### 特徴
- 無料プランあり（1ヶ月5,000通まで）
- 開発者向け
- 高い配信率

### 設定手順

#### Step 1: Mailgunアカウント作成

1. [Mailgun](https://www.mailgun.com/)にアクセス
2. アカウントを作成
3. ドメインを追加（またはサンドボックスドメインを使用）

#### Step 2: SMTP認証情報の取得

1. Mailgunダッシュボードにログイン
2. **Sending** → **Domain Settings** に移動
3. 使用するドメインを選択
4. **SMTP credentials** セクションを確認：
   - **SMTP hostname**: `smtp.mailgun.org`
   - **Port**: `587`
   - **Username**: `postmaster@yourdomain.mailgun.org`
   - **Password**: Mailgunのパスワード

#### Step 3: Supabaseでの設定

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を入力：

   **Sender details**:
   - **Sender email address**: Mailgunで認証済みのメールアドレス（例: `noreply@yourdomain.mailgun.org`）
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.mailgun.org`
   - **Port number**: `587`
   - **Username**: `postmaster@yourdomain.mailgun.org`
   - **Password**: Mailgunのパスワード
   - **Minimum interval per user**: `60`

3. **Save changes** をクリック
4. **Enable custom SMTP** が有効になることを確認

---

## 3. AWS SES

### 特徴
- 低コスト（1,000通あたり$0.10）
- 高い信頼性
- 設定がやや複雑

### 設定手順

#### Step 1: AWS SESの設定

1. [AWS Console](https://console.aws.amazon.com/)にログイン
2. **SES** サービスを選択
3. **Verified identities** でメールアドレスまたはドメインを認証
4. **SMTP settings** でSMTP認証情報を作成

#### Step 2: SMTP認証情報の取得

1. **SMTP settings** に移動
2. **Create SMTP credentials** をクリック
3. IAMユーザー名を入力
4. **Create** をクリック
5. **SMTP username** と **SMTP password** をコピー

#### Step 3: Supabaseでの設定

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を入力：

   **Sender details**:
   - **Sender email address**: AWS SESで認証済みのメールアドレス
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `email-smtp.{region}.amazonaws.com`（例: `email-smtp.us-east-1.amazonaws.com`）
   - **Port number**: `587`
   - **Username**: AWS SESのSMTP username
   - **Password**: AWS SESのSMTP password
   - **Minimum interval per user**: `60`

3. **Save changes** をクリック
4. **Enable custom SMTP** が有効になることを確認

---

## 4. Gmail SMTP

### 特徴
- 無料
- 設定が簡単
- 1日500通まで（制限あり）

### 設定手順

#### Step 1: Gmailアプリパスワードの作成

1. Googleアカウントにログイン
2. **セキュリティ** に移動
3. **2段階認証プロセス** を有効化（必須）
4. **アプリパスワード** をクリック
5. **アプリを選択**: `メール` を選択
6. **デバイスを選択**: `その他（カスタム名）` を選択し、`Supabase` と入力
7. **生成** をクリック
8. **16文字のパスワードをコピー**

#### Step 2: Supabaseでの設定

1. Supabaseダッシュボードで **Authentication** → **Settings** → **SMTP Settings** に移動
2. 以下を入力：

   **Sender details**:
   - **Sender email address**: Gmailアドレス（例: `yourname@gmail.com`）
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.gmail.com`
   - **Port number**: `587`
   - **Username**: Gmailアドレス（例: `yourname@gmail.com`）
   - **Password**: アプリパスワード（16文字）
   - **Minimum interval per user**: `60`

3. **Save changes** をクリック
4. **Enable custom SMTP** が有効になることを確認

---

## 5. その他のSMTPサービス

### 一般的なSMTP設定

以下のSMTPサービスも使用可能です：

- **Postmark**
- **SparkPost**
- **Mailjet**
- **Zoho Mail**
- **Outlook/Hotmail SMTP**

各サービスのSMTP設定情報を確認し、SupabaseのSMTP Settingsに入力してください。

---

## 設定後の確認

### 1. SMTP設定の確認

1. Supabaseダッシュボードで **SMTP Settings** を確認
2. **Enable custom SMTP** が有効になっているか確認
3. すべてのフィールドが正しく入力されているか確認

### 2. テスト送信

1. アプリでサインアップを実行
2. メールが届くか確認
3. 迷惑メールフォルダも確認

### 3. ログの確認

1. 使用しているSMTPサービスのダッシュボードでログを確認
2. Supabaseダッシュボードの **Authentication** → **Logs** でエラーを確認

---

## トラブルシューティング

### 問題1: メールが届かない

**確認項目**:
- SMTP設定が正しいか
- 送信者メールアドレスが認証済みか
- ポート番号が正しいか（通常は `587`）
- 認証情報が正しいか

**解決策**:
1. SMTP設定を再確認
2. テスト送信を実行
3. SMTPサービスのログを確認

### 問題2: SMTP接続エラー

**確認項目**:
- ホスト名が正しいか
- ポート番号が正しいか
- ファイアウォールでブロックされていないか

**解決策**:
1. ポート番号を `587` から `465` に変更してテスト
2. SMTPサービスのドキュメントを確認

### 問題3: 認証エラー

**確認項目**:
- ユーザー名が正しいか
- パスワードが正しいか
- アプリパスワードを使用しているか（Gmailの場合）

**解決策**:
1. 認証情報を再確認
2. 新しい認証情報を生成して再設定

---

## 推奨設定

### 本番環境

- **SendGrid** または **Mailgun** を推奨
- 独自ドメインを使用
- ドメイン認証（SPF、DKIM、DMARC）を設定

### 開発環境

- **Gmail SMTP** または **SendGridの無料プラン** を推奨
- テスト用メールアドレスを使用

---

## 次のステップ

1. **使用するSMTPサービスを選択**
2. **アカウントを作成し、認証情報を取得**
3. **SupabaseのSMTP Settingsで設定**
4. **テスト送信を実行**
5. **メールが届くことを確認**

---

## 重要

- **送信者メールアドレスは、使用するSMTPサービスで認証済みである必要があります**
- **ポート番号は通常 `587`（TLS）または `465`（SSL）を使用します**
- **Gmailを使用する場合、アプリパスワードが必要です（通常のパスワードでは動作しません）**

