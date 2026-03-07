# Phase 1: 一人承認の実装完了

## 実装内容

Discord Bot + インタラクションを使用して、Discord内で承認/却下を実行できる機能を実装しました。

## 実装された機能

### 1. Discord Interaction Endpoint

**ファイル**: `app/api/discord/interactions/route.ts`

- Discordの署名検証（セキュリティ）
- PINGリクエストの処理（Discordの検証用）
- ボタンクリックの処理（承認/却下）
- モーダル送信の処理（却下理由入力）

### 2. 署名検証

**ファイル**: `lib/discord/verify-signature.ts`

- `tweetnacl`ライブラリを使用してEd25519署名を検証
- Discordの公開鍵を使用してリクエストの正当性を確認

### 3. 承認処理

- 管理者権限の確認（DiscordユーザーIDと`admin_users`テーブルの照合）
- 承認履歴の記録（`spot_approvals`テーブル）
- スポットの承認（`spots`テーブルの`status`を`approved`に更新）
- 投稿者へのメール通知
- Discordメッセージの更新（承認済み表示）

### 4. 却下処理

- 管理者権限の確認
- 却下理由の入力（モーダル）
- 承認履歴の記録（`spot_approvals`テーブル）
- スポットの却下（`spots`テーブルの`status`を`rejected`に更新）
- 投稿者へのメール通知
- Discordメッセージの更新（却下済み表示）

### 5. Discord通知の更新

**ファイル**: `supabase/functions/send-discord-notification/index.ts`

- Bot APIを使用してボタン付きメッセージを送信
- Webhookにフォールバック（Bot APIが使用できない場合）

## データベース設計

### `spot_approvals`テーブル

承認履歴を記録するテーブル。複数人承認に対応できる設計。

```sql
CREATE TABLE spot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  approver_id TEXT NOT NULL, -- Discord user ID or Supabase user ID
  approver_type TEXT NOT NULL CHECK (approver_type IN ('discord', 'supabase')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  rejection_reason TEXT, -- 却下理由（却下の場合のみ）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spot_id, approver_id, approver_type)
);
```

### `admin_users`テーブルの拡張

DiscordユーザーIDを追加：

```sql
ALTER TABLE admin_users
ADD COLUMN discord_user_id TEXT;
```

## 設定手順

### Step 1: パッケージのインストール

```bash
npm install tweetnacl
npm install --save-dev @types/tweetnacl
```

### Step 2: データベースマイグレーションの実行

Supabase SQL Editorで以下を実行：

```sql
-- spot_approvalsテーブルの作成
-- supabase/migrations/20250101000000_create_spot_approvals.sql

-- admin_usersテーブルにdiscord_user_idを追加
-- supabase/migrations/20250101000001_add_discord_user_id_to_admin_users.sql
```

### Step 3: 環境変数の設定

#### Next.js（Vercel）

Vercelダッシュボード → **Settings** → **Environment Variables**:

- `DISCORD_PUBLIC_KEY`: Discord Applicationの公開鍵（署名検証用）
  - **取得方法**:
    1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
    2. アプリケーションを選択（または新規作成）
    3. **General Information** タブを開く
    4. **Public Key** の値をコピー（32文字の16進数文字列）
    5. この値を環境変数`DISCORD_PUBLIC_KEY`に設定

#### Supabase Edge Function

Supabaseダッシュボード → **Edge Functions** → **Settings** → **Secrets**:

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID
- `DISCORD_WEBHOOK_URL`: Webhook URL（フォールバック用、オプション）
- `ADMIN_URL`: 承認ページのURL（例: `https://www.skateright.io/admin`）

### Step 4: 管理者のDiscordユーザーIDを設定

Supabase SQL Editorで実行：

```sql
-- 管理者のDiscordユーザーIDを設定
-- discord_user_idは、Discordでユーザーを右クリック → 「IDをコピー」で取得できます
UPDATE admin_users
SET discord_user_id = 'YOUR_DISCORD_USER_ID'
WHERE user_id = 'YOUR_SUPABASE_USER_ID';
```

### Step 5: Discord Interaction Endpoint URLの設定

1. Discord Developer Portal → **General Information** → **Interactions Endpoint URL**
2. 以下のURLを設定：
   ```
   https://www.skateright.io/api/discord/interactions
   ```
3. **Save Changes** をクリック

### Step 6: Edge Functionのデプロイ

```bash
npx supabase functions deploy send-discord-notification
```

## 使用方法

### 記録が投稿されたとき

1. Discordチャンネルに通知が送信される
2. メッセージに「承認」と「却下」のボタンが表示される

### 承認する場合

1. 「承認」ボタンをクリック
2. 記録が即座に承認される
3. Discordメッセージが更新される（承認済み表示）
4. 投稿者にメール通知が送信される

### 却下する場合

1. 「却下」ボタンをクリック
2. 却下理由を入力するモーダルが表示される
3. 却下理由を入力して送信
4. 記録が却下される
5. Discordメッセージが更新される（却下済み表示）
6. 投稿者にメール通知が送信される

## セキュリティ

### 管理者認証

- DiscordユーザーIDと`admin_users`テーブルの`discord_user_id`を照合
- 管理者でない場合はエラーメッセージを表示

### 署名検証

- Discord Interactionの署名を検証
- 不正なリクエストを拒否

### 重複承認の防止

- `spot_approvals`テーブルの`UNIQUE`制約で同じ人が2回承認できないようにする

## トラブルシューティング

### Botがメッセージを送信できない

1. Botがサーバーに追加されているか確認
2. Botに必要な権限があるか確認
3. チャンネルIDが正しいか確認

### ボタンが動作しない

1. Interaction Endpoint URLが正しく設定されているか確認
2. 署名検証が正しく動作しているか確認（環境変数`DISCORD_PUBLIC_KEY`が設定されているか）
3. 管理者のDiscordユーザーIDが正しく設定されているか確認

### 承認が反映されない

1. データベースマイグレーションが実行されているか確認
2. `spot_approvals`テーブルにデータが記録されているか確認
3. エラーログを確認

## 次のステップ（Phase 2: 複数人承認）

将来的に複数人承認が必要になった場合：

1. 承認設定テーブルを作成
2. 必要な承認数を設定
3. 承認ロジックを拡張（承認数を確認して自動承認）
4. Discordメッセージに承認状況を表示

詳細は `doc/multi-approval-design.md` を参照してください。

