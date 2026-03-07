-- 位置情報ベースのスポット検索を高速化するためのインデックス
-- このSQLをSupabaseのSQL Editorで実行してください

-- lat/lngの複合インデックスを作成（範囲検索を高速化）
CREATE INDEX IF NOT EXISTS idx_spots_lat_lng ON spots(lat, lng);

-- 既存のインデックスも確認
-- idx_spots_prefecture, idx_spots_year は既に存在するはず
-- idx_spots_tags は tags カラムが存在する場合のみ作成される

