# Discord承認統合の設計

## 概要

承認作業をDiscordで行えるようにするため、Discord Botを統合します。新しい記録が投稿されると、Discordチャンネルに通知が送信され、ボタンで承認/却下を実行できます。

## 実装方法

### 方法1: Discord Webhook + インタラクション（推奨）

**メリット**:
- 実装が比較的簡単
- Discord Botの認証が不要（Webhookのみ）
- ボタンで承認/却下を実行可能

**デメリット**:
- Webhookではインタラクション（ボタン）が制限される可能性がある
- 完全なBot APIの方が柔軟性が高い

### 方法2: Discord Bot API + インタラクション（推奨）

**メリット**:
- 完全な機能を利用可能
- ボタン、セレクトメニューなどのインタラクションが使用可能
- より柔軟な実装が可能

**デメリット**:
- Botの認証と設定が必要
- 実装がやや複雑

## 推奨実装: Discord Bot API + インタラクション

### アーキテクチャ

```
記録投稿 → Edge Function → Discord Bot API → Discordチャンネル
                                                      ↓
承認/却下ボタンクリック → Discord Interaction → Next.js API → Supabase
```

### 実装手順

#### Step 1: Discord Botの作成と設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. **New Application** をクリックしてアプリケーションを作成
3. **Bot** タブでBotを作成
4. **OAuth2** → **URL Generator** で以下を設定：
   - **Scopes**: `bot`, `applications.commands`
   - **Bot Permissions**: `Send Messages`, `Use Slash Commands`, `Use External Emojis`
5. BotをDiscordサーバーに招待
6. **Bot** タブで **Token** をコピー（環境変数に設定）

#### Step 2: Discord Webhookの作成（通知用）

1. Discordチャンネルの設定 → **連携サービス** → **ウェブフック**
2. 新しいウェブフックを作成
3. Webhook URLをコピー（環境変数に設定）

#### Step 3: Edge Functionの作成

**`supabase/functions/send-discord-notification/index.ts`**:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { spotId, spotName, submittedByEmail, trickName, mediaUrl } = await req.json()
  
  const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL")
  const adminUrl = Deno.env.get("ADMIN_URL") || "https://www.skateright.io/admin"
  
  // Discordにメッセージを送信（ボタン付き）
  const response = await fetch(discordWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "新しい記録が承認待ちです",
      embeds: [{
        title: "承認待ちの記録",
        fields: [
          { name: "記録ID", value: spotId, inline: true },
          { name: "場所", value: spotName || "（場所名なし）", inline: true },
          { name: "技名", value: trickName || "（未入力）", inline: true },
          { name: "投稿者", value: submittedByEmail || "匿名", inline: true },
          { name: "メディアURL", value: mediaUrl || "なし", inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
      components: [{
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 3, // SUCCESS (緑)
            label: "承認",
            custom_id: `approve_${spotId}`,
          },
          {
            type: 2, // BUTTON
            style: 4, // DANGER (赤)
            label: "却下",
            custom_id: `reject_${spotId}`,
          },
        ],
      }],
    }),
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

#### Step 4: Discord Interaction Endpointの作成

**`app/api/discord/interactions/route.ts`**:

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { verifyDiscordSignature } from "@/lib/discord/verify-signature"

export async function POST(request: NextRequest) {
  // Discordの署名を検証
  const signature = request.headers.get("X-Signature-Ed25519")
  const timestamp = request.headers.get("X-Signature-Timestamp")
  
  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }
  
  const body = await request.text()
  const isValid = await verifyDiscordSignature(body, signature, timestamp)
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }
  
  const interaction = JSON.parse(body)
  
  // PINGリクエスト（Discordの検証用）
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 })
  }
  
  // ボタンクリック
  if (interaction.type === 3) {
    const customId = interaction.data.custom_id
    
    if (customId.startsWith("approve_")) {
      const spotId = customId.replace("approve_", "")
      // 承認APIを呼び出し
      // ...
    } else if (customId.startsWith("reject_")) {
      const spotId = customId.replace("reject_", "")
      // 却下APIを呼び出し（理由入力が必要）
      // ...
    }
  }
  
  return NextResponse.json({ type: 4 }) // DEFERRED_UPDATE_MESSAGE
}
```

#### Step 5: 承認/却下APIの呼び出し

Discord Interactionから承認/却下APIを呼び出す際は、管理者の認証が必要です。

**解決策**:
1. **DiscordユーザーIDと管理者のマッピング**: `admin_users`テーブルに`discord_user_id`カラムを追加
2. **一時的な認証トークン**: Discord Interaction用の一時的な認証トークンを生成
3. **Discord OAuth2**: Discordでログインして管理者権限を確認

## 実装の選択肢

### オプション1: Discord Webhookのみ（シンプル）

**メリット**:
- 実装が簡単
- Botの認証が不要

**デメリット**:
- ボタンでの承認/却下ができない（リンクのみ）
- 承認/却下はWebページで行う必要がある

**実装**:
- Webhookでメッセージを送信
- メッセージに承認ページへのリンクを含める

### オプション2: Discord Bot + Webhook（推奨）

**メリット**:
- ボタンで承認/却下を実行可能
- 完全なインタラクションが可能

**デメリット**:
- Botの認証と設定が必要
- 実装がやや複雑

**実装**:
- Webhookで通知を送信
- Bot APIでインタラクション（ボタン）を処理
- 承認/却下APIを呼び出し

### オプション3: Discord Botのみ

**メリット**:
- 最も柔軟な実装
- すべてのDiscord機能を利用可能

**デメリット**:
- 実装が最も複雑
- Botの認証と設定が必要

## 推奨実装: オプション2（Discord Bot + Webhook）

### 理由

1. **実装のバランス**: シンプルさと機能性のバランスが良い
2. **ユーザー体験**: ボタンで承認/却下を実行できる
3. **拡張性**: 将来的に機能を追加しやすい

### 実装の流れ

1. **記録投稿時**:
   - Edge FunctionがDiscord Webhookを呼び出し
   - Discordチャンネルにメッセージを送信（ボタン付き）

2. **承認/却下ボタンクリック時**:
   - Discord Interaction Endpointが呼び出される
   - 管理者の認証を確認
   - 承認/却下APIを呼び出し
   - Discordメッセージを更新（承認済み/却下済み）

3. **却下の場合**:
   - モーダルで却下理由を入力
   - 却下APIを呼び出し

## 必要な設定

### 環境変数

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DISCORD_WEBHOOK_URL`: Discord WebhookのURL
- `DISCORD_PUBLIC_KEY`: Discord Applicationの公開鍵（署名検証用）
- `DISCORD_GUILD_ID`: DiscordサーバーID（オプション）
- `DISCORD_CHANNEL_ID`: 通知を送信するチャンネルID

### データベース変更

`admin_users`テーブルに`discord_user_id`カラムを追加（オプション）:

```sql
ALTER TABLE admin_users ADD COLUMN discord_user_id TEXT;
```

## 次のステップ

1. **Discord Botの作成と設定**
2. **Edge Functionの実装**（Discord通知送信）
3. **Discord Interaction Endpointの実装**（ボタンクリック処理）
4. **管理者認証の実装**（DiscordユーザーIDと管理者のマッピング）
5. **テストとデプロイ**

## 参考資料

- [Discord Developer Portal](https://discord.com/developers/docs)
- [Discord Interactions](https://discord.com/developers/docs/interactions/overview)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)

