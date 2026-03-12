# プロジェクト構造

## ルート

| パス | 説明 |
|------|------|
| `README.md` | プロジェクト概要・クイックスタート |
| `SETUP.md` | セットアップ手順 |
| `TROUBLESHOOTING.md` | トラブルシューティング |

## app/

Next.js App Router。ページと API ルート。

| ディレクトリ | 説明 |
|--------------|------|
| `app/` | ルートレイアウト、トップページ |
| `app/mapping/` | マップ画面（曖昧サークル・ティッカー） |
| `app/discover/` | 発見記録（NFC/QR タギング） |
| `app/submit/` | スポット申請 |
| `app/admin/` | 承認管理 |
| `app/profile/` | ユーザープロフィール |
| `app/auth/callback/` | 認証コールバック |
| `app/api/` | API ルート |

## components/

| ディレクトリ | 説明 |
|--------------|------|
| `components/ui/` | shadcn/ui 基盤コンポーネント |
| `components/map/` | 地図（ahhhum-map-view, location-picker） |
| `components/spot/` | スポット詳細（ahhhum-spot-detail） |
| `components/discovery/` | ティッカー |
| `components/auth/` | 認証UI（user-menu, auth-dialog） |
| `components/layout/` | レイアウト（header, footer） |
| `components/profile/` | プロフィールタブ |

## lib/

| ディレクトリ | 説明 |
|--------------|------|
| `lib/supabase/` | Supabase クライアント |
| `lib/spot/` | スポット関連ユーティリティ（spot-converter, last-seen-utils） |
| `lib/mapbox/` | 地図ユーティリティ |
| `lib/api/` | API 用ユーティリティ（admin-utils, api-utils） |
| `lib/design/` | デザイントークン |

## supabase/

| パス | 説明 |
|------|------|
| `run-full-schema.sql` | スキーマ（Cloud 手動実行用） |
| `seed.sql` | 開発用シードデータ |
| `clear-dummy-data.sql` | ダミーデータ削除 |
| `migrations/` | DB マイグレーション（db reset で使用） |
| `functions/` | Edge Functions（メール通知） |
| `config.toml` | ローカル開発設定 |

## Doc/

| パス | 説明 |
|------|------|
| `Doc/README.md` | ドキュメント一覧 |
| `Doc/10_strategy_brand/` | 戦略・ブランドの正本 |
| `Doc/20_product_design/` | UX設計、ゲームフロー、要件定義 |
| `Doc/30_technical_ops/` | 技術仕様、実装メモ、運用資料 |
| `Doc/40_business_finance/` | 事業計画、資金、CF関連資料 |
| `Doc/50_legal/` | 利用規約、プライバシーポリシー |
| `Doc/60_research/` | 外部調査、ベンチマーク |
| `Doc/70_assets/` | 画像などの補助アセット |
| `Doc/80_reference_active/` | 現在も参照する補助資料 |
| `Doc/99_archive/` | 旧検討資料、保管用メモ |

## scripts/

| パス | 説明 |
|------|------|
| `run-full-schema.mjs` | run-full-schema.sql をリモート DB に実行 |
