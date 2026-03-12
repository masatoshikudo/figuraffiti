# Supabase（AhhHum Phase1）

## ディレクトリ構成

```
supabase/
├── config.toml          # ローカル開発設定
├── run-full-schema.sql  # スキーマ（Cloud 手動実行用）
├── seed.sql             # 開発用シードデータ
├── clear-dummy-data.sql # ダミーデータ削除
├── migrations/          # DB マイグレーション（db reset で使用）
└── functions/           # Edge Functions（通知用）
```

## セットアップ

### Supabase Cloud（新規プロジェクト）

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `run-full-schema.sql` を実行
3. 開発用データを入れる場合は `seed.sql` を実行

### ローカル開発

```bash
npx supabase start
npx supabase db reset   # マイグレーション + シード実行
```

Studio: http://127.0.0.1:54323

## テーブル

| テーブル | 役割 |
|----------|------|
| spots | 発見場所（承認済みのみ公開） |
| discovery_logs | 発見履歴（ティッカー用） |
| admin_users | 管理者（承認権限） |
| user_profiles | ユーザー表示名（ティッカー用） |

## ダミーデータ

- **挿入**: `seed.sql` を SQL Editor で実行（または `db reset`）
- **削除**: `clear-dummy-data.sql` を実行
- **プレフィックス**: `test-`, `hotspot-`
