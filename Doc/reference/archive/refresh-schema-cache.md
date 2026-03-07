# Supabaseスキーマキャッシュのリフレッシュ方法

## 問題

`address`カラムがデータベースに存在するにもかかわらず、以下のエラーが発生：

```
Could not find the 'address' column of 'spots' in the schema cache
エラーコード: PGRST204
```

これは、PostgREST（SupabaseのAPIレイヤー）のスキーマキャッシュが更新されていないことが原因です。

## 解決方法

### 方法1: Supabaseダッシュボードからリフレッシュ（推奨）

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **API** に移動
4. **Reload schema** ボタンをクリック
5. 数秒待ってから再度試す

### 方法2: SQL Editorからリフレッシュ

Supabase SQL Editorで以下を実行：

```sql
-- PostgRESTにスキーマをリロードするよう通知
NOTIFY pgrst, 'reload schema';
```

### 方法3: Supabase CLIからリフレッシュ（開発環境）

開発環境の場合：

```bash
npx supabase db reset
```

または、特定のマイグレーションのみ再適用：

```bash
npx supabase migration up
```

## 確認方法

### 1. データベースにカラムが存在するか確認

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'spots' AND column_name = 'address';
```

結果が返ってくれば、カラムは存在します。

### 2. APIからスキーマを確認

Supabaseダッシュボードの **API** → **Table Editor** で `spots` テーブルを開き、`address` カラムが表示されるか確認してください。

### 3. エラーが解消されたか確認

スキーマキャッシュをリフレッシュ後、再度記録を投稿してエラーが解消されたか確認してください。

## 注意事項

- スキーマキャッシュのリフレッシュは、PostgRESTが新しいスキーマを認識するために必要です
- カラムを追加・削除・変更した後は、必ずスキーマキャッシュをリフレッシュしてください
- 本番環境では、マイグレーション実行後に自動的にリフレッシュされる場合もありますが、手動でリフレッシュすることを推奨します

## 一時的な回避策

スキーマキャッシュをリフレッシュできない場合、コード側で`address`フィールドを送信しないようにすることで、エラーを回避できます。

ただし、これは根本的な解決策ではないため、できるだけ早くスキーマキャッシュをリフレッシュしてください。

