-- UPDATEとDELETEのRLSポリシーを追加
-- このSQLをSupabaseのSQL Editorで実行してください

-- spotsテーブルのUPDATEとDELETEポリシー
CREATE POLICY "Allow public update on spots" ON spots
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on spots" ON spots
  FOR DELETE USING (true);

-- spot_mediaテーブルのUPDATEとDELETEポリシー
CREATE POLICY "Allow public update on spot_media" ON spot_media
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on spot_media" ON spot_media
  FOR DELETE USING (true);

