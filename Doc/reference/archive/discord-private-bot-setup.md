# プライベートDiscord Botの設定方法

## 問題

Discord Botの設定で「プライベートアプリケーションはデフォルトの認証リンクを持つことはできません」というアラートが表示される。

## 原因

Discord Botが**プライベートアプリケーション**として設定されている場合、OAuth2のURL Generatorでデフォルトの認証リンクを生成できません。

## 解決方法

### 方法1: BotをPublic Botに変更（推奨）

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. アプリケーションを選択
3. **General Information** タブを開く
4. **PUBLIC BOT** セクションで **PUBLIC BOT** を有効にする
5. **Save Changes** をクリック

これで、OAuth2のURL Generatorを使用してBotを招待できるようになります。

### 方法2: プライベートBotのまま、直接Botを招待する

プライベートBotのまま使用する場合、以下の手順でBotを招待します：

#### Step 1: Botの招待URLを生成

1. Discord Developer Portal → **OAuth2** → **URL Generator**
2. **SCOPES** セクションで以下を選択：
   - ✅ `bot`
3. **BOT PERMISSIONS** セクションで以下を選択：
   - ✅ `Send Messages` (メッセージを送信)
   - ✅ `Embed Links` (埋め込みリンク)
   - ✅ `Use External Emojis` (外部絵文字を使用)
   - ✅ `Add Reactions` (リアクションを追加)
   - ✅ `Read Message History` (メッセージ履歴を読む)
4. 生成されたURLをコピー（例: `https://discord.com/api/oauth2/authorize?client_id=...`）

#### Step 2: Botをサーバーに招待

1. コピーしたURLをブラウザで開く
2. **サーバーを選択** ドロップダウンから、通知を送信したいサーバーを選択
3. **認証** をクリック
4. Botがサーバーに追加されたことを確認

#### Step 3: チャンネルIDを取得

1. Discordで開発者モードを有効にする（設定 → 詳細設定 → 開発者モード）
2. 通知を送信したいチャンネルを右クリック
3. **IDをコピー** を選択
4. このIDを`DISCORD_CHANNEL_ID`環境変数に設定

#### Step 4: 環境変数を設定

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets** で以下を設定：

- `DISCORD_BOT_TOKEN`: Discord Botのトークン（Botタブから取得）
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID（上記で取得）
- `DISCORD_WEBHOOK_URL`: Webhook URL（オプション、フォールバック用）

## Public Bot vs Private Bot

### Public Bot（推奨）

**メリット**:
- OAuth2のURL Generatorが使用できる
- 複数のサーバーに簡単に招待できる
- 設定が簡単

**デメリット**:
- 誰でもBotを招待できる（ただし、Botの権限は制限可能）

### Private Bot

**メリット**:
- 特定のサーバーにのみ招待できる
- より厳格なセキュリティ

**デメリット**:
- OAuth2のURL Generatorが使用できない
- 招待URLを手動で生成する必要がある

## 推奨設定

Discord通知の目的であれば、**Public Bot**にすることを推奨します。理由：

1. 設定が簡単
2. Botは特定のサーバーにのみ招待されるため、セキュリティ上の問題はない
3. Botの権限は必要最小限に設定できる

## 確認方法

Botが正しく招待されているか確認：

1. Discordサーバーで、Botがオンライン状態になっているか確認
2. 通知を送信したいチャンネルで、Botがメッセージを送信できる権限を持っているか確認
3. テストとして、Edge Functionを直接呼び出して通知を送信してみる

## トラブルシューティング

### Botがサーバーに表示されない

- Botの招待URLを再度生成して、正しいサーバーを選択したか確認
- Botの権限が正しく設定されているか確認

### Botがメッセージを送信できない

- Botに「Send Messages」権限が付与されているか確認
- チャンネルの権限設定で、Botがメッセージを送信できるか確認

### チャンネルIDが取得できない

- 開発者モードが有効になっているか確認
- チャンネルを右クリックして「IDをコピー」が表示されるか確認

