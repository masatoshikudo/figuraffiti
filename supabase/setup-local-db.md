# ローカル DB セットアップ

## 手順

```bash
npx supabase start
npx supabase db reset
```

- **start**: ローカル Supabase 起動
- **db reset**: マイグレーション適用 + seed.sql 実行

## アクセス

- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

## .env.local

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase status で表示される anon key>
```

`npx supabase status` で URL とキーを確認できます。
