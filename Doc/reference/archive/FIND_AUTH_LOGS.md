# Supabase Authentication Logsの見つけ方

## 問題: Authentication Logsが見つからない

Supabaseダッシュボードで **Authentication** → **Logs** が見つからない場合の対処法です。

## 確認手順

### 1. 正しい場所を確認

**確認場所**: Supabaseダッシュボード → **Authentication** → **Logs**

**手順**:
1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. 左メニューから **Authentication** をクリック
4. **Logs** タブをクリック

**注意**: 
- **Logs** タブが表示されない場合、プロジェクトのプランによっては利用できない可能性があります
- 無料プランでも利用可能ですが、ログの保持期間が限られている場合があります

### 2. ログが表示されない場合の対処法

#### オプション1: ログのフィルターを確認

1. **Authentication** → **Logs** に移動
2. フィルターを確認：
   - **Time Range**: 最近1時間または24時間に設定
   - **Event Type**: すべてまたは `signup` を選択
   - **Status**: すべてを選択

#### オプション2: 実際にサインアップを試してログを確認

1. アプリ（`https://www.skateright.io`）でサインアップを実行
2. **すぐに**（1分以内）Supabaseダッシュボードの **Authentication** → **Logs** を確認
3. 最新のログを確認

#### オプション3: 別の場所でログを確認

Supabaseダッシュボードには複数のログ表示場所があります：

1. **Logs** → **API Logs**: APIリクエストのログ
2. **Logs** → **Postgres Logs**: データベースのログ
3. **Authentication** → **Logs**: 認証関連のログ（これが目的）

### 3. ログが表示されない場合の代替方法

#### 方法1: Resendダッシュボードでログを確認

1. [Resendダッシュボード](https://resend.com/)にログイン
2. **Logs** に移動
3. 最近のログを確認：
   - メール送信の試行が記録されているか
   - エラーメッセージがないか

**判断基準**:
- メール送信の試行が記録されている場合: SupabaseからResendへの接続は正常
- メール送信の試行が記録されていない場合: SupabaseからResendへの接続に問題がある可能性

#### 方法2: ブラウザの開発者ツールで確認

1. ブラウザの開発者ツールを開く（F12）
2. **Network**タブを確認
3. `/signup`リクエストをクリック
4. **Response**タブでレスポンスを確認：
   - `user`オブジェクトが返されているか
   - `session`が`null`になっているか（メール確認が必要な場合）
   - エラーメッセージがないか

#### 方法3: コード側でログを確認

`contexts/auth-context.tsx`の`signUp`関数で、レスポンスを確認：

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo,
  },
})

console.log('Sign up response:', { data, error })
```

## 確認すべき情報

### サインアップが成功した場合のレスポンス

```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "email_confirmed_at": null  // メール確認が必要な場合
  },
  "session": null  // メール確認が必要な場合
}
```

### メール送信が成功した場合

- `user`オブジェクトが返される
- `session`が`null`になる（メール確認が必要な場合）
- エラーメッセージがない

### メール送信が失敗した場合

- `user`オブジェクトが返されるが、エラーメッセージが含まれる可能性がある
- Supabaseのログにエラーメッセージが記録される

## 次のステップ

1. **ResendダッシュボードのLogsを確認**（最も簡単）
2. ブラウザの開発者ツールでレスポンスを確認
3. コード側でログを追加してレスポンスを確認

## 重要

Supabaseダッシュボードの **Authentication** → **Logs** が表示されない場合、**ResendダッシュボードのLogs** を確認することで、メール送信の試行が記録されているかどうかを確認できます。

Resendにログが表示されていれば、SupabaseからResendへの接続は正常です。ログが表示されていない場合は、SupabaseからResendへの接続に問題がある可能性があります。

