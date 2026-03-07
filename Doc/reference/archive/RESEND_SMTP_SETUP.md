# Resendを使用したSMTP設定ガイド

## Resendのアカウント作成と設定

### 1. Resendアカウントの作成

1. [Resend](https://resend.com/)にアクセス
2. **Sign Up**をクリックしてアカウントを作成
3. メールアドレスで確認

### 2. APIキーの取得

1. Resendダッシュボードにログイン
2. **API Keys**に移動
3. **Create API Key**をクリック
4. **Name**を入力（例: `Skateright SMTP`）
5. **Permission**で`Sending access`を選択
6. **Add API Key**をクリック
7. **API Key**をコピー（一度しか表示されません！）

### 3. ドメインの追加と検証（重要）

Resendでメールを送信するには、ドメインの検証が必要です。

#### オプション1: 独自ドメインを使用する場合

1. Resendダッシュボードで**Domains**に移動
2. **Add Domain**をクリック
3. ドメイン名を入力（例: `yourdomain.com`）
4. Resendが提供するDNSレコードをドメインのDNS設定に追加：
   - **SPFレコード**: `v=spf1 include:resend.com ~all`
   - **DKIMレコード**: Resendが提供する値
   - **DMARCレコード**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
5. DNS設定の反映を待つ（数分〜数時間）
6. Resendダッシュボードで**Verify**をクリックして検証

#### オプション2: Resendのテストドメインを使用する場合（開発・テスト用）

1. Resendダッシュボードで**Domains**に移動
2. **resend.dev**ドメインが自動的に利用可能
3. 送信者メールアドレスに`noreply@resend.dev`を使用可能

**注意**: `resend.dev`ドメインはテスト用で、本番環境では独自ドメインの使用を推奨します。

### 4. Supabaseダッシュボードでの設定

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **SMTP Settings**に移動
4. 以下の値を入力：

   **Sender details**:
   - **Sender email address**: 
     - 独自ドメインの場合: `noreply@yourdomain.com`
     - テストドメインの場合: `noreply@resend.dev`
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.resend.com`
   - **Port number**: `587`（推奨）または`465`
   - **Username**: `resend`
   - **Password**: Resendで取得したAPIキーを貼り付け
   - **Minimum interval per user**: `60`（デフォルト）

5. **Save changes**をクリック
6. **Enable custom SMTP**が自動的に有効になることを確認

### 5. リダイレクトURLの設定

SMTP設定と合わせて、リダイレクトURLも設定してください：

1. **Authentication** → **URL Configuration**に移動
2. **Site URL**を設定：
   - 本番環境: `https://your-domain.vercel.app` または `https://yourdomain.com`
3. **Redirect URLs**に以下を追加：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

### 6. テスト

1. アプリでサインアップを実行
2. メールボックスを確認（迷惑メールフォルダも確認）
3. メールが届かない場合：
   - Supabaseダッシュボードの**Authentication** → **Logs**でエラーを確認
   - Resendダッシュボードの**Logs**でメール送信状況を確認

## トラブルシューティング

### メールが届かない場合

1. **Resendダッシュボードで確認**:
   - **Logs**でメール送信状況を確認
   - エラーがないか確認

2. **Supabaseダッシュボードで確認**:
   - **Authentication** → **Logs**でエラーを確認
   - SMTP設定が正しいか確認

3. **DNS設定の確認**:
   - 独自ドメインを使用している場合、DNSレコードが正しく設定されているか確認
   - DNS設定の反映には時間がかかる場合があります

4. **APIキーの確認**:
   - ResendのAPIキーが正しくコピーされているか確認
   - APIキーに`Sending access`権限があるか確認

## Resendの無料プラン制限

- **1日100通まで**メールを送信可能
- 制限に達すると、翌日まで送信できません
- 本番環境で大量のメールを送信する場合は、有料プランを検討してください

## 参考リンク

- [Resend公式サイト](https://resend.com/)
- [Resendドキュメント](https://resend.com/docs)
- [Resend API Keys](https://resend.com/api-keys)
- [Resend Domains](https://resend.com/domains)

