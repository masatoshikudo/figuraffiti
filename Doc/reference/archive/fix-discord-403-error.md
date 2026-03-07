# Discord Interaction 403エラーの修正

## エラー内容

```
403 Forbidden
GET uheuaetcwqabmbpyhnio.supabase.co/rest/v1/admin_users
```

## 原因

Discord Interaction Endpointは認証されていないリクエスト（Discordからの直接リクエスト）のため、通常のSupabaseクライアント（Anon Key）では`admin_users`テーブルにアクセスできません。

RLS（Row Level Security）ポリシーにより、認証されていないユーザーは`admin_users`テーブルにアクセスできない設定になっています。

## 解決方法

### Service Role Keyを使用する

Discord Interaction Endpointでは、**Service Role Key**を使用してSupabaseにアクセスする必要があります。Service Role KeyはRLSをバイパスし、すべてのテーブルにアクセスできます。

### 環境変数の設定

Vercelダッシュボード → **Settings** → **Environment Variables** で以下を設定：

- `SUPABASE_SERVICE_ROLE_KEY`: SupabaseのService Role Key
  - 取得方法: Supabaseダッシュボード → **Settings** → **API** → **service_role** key

⚠️ **重要**: Service Role Keyは機密情報です。以下の点に注意してください：

- Service Role KeyをGitHubにコミットしない
- Service Role Keyを公開しない
- Service Role Keyが漏洩した場合は、Supabaseダッシュボードで再生成してください

## 修正内容

`app/api/discord/interactions/route.ts`を修正して、Service Role Keyを使用するようにしました：

1. **管理者権限確認時**: Service Role Keyを使用して`admin_users`テーブルにアクセス
2. **承認処理時**: Service Role Keyを使用して`spots`テーブルと`spot_approvals`テーブルにアクセス
3. **却下処理時**: Service Role Keyを使用して`spots`テーブルと`spot_approvals`テーブルにアクセス

## 確認方法

### 1. 環境変数が設定されているか確認

Vercelダッシュボード → **Settings** → **Environment Variables** で以下を確認：

- `SUPABASE_SERVICE_ROLE_KEY` が設定されているか
- 値が正しいか（SupabaseダッシュボードのService Role Keyと一致しているか）

### 2. 動作確認

1. Discordで承認ボタンをクリック
2. Vercelのログで403エラーが解消されたか確認
3. 承認が正常に完了するか確認

## トラブルシューティング

### Service Role Keyが設定されていない

**症状**: ログに `Missing Supabase credentials` が表示される

**解決方法**: Vercelダッシュボードで`SUPABASE_SERVICE_ROLE_KEY`を設定して再デプロイ

### Service Role Keyが間違っている

**症状**: 403エラーが続く

**解決方法**: 
1. Supabaseダッシュボード → **Settings** → **API** → **service_role** keyを確認
2. Vercelダッシュボードで正しい値を設定して再デプロイ

### まだ403エラーが発生する

**症状**: 環境変数を設定しても403エラーが続く

**解決方法**:
1. Vercelダッシュボードで環境変数が正しく設定されているか確認
2. 再デプロイを実行（環境変数の変更は再デプロイが必要）
3. Vercelのログで詳細なエラーを確認

## セキュリティ注意事項

- Service Role Keyは**管理者権限**を持ちます
- Discord Interaction Endpointでのみ使用してください
- 他のAPIエンドポイントでは使用しないでください（通常の認証フローを使用）

## 次のステップ

1. Vercelダッシュボードで`SUPABASE_SERVICE_ROLE_KEY`を設定
2. 再デプロイを実行
3. Discordで承認ボタンを再度試す

