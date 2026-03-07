# Figuraffiti

都市の余白に物語を。街に隠れた立体グラフィティを探し、発見を記録・共有する Web アプリです。

## 機能

- **オンラインマップ** (`/mapping`) — 承認済みの発見報告を地図上に表示
- **発見報告** (`/submit`) — 地図で場所を選び、作品名・SNS リンクを送信（認証必須）
- **キャラクターページ** (`/character/[slug]`) — QR/NFC の飛び先。キャラのストーリーと発見ログを表示
- **承認管理** (`/admin`) — 管理者による承認/却下
- **プロフィール** (`/profile`) — 自分の発見報告一覧

## 技術スタック

- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Mapbox GL JS（地図）, Supabase（DB・認証）

## セットアップ

1. **環境変数** — ルートに `.env.local` を作成し、以下を設定：

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key  # 任意
```

2. **DB** — Supabase で `supabase/migrations/` のマイグレーションを実行（または `supabase/run-add-characters-in-dashboard.sql` を SQL Editor で実行）。

3. **起動** — `npm install` → `npm run dev` → http://localhost:3000

## ドキュメント

- `Doc/Figuraffiti Web・アプリ要件定義.md` — 要件定義
- `Doc/フェーズ1実装メモ.md` — フェーズ1実装のメモ
- `Doc/figuraffiti事業_転用コード一覧.md` — 転用コード一覧

## ライセンス

MIT
