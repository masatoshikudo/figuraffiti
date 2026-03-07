# 本番環境での「failed to create spot」エラーのトラブルシューティング

## エラーの原因

本番環境で「failed to create spot」エラーが発生する主な原因：

1. **RLSポリシーの問題**: 認証済みユーザーがスポットを作成できない
2. **データベースの制約違反**: 必須フィールドが不足している
3. **認証の問題**: サーバーサイドで認証情報が正しく取得できていない
4. **マイグレーション未適用**: 必要なマイグレーションが本番環境に適用されていない

## 確認手順

### Step 1: Vercelのログを確認

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. **Deployments** → 最新のデプロイメントを選択
4. **Functions** → `/api/spots` を選択
5. **Logs** タブでエラーログを確認

エラーログには以下の情報が含まれます：
- エラーメッセージ
- エラーコード
- ヒント（hint）
- 詳細情報（details）

### Step 2: Supabaseのログを確認

1. Supabaseダッシュボードにアクセス
2. **Logs** → **Postgres Logs** を選択
3. エラーが発生した時刻のログを確認

### Step 3: RLSポリシーの確認

Supabase SQL Editorで以下を実行：

```sql
-- spotsテーブルのRLSポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'spots';
```

以下のポリシーが存在することを確認：

1. **Allow authenticated users to submit spots**: 認証済みユーザーがスポットを作成可能
2. **Allow authenticated users to insert media**: 認証済みユーザーがメディアを作成可能

### Step 4: マイグレーションの確認

以下のマイグレーションが本番環境に適用されているか確認：

```sql
-- マイグレーション履歴を確認
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

以下のマイグレーションが適用されている必要があります：

1. `20250120000000_update_schema_for_minimal_features.sql`
2. `20250120000001_require_auth_for_submission.sql`
3. `20250101000000_create_spot_approvals.sql`（Discord統合用）

### Step 5: 環境変数の確認

Vercelダッシュボードで以下の環境変数が設定されているか確認：

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: SupabaseプロジェクトのAnon Key

## よくある問題と解決方法

### 問題1: RLSポリシーが適用されていない

**症状**: `permission denied for table spots` エラー

**解決方法**:

```sql
-- RLSポリシーを再作成
DROP POLICY IF EXISTS "Allow authenticated users to submit spots" ON spots;
DROP POLICY IF EXISTS "Allow authenticated users to insert media" ON spot_media;

-- スポット作成ポリシー
CREATE POLICY "Allow authenticated users to submit spots" ON spots
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    status = 'pending' AND
    submitted_by = auth.uid()
  );

-- メディア作成ポリシー
CREATE POLICY "Allow authenticated users to insert media" ON spot_media
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM spots 
      WHERE spots.id = spot_media.spot_id 
      AND spots.submitted_by = auth.uid()
      AND (
        spots.status = 'pending' OR
        (spots.status = 'approved' AND 
         EXISTS (
           SELECT 1 FROM trusted_users 
           WHERE user_id = auth.uid()
         ))
      )
    )
  );
```

### 問題2: 必須フィールドが不足している

**症状**: `null value in column "spot_name" violates not-null constraint` エラー

**解決方法**:

`spot_name`は空文字でもOKですが、`NOT NULL`制約があるため、空文字を明示的に設定する必要があります。

マイグレーションを確認：

```sql
-- spot_nameのデフォルト値が空文字になっているか確認
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'spots' AND column_name = 'spot_name';
```

### 問題3: 認証情報が正しく取得できていない

**症状**: `auth.uid() IS NOT NULL` が false になる

**解決方法**:

1. サーバーサイドのSupabaseクライアントが正しく作成されているか確認
2. 認証トークンが正しく渡されているか確認
3. Cookieが正しく設定されているか確認

### 問題4: マイグレーションが適用されていない

**症状**: `column "status" does not exist` エラー

**解決方法**:

必要なマイグレーションを本番環境に適用：

```sql
-- supabase/migrations/20250120000000_update_schema_for_minimal_features.sql
-- supabase/migrations/20250120000001_require_auth_for_submission.sql
```

## デバッグ用のログ追加

エラーの詳細を確認するために、以下のログが追加されています：

- 認証情報のログ
- スポット作成時のログ
- メディア作成時のログ
- エラー発生時の詳細ログ

これらのログはVercelのFunction Logsで確認できます。

## 次のステップ

1. Vercelのログを確認して、具体的なエラーメッセージを特定
2. エラーメッセージに基づいて、上記の解決方法を試す
3. それでも解決しない場合は、エラーログの詳細を共有してください

