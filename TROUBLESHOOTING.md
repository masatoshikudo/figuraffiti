# トラブルシューティングガイド

## よくある問題と解決方法

### データベース関連

#### `address`カラムが見つからない

**エラー**: `Could not find the 'address' column of 'spots' in the schema cache`

**解決方法**:
1. Supabase SQL Editorで以下を実行：
   ```sql
   ALTER TABLE spots ADD COLUMN IF NOT EXISTS address TEXT;
   ```
2. スキーマキャッシュをリフレッシュ：
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### メール関連

#### メールが送信されない

**確認項目**:
1. Supabaseダッシュボード → **Settings** → **Auth** → **SMTP Settings** で設定が完了しているか
2. MailgunのAPIキーとドメインが正しく設定されているか
3. Edge FunctionのSecretsに`MAILGUN_API_KEY`と`MAILGUN_DOMAIN`が設定されているか

### Edge Functions関連

#### Edge Functionが404エラーを返す

**原因**: Edge Functionがデプロイされていない

**解決方法**:
```bash
npx supabase functions deploy FUNCTION_NAME --project-ref YOUR_PROJECT_REF
```

### 環境変数関連

#### `.env.local`のパースエラー

**エラー**: `failed to parse environment file: .env.local`

**解決方法**:
1. `.env.local`ファイルを確認
2. 変数名に改行や特殊文字が含まれていないか確認
3. 各行が正しく終わっているか確認（改行が1つだけ）

### Vercelデプロイ関連

#### ビルドエラー

**確認項目**:
1. 環境変数が正しく設定されているか
2. `package.json`に`next`が含まれているか
3. Root Directoryが正しく設定されているか（空でOK）

## ログの確認方法

### Vercelのログ

Vercelダッシュボード → **Functions** → 各Function → **Logs**

### Supabase Edge Functionsのログ

Supabaseダッシュボード → **Edge Functions** → 各Function → **Logs**

### ブラウザのコンソール

開発者ツール（F12）→ **Console**タブ

### 記録作成エラー

**エラー**: `Failed to create spot` または `Failed to create media`

**確認項目**:
1. Vercelのログで詳細なエラーメッセージを確認
2. RLSポリシーが正しく設定されているか確認
3. 認証が正しく行われているか確認（`auth.uid()`が設定されているか）
4. データベースのスキーマが最新か確認（マイグレーションが適用されているか）

**よくある原因**:
- `address`カラムが見つからない → スキーマキャッシュをリフレッシュ
- RLSポリシーエラー → `supabase/migrations/20250120000001_require_auth_for_submission.sql`を確認
- 認証エラー → ログイン状態を確認

### メール送信の詳細デバッグ

**確認手順**:
1. Supabaseダッシュボード → **Authentication** → **Logs** で認証ログを確認
2. Mailgunダッシュボード → **Logs** でメール送信ログを確認
3. Edge Functionsのログでエラーがないか確認
4. ブラウザの開発者ツール → **Network** タブでAPIレスポンスを確認

**よくある問題**:
- Mailgunのサンドボックスドメインは、認証済みの受信者のみに送信可能
- SMTP設定のパスワードが正しくない
- Edge FunctionのSecretsが設定されていない

## サポート

問題が解決しない場合は、エラーメッセージとログを確認して、具体的な原因を特定してください。

