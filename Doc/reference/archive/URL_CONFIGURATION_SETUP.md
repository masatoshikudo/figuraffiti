# URL設定の手順（skateright.io）

## 本番環境のURL設定

本番環境のURL `https://www.skateright.io/` をSupabaseダッシュボードに登録する手順です。

## 設定手順

### 1. SupabaseダッシュボードでURL設定を開く

1. [Supabaseダッシュボード](https://app.supabase.com/)にログイン
2. プロジェクトを選択
3. **Authentication** → **URL Configuration** に移動

### 2. Site URLを設定

**Site URL** フィールドに以下を入力：

```
https://www.skateright.io
```

### 3. Redirect URLsを追加

**Redirect URLs** セクションに以下を追加：

```
https://www.skateright.io/auth/callback
https://www.skateright.io/**
```

**重要**: 
- `/auth/callback` はメール確認後のリダイレクト先です
- `/**` はワイルドカードで、すべてのパスでリダイレクトが許可されます

### 4. 設定を保存

1. **Save** または **Save changes** をクリック
2. 設定が保存されたことを確認

## 設定後の確認

### 1. 設定が正しく保存されているか確認

- ✅ **Site URL**: `https://www.skateright.io`
- ✅ **Redirect URLs** に以下が追加されている：
  - `https://www.skateright.io/auth/callback`
  - `https://www.skateright.io/**`

### 2. テスト

1. アプリ（`https://www.skateright.io`）でサインアップを実行
2. Supabaseダッシュボードの **Authentication** → **Logs** を確認
3. Resendダッシュボードの **Logs** を確認
4. メールボックスを確認（迷惑メールフォルダも確認）

## 確認チェックリスト

- [ ] **Site URL** に `https://www.skateright.io` が設定されている
- [ ] **Redirect URLs** に `https://www.skateright.io/auth/callback` が追加されている
- [ ] **Redirect URLs** に `https://www.skateright.io/**` が追加されている
- [ ] 設定を保存した

## 注意事項

- `www` ありとなしの両方を登録する必要はありません（`www.skateright.io` と `skateright.io` は別のドメインとして扱われます）
- 現在の設定では `www.skateright.io` を使用しているため、このURLを登録してください
- もし `skateright.io`（wwwなし）も使用する場合は、そちらも追加してください

## 次のステップ

1. URL設定を完了
2. アプリでサインアップを実行
3. メールが届くか確認
4. Resendダッシュボードの **Logs** を確認

