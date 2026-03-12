# AhhHum Phase1 必要テーブル一覧

本ドキュメントは、`AhhHum Webアプリ全体設計マスタードキュメント.md` を親設計とした Phase1 最小スキーマの要約です。  
未作成の場合は Supabase SQL Editor で `supabase/run-full-schema.sql` を実行してください。

---

## 1. spots（スポット）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT PK | スポットID |
| spot_name | TEXT | 場所名（渋谷など） |
| context | TEXT | 文脈テキスト（「かつて川だった場所」等） |
| prefecture | TEXT | 都道府県 |
| lat, lng | DOUBLE PRECISION | 緯度・経度 |
| status | TEXT | 現行スキーマの状態値。Phase1では主に運営管理用に使う |
| last_seen | TIMESTAMPTZ | 最終発見日時（鮮度表示用） |
| spot_number | INTEGER | #N の N（ティッカー表示用） |
| submitted_by | UUID | 作成者（auth.users.id）。Phase1では主に運営登録向け |
| approved_by | UUID | 管理者 |
| approved_at | TIMESTAMPTZ | 承認日時 |
| rejection_reason | TEXT | 却下理由。Phase1では例外対応向け |
| cover_url | TEXT | カバー画像URL（1枚のみ） |
| created_at, updated_at | TIMESTAMPTZ | 作成・更新日時 |

**役割**: 曖昧サークル・ティッカー・発見記録の基底データ。

**注記**:

- 親設計上、`spots` は「発見報告投稿」の承認対象ではなく、**都市空間上の出現単位**として扱う
- 将来の `設置申請` は `spots` に直接混ぜず、別の審査テーブルへ分離する前提

---

## 2. discovery_logs（発見ログ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID PK | ログID |
| spot_id | TEXT | スポットID（spots.id 参照） |
| user_id | UUID | 発見者（auth.users.id 参照） |
| discovered_at | TIMESTAMPTZ | 発見日時 |

**役割**: ティッカー表示と `last_seen` 更新の元データ。

**注記**:

- 親設計では `discovery_logs` は単なる履歴ではなく、発見順、FTF、鮮度更新の価値単位
- Phase2 以降は、ここからコレクションや共鳴判定へ接続する

---

## 3. admin_users（管理者）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | SERIAL PK | 行ID |
| user_id | UUID UNIQUE | 管理者の auth.users.id |
| created_at | TIMESTAMPTZ | 登録日時 |

**役割**: スポットの承認・却下ができる管理者の一覧。

---

## 4. user_profiles（ユーザープロフィール）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | SERIAL PK | 行ID |
| user_id | UUID UNIQUE | auth.users.id |
| display_name | TEXT | 表示名（ティッカー用） |
| created_at, updated_at | TIMESTAMPTZ | 作成・更新日時 |

**役割**: ティッカー表示名。未設定時は `Explorer_xxxxx` 形式でフォールバック。

---

## 5. 親設計との対応

| 親設計エンティティ | 現行テーブル | 状態 |
|--------|-----|------|
| `Spot` | `spots` | Phase1 実装済み |
| `Discovery` | `discovery_logs` | Phase1 実装済み |
| `User / Profile` | `auth.users`, `user_profiles` | Phase1 実装済み |
| `Admin` | `admin_users` | Phase1 実装済み |
| `Character` | 未分離 | 未実装または今後整理 |
| `Tag` | 未分離 | Phase1 では未実装または簡易運用 |
| `Collection` | 未実装 | Phase2 対応 |
| `Legend` | 未実装 | Phase2 対応 |
| `PlacementApplication` | 未実装 | Phase3 対応 |

---

## 6. テーブル依存関係

```text
auth.users
    ├── spots.submitted_by, spots.approved_by
    ├── discovery_logs.user_id
    ├── admin_users.user_id
    └── user_profiles.user_id

spots
    └── discovery_logs.spot_id
```

---

## 7. SQL の実行方法

### Supabase Cloud

1. Supabase ダッシュボード → **SQL Editor**
2. `supabase/run-full-schema.sql` の内容を貼り付けて実行

### ローカル

```bash
npx supabase start
npx supabase db reset   # マイグレーション + シード実行
```
