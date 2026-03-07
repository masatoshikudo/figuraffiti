-- 複数人承認システムに対応するためのspot_approvalsテーブル
-- Phase 1では一人承認を実装し、将来的に複数人承認に対応できる設計

-- spot_approvalsテーブルの作成
CREATE TABLE IF NOT EXISTS spot_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  approver_id TEXT NOT NULL, -- Discord user ID or Supabase user ID
  approver_type TEXT NOT NULL CHECK (approver_type IN ('discord', 'supabase')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  rejection_reason TEXT, -- 却下理由（却下の場合のみ）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(spot_id, approver_id, approver_type)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_spot_approvals_spot_id ON spot_approvals(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_approvals_approver ON spot_approvals(approver_id, approver_type);
CREATE INDEX IF NOT EXISTS idx_spot_approvals_status ON spot_approvals(status);

-- RLSポリシーの設定
ALTER TABLE spot_approvals ENABLE ROW LEVEL SECURITY;

-- 管理者はすべての承認履歴を閲覧可能
CREATE POLICY "Allow admins to view all approvals"
  ON spot_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 管理者は承認履歴を作成可能
CREATE POLICY "Allow admins to create approvals"
  ON spot_approvals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- コメント
COMMENT ON TABLE spot_approvals IS '記録の承認履歴を記録するテーブル。複数人承認に対応可能な設計。';
COMMENT ON COLUMN spot_approvals.approver_id IS '承認者のID（Discord user IDまたはSupabase user ID）';
COMMENT ON COLUMN spot_approvals.approver_type IS '承認者のタイプ（discordまたはsupabase）';
COMMENT ON COLUMN spot_approvals.status IS '承認状態（approvedまたはrejected）';

