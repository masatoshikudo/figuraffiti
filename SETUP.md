# セットアップガイド（AhhHum Phase1）

## 1. 環境変数

プロジェクトルートに `.env.local` を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key  # 任意
```

### Mapbox トークン

[Doc/Mapboxトークン設定.md](./Doc/Mapboxトークン設定.md) を参照。

---

## 2. データベース

### 方法A: Supabase Cloud

1. [Supabase](https://supabase.com) でプロジェクト作成
2. **SQL Editor** で `supabase/run-full-schema.sql` を実行
3. 開発用データが必要な場合、`supabase/seed.sql` を実行

### 方法B: ローカル（Supabase CLI）

```bash
npx supabase start
npx supabase db reset   # マイグレーション + シード実行
```

- Studio: http://127.0.0.1:54323
- `npx supabase status` で URL と anon key を確認し、`.env.local` に設定

---

## 3. 管理者の設定

```sql
INSERT INTO admin_users (user_id)
VALUES ('YOUR_SUPABASE_USER_ID')
ON CONFLICT (user_id) DO NOTHING;
```

`YOUR_SUPABASE_USER_ID` は Supabase Dashboard → Authentication → Users で確認。

---

## 4. 起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス。

---

## 5. Edge Functions（メール通知・オプション）

管理者・投稿者へのメール通知が必要な場合：

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

npx supabase functions deploy send-admin-notification
npx supabase functions deploy send-approval-notification
npx supabase functions deploy send-rejection-notification
```

Supabase Dashboard → Edge Functions → Secrets で SMTP 等の環境変数を設定。

---

## トラブルシューティング

[TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を参照。
