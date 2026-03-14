# AhhHum（Figuraffiti）

都市の余白に物語を。街に隠れた立体グラフィティを探し、発見を記録・共有する Web アプリです。

## 機能（Phase1）

- **マップ** (`/mapping`) — 曖昧なサークル（50m）とティッカー表示
- **発見記録** (`/discover`) — NFC/QR 読み取りで Last Seen を更新（認証必須）
- **スポット申請** (`/submit`) — 地図で場所を選び送信（Phase3 で本格化予定）
- **承認管理** (`/admin`) — 管理者による承認/却下
- **プロフィール** (`/profile`) — 自分の発見報告一覧

## 技術スタック

- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Mapbox GL JS（地図）, Supabase（DB・認証）

## クイックスタート

```bash
# 1. 環境変数 — ルートに .env.local を作成
# NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
# Google Places を使う場合は GOOGLE_PLACES_API_KEY を設定

# 2. 依存関係
npm install

# 3. DB（ローカル）
npx supabase start
npx supabase db reset

# 4. 起動
npm run dev
```

**Supabase Cloud の場合**: SQL Editor で `supabase/run-full-schema.sql` を実行

## ディレクトリ構成

```
├── app/              # Next.js App Router（ページ・API）
├── components/       # React コンポーネント
├── lib/              # ユーティリティ・API クライアント
├── hooks/            # カスタムフック
├── types/            # TypeScript 型定義
├── contexts/         # React コンテキスト
├── public/           # 静的ファイル
├── supabase/         # DB スキーマ・Edge Functions
├── Doc/              # ドキュメント
└── scripts/          # 実行用スクリプト
```

詳細は [Doc/PROJECT_STRUCTURE.md](./Doc/PROJECT_STRUCTURE.md) を参照。

## ドキュメント

- [Doc/README.md](./Doc/README.md) — ドキュメント一覧
- [Doc/AhhHum Phase1 UX設計書](./Doc/AhhHum%20Phase1%20UX設計書（MVP）.md)
- [Doc/Phase1 実装メモ](./Doc/Phase1%20実装メモ.md)
- [SETUP.md](./SETUP.md) — セットアップ手順
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — トラブルシューティング

## ライセンス

MIT
