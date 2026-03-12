# トラブルシューティング

## データベース

### スキーマエラー

**エラー**: カラムが見つからない、テーブルが存在しない

**対応**:
1. Supabase SQL Editor で `supabase/run-full-schema.sql` を実行
2. スキーマキャッシュの更新: `NOTIFY pgrst, 'reload schema';`

### ローカル DB のリセット

```bash
npx supabase db reset
```

---

## 認証

### ログインできない

- Supabase Dashboard → Authentication → Users でユーザーが作成されているか確認
- `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認
- メール確認が有効な場合、メール内のリンクから確認完了が必要

---

## 地図が表示されない

- `NEXT_PUBLIC_MAPBOX_TOKEN` が設定されているか確認
- [Mapboxトークン設定](./Doc/Mapboxトークン設定.md) のスコープ（styles:read, fonts:read, styles:tiles）を確認

---

## 記録作成エラー

**エラー**: `Failed to create spot` または `Failed to create media`

**確認**:
1. ログインしているか
2. RLS ポリシーが `supabase/run-full-schema.sql` の内容と一致しているか
3. ブラウザのコンソール・ネットワークタブで API レスポンスを確認

---

## 環境変数

### `.env.local` のパースエラー

- 変数名に改行や特殊文字が含まれていないか確認
- 各行が正しく終わっているか（余計なスペースがないか）

---

## ログの確認

- **Vercel**: Dashboard → Functions → Logs
- **Supabase Edge Functions**: Dashboard → Edge Functions → 各関数 → Logs
- **ブラウザ**: 開発者ツール（F12）→ Console / Network
