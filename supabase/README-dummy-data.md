# ダミーデータの挿入方法

## 概要

`supabase/seed.sql`には、開発環境・本番環境共通で使用可能な統合ダミーデータが含まれています。

## 含まれるデータ

1. **基本テストデータ**: 基本的なスポットデータ（東京、大阪、名古屋）
2. **ホットスポットデータ（海外）**: アメリカ、イギリス、オーストラリアのホットスポット
3. **ホットスポットデータ（国内）**: 渋谷、新宿のホットスポット
4. **更新可能性デモデータ**: 更新可能性を確認するためのデータ
5. **ステータス別ピンデザイン確認用データ**: 承認済み、承認待ち、更新可能、高難易度の各ステータスを確認するためのデータ

## 方法1: Supabase Studioを使用（推奨）

1. Supabaseローカル環境を起動（まだ起動していない場合）:
   ```bash
   npx supabase start
   ```

2. Supabase Studioにアクセス:
   - URL: http://127.0.0.1:54323
   - または、`npx supabase status`で表示されるStudio URLを確認

3. SQL Editorを開く:
   - 左側のメニューから「SQL Editor」をクリック

4. SQLファイルの内容をコピー＆ペースト:
   - `supabase/seed.sql`の内容をコピー
   - SQL Editorにペースト

5. 実行ボタンをクリック:
   - 「Run」ボタンをクリックしてSQLを実行

## 方法2: Dockerコンテナを直接使用

skaterightプロジェクトのSupabaseローカル環境が起動している場合:

```bash
# コンテナ名を確認
docker ps --filter "name=supabase_db_skateright" --format "{{.Names}}"

# SQLファイルを実行（コンテナ名を実際の名前に置き換える）
cat supabase/seed.sql | docker exec -i supabase_db_skateright psql -U postgres -d postgres
```

## 方法3: ポート競合を解決して起動

既存のSupabaseプロジェクト（Nasite）が起動している場合:

1. 既存のプロジェクトを停止:
   ```bash
   cd /path/to/Nasite/project
   npx supabase stop
   ```

2. skaterightプロジェクトを起動:
   ```bash
   cd /path/to/skateright
   npx supabase start
   ```

3. 方法1または方法2を使用してSQLを実行

## 確認方法

SQL実行後、以下のクエリでデータが正しく挿入されたか確認できます:

```sql
-- すべてのダミーデータを確認
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
WHERE s.id LIKE 'test-%' 
   OR s.id LIKE 'hotspot-%' 
   OR s.id LIKE 'update-demo-%' 
   OR s.id LIKE 'dummy-%'
GROUP BY s.id, s.spot_name, s.trick, s.status, s.lat, s.lng
ORDER BY s.status, s.trick;
```

## データの種類

### テストデータ（`test-`プレフィックス）
- 基本的なスポットデータ
- 東京、大阪、名古屋のスポット

### ホットスポットデータ（`hotspot-`プレフィックス）
- 海外: アメリカ、イギリス、オーストラリア
- 国内: 渋谷、新宿
- 直近7日以内に登録された記録で、同じ場所（25m以内）に5件以上

### 更新可能性デモデータ（`update-demo-`プレフィックス）
- 同じ場所（半径50m以内）に複数の記録を作成
- 異なる難易度レベルの技を含める

### ステータス別ピンデザイン確認用データ（`dummy-`プレフィックス）
- 承認済み（緑）: 基本技
- 承認待ち（グレー）: 承認待ちのスポット
- 高難易度（紫）: 上級技（難易度レベル3以上）
- 更新可能（オレンジ/金色）: 近接する記録の中で最も高い難易度より低い難易度の記録

## ダミーデータの削除方法

すべてのダミーデータを削除したい場合は、以下の方法を使用してください：

### 方法1: Supabase Studioを使用（推奨）

1. Supabase Studioにアクセス
2. SQL Editorを開く
3. `supabase/clear-dummy-data.sql`の内容をコピー＆ペースト
4. 「Run」ボタンをクリックしてSQLを実行

### 方法2: Dockerコンテナを直接使用

```bash
# コンテナ名を確認
docker ps --filter "name=supabase_db_skateright" --format "{{.Names}}"

# SQLファイルを実行（コンテナ名を実際の名前に置き換える）
cat supabase/clear-dummy-data.sql | docker exec -i supabase_db_skateright psql -U postgres -d postgres
```

### 削除されるデータ

以下のプレフィックスを持つすべてのデータが削除されます：
- `test-`: 基本テストデータ
- `hotspot-`: ホットスポットデータ（海外）
- `dummy-hotspot-`: ホットスポットデータ（国内）
- `update-demo-`: 更新可能性デモデータ
- `dummy-`: ステータス別ピンデザイン確認用データ

**注意**: 削除は元に戻せません。実行前に必ず確認してください。

## 注意事項

- ダミーデータは以下のプレフィックスを使用しています:
  - `test-`: 基本テストデータ
  - `hotspot-`: ホットスポットデータ（海外）
  - `dummy-hotspot-`: ホットスポットデータ（国内）
  - `update-demo-`: 更新可能性デモデータ
  - `dummy-`: ステータス別ピンデザイン確認用データ
- 既存のデータと競合しないように、`ON CONFLICT`句を使用しています
- 本番環境でも使用可能ですが、必要に応じてデータを削除してください
