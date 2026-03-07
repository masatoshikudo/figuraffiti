-- RLSポリシーの修正: 自分の投稿取得用
-- このSQLをSupabaseのSQL Editorで実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own submissions" ON spots;

-- 修正版: 自分の投稿を確実に取得できるようにする
-- submitted_byがNULLの場合は除外し、自分の投稿のみを取得
CREATE POLICY "Users can view their own submissions" ON spots
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- 承認済みのスポットは誰でも閲覧可能（既に別のポリシーでカバーされているが、明示的に含める）
      status = 'approved' OR 
      -- 自分の投稿は全ステータスで閲覧可能
      (submitted_by IS NOT NULL AND submitted_by = auth.uid())
    )
  );

