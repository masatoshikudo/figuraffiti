# 複数人承認システムの設計

## 概要

将来的に複数人の承認が必要になる可能性を考慮し、拡張可能な設計で実装します。

## 設計方針

### Phase 1: 一人承認（現在）

- 一人の管理者が承認/却下を実行
- 承認/却下は即座に反映される

### Phase 2: 複数人承認（将来）

- 複数の管理者が承認/却下を実行
- 必要な承認数に達したら自動的に承認される
- 却下は一人でも可能（または複数人必要）

## データベース設計

### `spot_approvals` テーブル（新規作成）

複数人承認に対応するため、承認履歴を記録するテーブルを作成します。

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

CREATE INDEX idx_spot_approvals_spot_id ON spot_approvals(spot_id);
CREATE INDEX idx_spot_approvals_approver ON spot_approvals(approver_id, approver_type);
```

### `spots` テーブルの変更

既存の`approved_by`と`approved_at`は、最後の承認者と承認日時を記録します。

複数人承認の場合：
- `approved_by`: 最後に承認した管理者のID
- `approved_at`: 最後の承認日時
- `status`: 必要な承認数に達したら`approved`、却下されたら`rejected`

### 承認設定テーブル（将来の拡張用）

```sql
CREATE TABLE approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  required_approvals INTEGER NOT NULL DEFAULT 1, -- 必要な承認数
  allow_single_rejection BOOLEAN NOT NULL DEFAULT true, -- 一人でも却下可能か
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 実装設計

### Phase 1: 一人承認の実装

#### Discord Interaction Endpoint

`app/api/discord/interactions/route.ts`:

```typescript
// 承認ボタンクリック時
if (customId.startsWith("approve_")) {
  const spotId = customId.replace("approve_", "")
  
  // 1. 承認履歴を記録
  await recordApproval(spotId, discordUserId, 'discord', 'approved')
  
  // 2. スポットを承認
  await approveSpot(spotId, discordUserId)
  
  // 3. Discordメッセージを更新
  await updateDiscordMessage(interaction, 'approved')
}

// 却下ボタンクリック時
if (customId.startsWith("reject_")) {
  const spotId = customId.replace("reject_", "")
  
  // モーダルで却下理由を入力
  // その後、却下を実行
}
```

#### 承認ロジック

```typescript
async function approveSpot(spotId: string, approverId: string) {
  // 1. 承認履歴を記録
  await recordApproval(spotId, approverId, 'discord', 'approved')
  
  // 2. スポットを承認（Phase 1では即座に承認）
  await updateSpotStatus(spotId, 'approved', approverId)
  
  // 3. 投稿者に通知
  await notifySubmitter(spotId, 'approved')
}
```

### Phase 2: 複数人承認への拡張

#### 承認ロジックの拡張

```typescript
async function approveSpot(spotId: string, approverId: string) {
  // 1. 承認履歴を記録
  await recordApproval(spotId, approverId, 'discord', 'approved')
  
  // 2. 承認数を確認
  const approvalCount = await getApprovalCount(spotId)
  const requiredApprovals = await getRequiredApprovals() // デフォルト: 1
  
  // 3. 必要な承認数に達したら承認
  if (approvalCount >= requiredApprovals) {
    await updateSpotStatus(spotId, 'approved', approverId)
    await notifySubmitter(spotId, 'approved')
    await notifyAllApprovers(spotId, 'approved')
  } else {
    // 承認待ち（他の承認者を待つ）
    await notifyOtherApprovers(spotId, approverId, approvalCount, requiredApprovals)
  }
}
```

#### Discordメッセージの更新

承認状況を表示：

```
🔔 新しい記録が承認待ちです

[埋め込みメッセージ]
- 記録ID: xxx
- 場所: xxx
- 技名: xxx
- 投稿者: xxx@example.com

承認状況: 1/2 ✅
- @user1 が承認しました
- あと1人の承認が必要です

[ボタン]
[承認] [却下]
```

## 実装の優先順位

### Step 1: 一人承認の実装（現在）

1. Discord Botの作成と設定
2. Discord Interaction Endpointの実装
3. 承認/却下APIの呼び出し
4. Discordメッセージの更新
5. `spot_approvals`テーブルの作成（履歴記録用）

### Step 2: 複数人承認への拡張（将来）

1. 承認設定の追加
2. 承認数の確認ロジック
3. 承認状況の表示
4. 自動承認の実装

## データベースマイグレーション

### Phase 1用のマイグレーション

```sql
-- spot_approvalsテーブルの作成
CREATE TABLE IF NOT EXISTS spot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  approver_id TEXT NOT NULL,
  approver_type TEXT NOT NULL CHECK (approver_type IN ('discord', 'supabase')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spot_id, approver_id, approver_type)
);

CREATE INDEX IF NOT EXISTS idx_spot_approvals_spot_id ON spot_approvals(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_approvals_approver ON spot_approvals(approver_id, approver_type);

-- 既存の承認データを移行（オプション）
-- 既存のapproved_byとapproved_atから承認履歴を作成
```

## セキュリティ考慮事項

### 管理者認証

1. **DiscordユーザーIDと管理者のマッピング**:
   - `admin_users`テーブルに`discord_user_id`カラムを追加
   - Discord Interactionで管理者権限を確認

2. **重複承認の防止**:
   - `spot_approvals`テーブルの`UNIQUE`制約で同じ人が2回承認できないようにする

3. **却下の権限**:
   - 一人でも却下可能（デフォルト）
   - 設定で変更可能

## 将来の拡張性

### 承認ルールのカスタマイズ

- 必要な承認数を設定可能にする
- 却下に必要な人数を設定可能にする
- 特定の管理者のみが承認可能にする

### 承認状況の可視化

- Discordメッセージに承認状況を表示
- Webページにも承認状況を表示
- 承認履歴を表示

### 通知機能の拡張

- 承認待ちの管理者に通知
- 承認が完了したら全承認者に通知
- 却下された場合の通知

## まとめ

Phase 1では一人承認を実装し、データベース設計は複数人承認に対応できるようにします。

将来的に複数人承認が必要になった場合：
1. 承認ロジックを拡張するだけ
2. データベース設計は変更不要
3. Discordメッセージの表示を更新するだけ

この設計により、段階的に機能を拡張できます。

