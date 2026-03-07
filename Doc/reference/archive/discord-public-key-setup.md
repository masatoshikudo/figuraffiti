# Discord Public Keyの取得方法

## 概要

Discord Interaction Endpointで署名検証を行うために、Discord Applicationの公開鍵（Public Key）が必要です。

## 取得手順

### Step 1: Discord Developer Portalにアクセス

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. ログイン（Discordアカウントが必要）

### Step 2: アプリケーションを選択または作成

#### 既存のアプリケーションがある場合

1. アプリケーション一覧から該当するアプリケーションを選択

#### 新規アプリケーションを作成する場合

1. **New Application** ボタンをクリック
2. アプリケーション名を入力（例: "Skateright Approval Bot"）
3. **Create** をクリック

### Step 3: Public Keyを取得

1. アプリケーションのダッシュボードが開いたら、左側のメニューから **General Information** を選択
2. **Public Key** セクションを探す
3. **Public Key** の値をコピー

   - 形式: 32文字の16進数文字列（例: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`）
   - この値は、Discord Interactionの署名検証に使用されます

### Step 4: 環境変数に設定

#### Vercelの場合

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** を開く
4. **Add New** をクリック
5. 以下を入力：
   - **Key**: `DISCORD_PUBLIC_KEY`
   - **Value**: コピーしたPublic Keyの値
   - **Environment**: Production, Preview, Development（すべてにチェック）
6. **Save** をクリック

#### ローカル開発環境の場合

`.env.local`ファイルに追加：

```bash
DISCORD_PUBLIC_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

（実際のPublic Keyの値に置き換えてください）

## 注意事項

### Public Keyの重要性

- Public Keyは**公開情報**です（秘密鍵ではありません）
- しかし、**署名検証に必要**なため、正しい値を設定する必要があります
- 誤った値を設定すると、Discord Interactionが正常に動作しません

### セキュリティ

- Public Keyは環境変数として管理してください
- コードに直接書かないでください
- Gitリポジトリにコミットしないでください（`.env.local`は`.gitignore`に含まれていることを確認）

## 確認方法

### 設定が正しいか確認

1. Discord Developer PortalでPublic Keyを確認
2. 環境変数に設定した値と一致しているか確認
3. Discord Interaction Endpointにリクエストを送信して、署名検証が成功するか確認

### エラーが発生する場合

- **"Invalid signature"エラー**: Public Keyが正しく設定されていない可能性があります
- **"Missing signature"エラー**: リクエストヘッダーが正しく設定されていない可能性があります

## 参考

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Interactions - Security and Authorization](https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization)

