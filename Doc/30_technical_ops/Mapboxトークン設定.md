# Mapbox トークン発行とスコープ設定（AhhHum 用）

本ドキュメントは、`AhhHum Webアプリ全体設計マスタードキュメント.md` を前提にした Mapbox 設定手順です。

## このアプリで Mapbox を何に使っているか

- **地図の表示** … Mapbox GL JS による曖昧サークル、重点区マップ、現在地補助
- **逆ジオコーディング** … 緯度・経度 → 住所 / 地名（管理画面や将来の設置申請補助）

---

## 1. トークンを作成する

1. **https://account.mapbox.com/access-tokens/** にアクセス（要ログイン）
2. **「Create a token」** をクリック
3. 以下を設定する

---

## 2. 推奨設定

### Token name（名前）

- 例: `AhhHum (development)` や `AhhHum production`

### Token scopes（スコープ）

**次のスコープにチェックを入れる：**

| スコープ | 用途 |
|---------|------|
| **styles:read** | 地図スタイルの読み込み（必須） |
| **fonts:read** | 地図のフォント（スタイルに含まれる） |
| **styles:tiles** | ベクタータイルの取得（地図タイル表示に必要） |

※ **Geocoding API**（逆ジオコーディング）は、上記のパブリックトークンで利用可能です。別スコープは不要です。

### Public token（公開トークン）

- **「Public」** のままにする（ブラウザの `NEXT_PUBLIC_MAPBOX_TOKEN` で使うため）

### URL restrictions（オプション）

本番のみ制限する場合の例：

- **Development**: 空欄のまま（ローカル `localhost` も許可）
- **Production**:  
  `https://あなたのドメイン/*`  
  を追加（例: `https://ahhhum.vercel.app/*`）

※ 空欄ならどのオリジンからでも使えます。セキュリティを厳しくするときだけ設定してください。

---

## 3. 作成後の設定

発行されたトークン（`pk.` で始まる文字列）を、プロジェクトの `.env.local` に設定します。

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...（コピーしたトークン）
```

---

## 4. スコープ一覧の確認（必要なら）

利用可能なスコープを API で確認する場合：

```bash
curl "https://api.mapbox.com/scopes/v1/あなたのMapboxユーザー名?access_token=あなたのシークレットトークン"
```

※ シークレットトークンは **Account** ページの **Secret token**（`sk.` で始まる）です。API 経由でトークンを作る場合に使います。通常はダッシュボードから作成すれば十分です。

---

## まとめ

- **作成場所**: https://account.mapbox.com/access-tokens/
- **種類**: Public（pk.）
- **スコープ**: `styles:read` ＋ `fonts:read` ＋ `styles:tiles`
- **環境変数**: `NEXT_PUBLIC_MAPBOX_TOKEN`

これで地図表示と逆ジオコーディングの両方が動作します。
