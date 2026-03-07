# メール送信に関するログの見つけ方

## 現在のログについて

表示されているログ：
```
GET /auth/v1/admin/oauth/clients?page=1&per_page=100 | 404
```

このログは**メール送信とは関係ありません**。これはOAuthクライアント管理APIへのリクエストで、404エラーが返されています。

## メール送信に関するログを確認する方法

### 1. Supabase Authentication Logsで確認

**確認場所**: Supabaseダッシュボード → **Authentication** → **Logs**

**探すべきログ**:
- `/auth/v1/signup` - サインアップリクエスト
- `/auth/v1/verify` - メール確認リクエスト
- `Email sent` - メール送信成功
- `Failed to send email` - メール送信失敗

**確認方法**:
1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左メニューから **Authentication** をクリック
4. **Logs** タブをクリック
5. 最近のログを確認：
   - `/signup` で検索
   - `email` で検索
   - `SMTP` で検索

### 2. ログのフィルタリング

**Authentication Logs** で以下のフィルターを使用：

- **Event Type**: `signup` または `email`
- **Status**: `success` または `error`
- **Time Range**: 最近1時間または24時間

### 3. メール送信に関するログの例

**正常な場合**:
```
POST /auth/v1/signup | 200
Email sent to user@example.com
```

**エラーの場合**:
```
POST /auth/v1/signup | 200
Failed to send email: SMTP connection failed
```

または

```
POST /auth/v1/signup | 200
Failed to send email: Invalid redirect URL
```

### 4. 実際にサインアップを試してログを確認

1. アプリ（`https://www.skateright.io`）でサインアップを実行
2. **すぐに** Supabaseダッシュボードの **Authentication** → **Logs** を確認
3. 最近のログで `/signup` を探す
4. エラーメッセージがないか確認

### 5. Resendダッシュボードでログを確認

1. [Resendダッシュボード](https://resend.com/)にログイン
2. **Logs** に移動
3. 最近のログを確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

## 確認すべきログの種類

### サインアップ関連のログ

- `/auth/v1/signup` - サインアップリクエスト
- `/auth/v1/verify` - メール確認リクエスト
- `/auth/v1/resend` - メール再送信リクエスト

### メール送信関連のログ

- `Email sent` - メール送信成功
- `Failed to send email` - メール送信失敗
- `SMTP connection failed` - SMTP接続エラー
- `Invalid redirect URL` - リダイレクトURLエラー

## 次のステップ

1. **Authentication** → **Logs** で `/signup` を検索
2. 最近のサインアップリクエストのログを確認
3. エラーメッセージがないか確認
4. Resendダッシュボードの **Logs** も確認

## 重要

現在表示されているログ（`/auth/v1/admin/oauth/clients`）はメール送信とは関係ありません。

メール送信に関するログを確認するには、**Authentication** → **Logs** で `/signup` や `email` で検索してください。

