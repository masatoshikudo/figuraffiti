# メールが届かない場合のデバッグ手順

## 問題: `/signup`リクエストは完了しているがメールが届かない

### 1. Supabaseダッシュボードでエラーログを確認（最重要）

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **Logs** に移動
4. 最近のログを確認：
   - エラーメッセージがないか確認
   - SMTP接続エラーがないか確認
   - レート制限エラーがないか確認

**よくあるエラー**:
- `SMTP connection failed`: SMTP設定が間違っている
- `Rate limit exceeded`: レート制限に達している
- `Invalid redirect URL`: リダイレクトURLが設定されていない

### 2. Resendダッシュボードでメール送信状況を確認

1. [Resendダッシュボード](https://resend.com/)にログイン
2. **Logs** に移動
3. メール送信の試行が記録されているか確認：
   - メールが送信されている場合: Resend側は正常
   - メールが送信されていない場合: SupabaseからResendへの接続に問題がある可能性

### 3. SMTP設定の再確認

Supabaseダッシュボードで以下を確認：

1. **Authentication** → **Settings** → **SMTP Settings** に移動
2. **Enable custom SMTP** が有効になっているか確認
3. 以下の設定が正しいか確認：
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: ResendのAPIキーが正しく設定されているか
   - **Sender email**: `noreply@resend.dev` または独自ドメイン

### 4. メール認証設定の確認

1. **Authentication** → **Settings** → **Email Auth** に移動
2. 以下の設定を確認：
   - ✅ **Enable email signup**: 有効
   - ✅ **Confirm email**: 有効（メール確認を必須にする）

### 5. リダイレクトURLの確認

1. **Authentication** → **URL Configuration** に移動
2. **Site URL** が正しく設定されているか確認
3. **Redirect URLs** に以下が追加されているか確認：
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

### 6. ブラウザのコンソールでエラーを確認

1. ブラウザの開発者ツールを開く（F12）
2. **Console**タブを確認
3. エラーメッセージがないか確認

### 7. ネットワークタブでリクエストを確認

1. ブラウザの開発者ツールを開く（F12）
2. **Network**タブを確認
3. `/signup`リクエストのレスポンスを確認：
   - ステータスコードが200か確認
   - レスポンスボディにエラーメッセージがないか確認

### 8. コード側での確認

`contexts/auth-context.tsx`の`signUp`関数で、エラーハンドリングを確認：

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo,
  },
})
```

エラーが返されている場合、`error.message`を確認してください。

## よくある問題と解決策

### 問題1: SMTP設定が保存されていない

**症状**: `Enable custom SMTP`が無効のまま

**解決策**:
1. すべてのフィールドが入力されているか確認
2. **Save changes**をクリック
3. ページをリロードして設定が保存されているか確認

### 問題2: ResendのAPIキーが間違っている

**症状**: Supabaseのログに`SMTP authentication failed`エラー

**解決策**:
1. ResendダッシュボードでAPIキーを再確認
2. APIキーが`Sending access`権限を持っているか確認
3. SupabaseのSMTP設定でAPIキーを再入力

### 問題3: リダイレクトURLが設定されていない

**症状**: メールは届くが、リンクをクリックしてもエラーになる

**解決策**:
1. **Authentication** → **URL Configuration** でリダイレクトURLを設定
2. ワイルドカード（`**`）を使用してすべてのパスを許可

### 問題4: レート制限に達している

**症状**: Supabaseのログに`Rate limit exceeded`エラー

**解決策**:
1. しばらく待ってから再試行
2. Resendの無料プランは1日100通まで
3. 制限に達している場合は翌日まで待つ

### 問題5: メールが迷惑メールフォルダに入っている

**症状**: メールが届いていないように見える

**解決策**:
1. 迷惑メールフォルダを確認
2. 送信者メールアドレス（`noreply@resend.dev`）で検索

## 次のステップ

1. **Supabaseダッシュボードのログを確認**（最重要）
2. **Resendダッシュボードのログを確認**
3. **SMTP設定を再確認**
4. **リダイレクトURLを確認**

これらの手順で問題が解決しない場合は、SupabaseのログとResendのログの内容を共有してください。

