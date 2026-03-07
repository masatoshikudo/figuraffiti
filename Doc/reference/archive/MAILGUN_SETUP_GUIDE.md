# Mailgun SMTP設定ガイド（Supabase）

## MailgunのSMTP設定情報

Mailgunから提供された情報：
- **Host**: `smtp.mailgun.org`
- **Ports**: `25`, `587`, `2525`, `465` (SSL/TLS)
- **Username**: フルメールアドレス（例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
- **Password**: Mailgunのパスワード

## Supabaseでの設定手順

### Step 1: MailgunのSMTP認証情報を取得

1. [Mailgunダッシュボード](https://app.mailgun.com/)にログイン
2. サイドバーから **Sending** → **Domain Settings** に移動
3. ドメインのドロップダウンから使用するドメインを選択（サンドボックスドメインまたは独自ドメイン）
4. **SMTP Credentials** タブを選択
5. 以下の情報を確認：
   - **SMTP hostname**: `smtp.mailgun.org`
   - **Port**: `587`（推奨）、`465`（TLS）、`2525`、または `25`
   - **Username**: SMTP認証情報のユーザー名（フルメールアドレス形式、例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
   - **Password**: SMTP認証情報のパスワード

**重要**: SMTP認証情報はドメインごとに設定されます。**SMTP Credentials** タブで確認できるユーザー名とパスワードを使用してください。

### Step 2: Supabaseダッシュボードで設定

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Settings** → **SMTP Settings** に移動
4. 以下を入力：

   **Sender details**:
   - **Sender email address**: Mailgunのユーザー名と同じメールアドレス（例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
   - **Sender name**: `Skateright`

   **SMTP provider settings**:
   - **Host**: `smtp.mailgun.org`
   - **Port number**: `587`（推奨）または `465`（SSL/TLS）
   - **Username**: フルメールアドレス（例: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`）
   - **Password**: Mailgunのパスワード
   - **Minimum interval per user**: `60`

5. **Save changes** をクリック
6. **Enable custom SMTP** が自動的に有効になることを確認

**注意**: パスワードを入力すると、以下のアラートが表示される場合があります：
> "Rate limit for sending emails will be increased to 30 and can be adjusted after enabling custom SMTP"

これは**正常な動作**です。SupabaseがSMTP設定を認識し、カスタムSMTPを有効にするとメール送信のレート制限が30に増加することを通知しています。このアラートは問題ではありません。

**パスワードフィールドがグレーアウトしている場合**:
ページをリロードすると、パスワードフィールドがグレーアウト（無効化）されて表示されることがあります。これは**Supabaseのセキュリティ機能**で、保存されたパスワードを再表示しないための仕様です。これは**正常な動作**です。

- ✅ パスワードは正しく保存されています
- ✅ SMTP設定は有効になっています
- ✅ メール送信は正常に動作します

パスワードを変更したい場合は、新しいパスワードを入力して再度 **Save changes** をクリックしてください。

### Step 3: 設定の確認

1. ページをリロードして設定が保存されていることを確認
2. **Enable custom SMTP** が有効になっていることを確認
3. すべてのフィールドが正しく入力されていることを確認

### Step 4: テスト送信

1. アプリでサインアップを実行
2. メールボックスを確認（迷惑メールフォルダも確認）
3. Mailgunダッシュボードの **Logs** でメール送信状況を確認

## 重要なポイント

### Usernameについて

Mailgunの**UsernameはSMTP Credentialsタブで確認できる値**を使用します：
- ✅ 正しい: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`（SMTP Credentialsタブに表示される値）
- ❌ 間違い: `brad` や `sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`（不完全な形式）

**重要**: **Sending** → **Domain Settings** → **SMTP Credentials** タブで確認できる**正確なユーザー名**を使用してください。これは通常、フルメールアドレス形式です。

### Port番号について

MailgunのSMTPサーバーは以下のポートでリッスンしています：

| **Port** | **要件** | **推奨** |
| --- | --- | --- |
| **587** | 非TLS接続が必要だが、STARTTLSコマンドでTLSにアップグレード可能 | ✅ **推奨** |
| **465** | TLS接続が必要（SSL/TLS） | 一部の環境で必要 |
| **2525** | 非TLS接続が必要だが、STARTTLSコマンドでTLSにアップグレード可能 | Google Compute Engineで使用 |
| **25** | 非TLS接続が必要だが、STARTTLSコマンドでTLSにアップグレード可能 | 多くのISPでブロックされているため非推奨 |

**推奨**: ポート **587** を使用してください。ほとんどの環境で動作し、STARTTLSでTLSに自動的にアップグレードされます。

### Sender email addressについて

**Sender email address** は、**Usernameと同じメールアドレス**を使用します：
- Username: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`
- Sender email address: `brad@sandbox09bdcc4e52c0437a9a382bd8db10dd60.mailgun.org`

## トラブルシューティング

### 問題1: SMTP接続エラー

**確認項目**:
- Hostが `smtp.mailgun.org` になっているか
- Port番号が `587` または `465` になっているか
- Usernameがフルメールアドレスになっているか

**解決策**:
1. Port番号を `587` から `465` に変更してテスト
2. Usernameをフルメールアドレスに変更

### 問題2: 認証エラー

**確認項目**:
- Usernameがフルメールアドレスになっているか
- Passwordが正しいか

**解決策**:
1. Mailgunダッシュボードでパスワードを再確認
2. Usernameをフルメールアドレスに変更

### 問題3: メールが届かない

**確認項目**:
- Mailgunダッシュボードの **Logs** でメール送信状況を確認
- Supabaseダッシュボードの **Authentication** → **Logs** でエラーを確認

**解決策**:
1. Mailgunのログでエラーメッセージを確認
2. Supabaseのログでエラーメッセージを確認
3. SMTP設定を再確認

## 確認チェックリスト

- [ ] MailgunダッシュボードでSMTP認証情報を確認した
- [ ] Usernameがフルメールアドレスになっている
- [ ] Passwordが正しく入力されている
- [ ] Hostが `smtp.mailgun.org` になっている
- [ ] Port番号が `587` または `465` になっている
- [ ] Sender email addressがUsernameと同じメールアドレスになっている
- [ ] **Save changes** をクリックして保存した
- [ ] **Enable custom SMTP** が有効になっている

## 次のステップ

1. **MailgunダッシュボードでSMTP認証情報を確認**
2. **SupabaseのSMTP Settingsで設定**
3. **テスト送信を実行**
4. **メールが届くことを確認**

## 参考リンク

- [Mailgun公式サイト](https://www.mailgun.com/)
- [Mailgun SMTP設定](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [Mailgunダッシュボード](https://app.mailgun.com/)

