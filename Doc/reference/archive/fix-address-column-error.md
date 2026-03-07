# `address`カラムエラーの修正

## エラー内容

```
Could not find the 'address' column of 'spots' in the schema cache
エラーコード: PGRST204
```

## 原因

本番環境のSupabaseデータベースに`address`カラムが存在しないか、スキーマキャッシュが更新されていない可能性があります。

## 解決方法

### 方法1: マイグレーションを実行（推奨）

本番環境のSupabase SQL Editorで以下を実行：

```sql
-- addressカラムの追加
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS address TEXT;

-- スキーマキャッシュをリフレッシュ（PostgREST）
-- 注意: これはSupabaseの内部APIを呼び出す必要があります
-- Supabaseダッシュボードで「API」→「Reload schema」を実行するか、
-- 以下のコマンドを実行してください
NOTIFY pgrst, 'reload schema';
```

### 方法2: 一時的な回避策（実装済み）

`spotToDb`関数を修正して、`address`フィールドが存在する場合のみデータベースに送信するようにしました。

これにより、`address`カラムが存在しない環境でもエラーが発生しません。

## 確認方法

### 本番環境のスキーマを確認

Supabase SQL Editorで以下を実行：

```sql
-- spotsテーブルのカラム一覧を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'spots'
ORDER BY ordinal_position;
```

`address`カラムが存在するか確認してください。

### マイグレーション履歴を確認

```sql
-- マイグレーション履歴を確認
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

`20250120000000_update_schema_for_minimal_features.sql`が適用されているか確認してください。

## 次のステップ

1. **本番環境でマイグレーションを実行**:
   - Supabase SQL Editorで`20250120000000_update_schema_for_minimal_features.sql`を実行
   - または、上記のSQLを直接実行

2. **スキーマキャッシュをリフレッシュ**:
   - Supabaseダッシュボードで「API」→「Reload schema」を実行
   - または、`NOTIFY pgrst, 'reload schema';`を実行

3. **動作確認**:
   - 記録を投稿して、エラーが解消されたか確認

## 注意事項

- `address`カラムは任意のフィールドです（`NULL`許可）
- マイグレーションを実行しても、既存のデータには影響しません
- スキーマキャッシュのリフレッシュは、PostgRESTが新しいスキーマを認識するために必要です

