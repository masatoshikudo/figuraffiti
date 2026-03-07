# 設計ドキュメント

## コア機能

詳細は `doc/core-features-minimal.md` を参照してください。

### 主要機能

1. **記録の投稿** (`/submit`) - 地図上でピンを立てて記録を投稿
2. **記録のアーカイブ表示** (`/mapping`) - 地図上で承認済み記録を表示
3. **承認管理** (`/admin`) - 管理者による承認/却下

### 承認フロー

詳細は `doc/submission-flow.md` を参照してください。

1. ユーザーが記録を投稿（`status: pending`）
2. 管理者にメール通知とDiscord通知が送信
3. Discordまたは管理画面で承認/却下
4. 投稿者にメール通知が送信

## Discord統合

### Phase 1: 一人承認（現在）

- Discordのボタンで承認/却下を実行
- 承認履歴を`spot_approvals`テーブルに記録
- 複数人承認への拡張に対応した設計

詳細は `DISCORD_PHASE1_IMPLEMENTATION.md` を参照してください。

### 将来の拡張

複数人承認への対応については `doc/multi-approval-design.md` を参照してください。

## データベース設計

### 主要テーブル

- `spots` - 記録情報
- `spot_media` - メディア情報
- `spot_approvals` - 承認履歴
- `admin_users` - 管理者情報（`discord_user_id`を含む）

詳細は `supabase/schema.sql` を参照してください。

