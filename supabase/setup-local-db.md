# ローカル開発環境のセットアップ手順

## 問題
マイグレーションファイルの順序に問題があり、`spots`テーブルが作成される前に`spot_approvals`テーブルが作成されようとしています。

## 解決方法

### 方法1: schema.sqlを先に実行（推奨）

1. **Supabaseローカル環境を起動**:
   ```bash
   npx supabase start
   ```

2. **Supabase Studioにアクセス**:
   - URL: http://127.0.0.1:54323

3. **SQL Editorでschema.sqlを実行**:
   - 左側のメニューから「SQL Editor」をクリック
   - `supabase/schema.sql`の内容をコピー＆ペースト
   - 「Run」ボタンをクリック

4. **マイグレーションファイルを適用**:
   - 必要に応じて、残りのマイグレーションファイルを実行

5. **ダミーデータを挿入**:
   - `supabase/dummy-data-status-pins.sql`の内容をコピー＆ペースト
   - 「Run」ボタンをクリック

### 方法2: マイグレーションファイルのタイムスタンプを修正

マイグレーションファイルのタイムスタンプを修正して、`create_tables.sql`が最初に実行されるようにします：

```bash
# ファイル名を変更（タイムスタンプを早める）
mv supabase/migrations/20251116213433_create_tables.sql supabase/migrations/20241201000000_create_tables.sql
```

その後、`npx supabase start`を実行します。

### 方法3: Dockerコンテナを直接使用

1. **Supabaseローカル環境を起動**:
   ```bash
   npx supabase start
   ```

2. **schema.sqlを実行**:
   ```bash
   cat supabase/schema.sql | docker exec -i supabase_db_skateright psql -U postgres -d postgres
   ```

3. **ダミーデータを挿入**:
   ```bash
   cat supabase/dummy-data-status-pins.sql | docker exec -i supabase_db_skateright psql -U postgres -d postgres
   ```

## 確認方法

SQL実行後、以下のクエリでデータが正しく挿入されたか確認できます:

```sql
SELECT 
  s.id,
  s.spot_name,
  s.trick,
  s.status,
  s.lat,
  s.lng,
  COUNT(sm.id) as media_count
FROM spots s
LEFT JOIN spot_media sm ON s.id = sm.spot_id
WHERE s.id LIKE 'dummy-%'
GROUP BY s.id, s.spot_name, s.trick, s.status, s.lat, s.lng
ORDER BY s.status, s.trick;
```

