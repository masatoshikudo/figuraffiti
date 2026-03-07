-- 開発環境用のテストデータ
-- このファイルは開発環境でのみ使用されます

-- テスト用のスポットデータを追加
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  ('test-spot-1', '渋谷スクランブル交差点', 35.6598, 139.7006, 2020, '東京都', 'approved', NOW()),
  ('test-spot-2', '新宿駅前', 35.6896, 139.7006, 2021, '東京都', 'approved', NOW()),
  ('test-spot-3', '原宿竹下通り', 35.6702, 139.7026, 2019, '東京都', 'approved', NOW()),
  ('test-spot-4', '大阪梅田', 34.7054, 135.4983, 2022, '大阪府', 'approved', NOW()),
  ('test-spot-5', '名古屋栄', 35.1706, 136.8816, 2021, '愛知県', 'approved', NOW())
ON CONFLICT (id) DO NOTHING;

-- テスト用のメディアデータを追加
-- 既存のメディアを削除してから追加（リセット時にクリーンな状態にする）
DELETE FROM spot_media WHERE spot_id IN ('test-spot-1', 'test-spot-2', 'test-spot-3', 'test-spot-4', 'test-spot-5');

INSERT INTO spot_media (spot_id, type, source, url, created_at) VALUES
  ('test-spot-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test1', NOW()),
  ('test-spot-2', 'cover', 'Instagram', 'https://www.instagram.com/p/test2', NOW()),
  ('test-spot-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test3', NOW()),
  ('test-spot-4', 'cover', 'Instagram', 'https://www.instagram.com/p/test4', NOW()),
  ('test-spot-5', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test5', NOW());

-- ホットスポット用のダミーデータ（1週間以内に登録された記録）
-- デバッグ用: created_atをNOW()に設定して確実に1週間以内にする
-- アメリカ（ロサンゼルス）: 34.0522, -118.2437 を中心に半径25m以内に6件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  -- 25m以内に確実に収めるため、中心から±0.00003度程度（≒数m）に制限
  ('hotspot-us-1', 'LA Downtown Spot 1', 34.052200, -118.243700, 2024, 'California', 'approved', NOW()),
  ('hotspot-us-2', 'LA Downtown Spot 2', 34.052230, -118.243670, 2024, 'California', 'approved', NOW()),
  ('hotspot-us-3', 'LA Downtown Spot 3', 34.052230, -118.243730, 2024, 'California', 'approved', NOW()),
  ('hotspot-us-4', 'LA Downtown Spot 4', 34.052170, -118.243670, 2024, 'California', 'approved', NOW()),
  ('hotspot-us-5', 'LA Downtown Spot 5', 34.052170, -118.243730, 2024, 'California', 'approved', NOW()),
  ('hotspot-us-6', 'LA Downtown Spot 6', 34.052220, -118.243700, 2024, 'California', 'approved', NOW())
ON CONFLICT (id) DO UPDATE
SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = NOW();

-- イギリス（ロンドン）: 51.5074, -0.1278 を中心に半径25m以内に5件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  -- 中心から±0.00002度程度に制限（≒数m）
  ('hotspot-uk-1', 'London Central Spot 1', 51.507400, -0.127800, 2024, 'London', 'approved', NOW()),
  ('hotspot-uk-2', 'London Central Spot 2', 51.507420, -0.127780, 2024, 'London', 'approved', NOW()),
  ('hotspot-uk-3', 'London Central Spot 3', 51.507420, -0.127820, 2024, 'London', 'approved', NOW()),
  ('hotspot-uk-4', 'London Central Spot 4', 51.507380, -0.127780, 2024, 'London', 'approved', NOW()),
  ('hotspot-uk-5', 'London Central Spot 5', 51.507380, -0.127820, 2024, 'London', 'approved', NOW())
ON CONFLICT (id) DO UPDATE
SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = NOW();

-- オーストラリア（シドニー）: -33.8688, 151.2093 を中心に半径25m以内に7件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  -- 25m以内に確実に収めるため、中心から±0.00003度程度（≒数m）に制限
  ('hotspot-au-1', 'Sydney CBD Spot 1', -33.868800, 151.209300, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-2', 'Sydney CBD Spot 2', -33.868770, 151.209330, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-3', 'Sydney CBD Spot 3', -33.868770, 151.209270, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-4', 'Sydney CBD Spot 4', -33.868830, 151.209330, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-5', 'Sydney CBD Spot 5', -33.868830, 151.209270, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-6', 'Sydney CBD Spot 6', -33.868810, 151.209300, 2024, 'NSW', 'approved', NOW()),
  ('hotspot-au-7', 'Sydney CBD Spot 7', -33.868790, 151.209300, 2024, 'NSW', 'approved', NOW())
ON CONFLICT (id) DO UPDATE
SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = NOW();

-- ホットスポット用のメディアデータ
DELETE FROM spot_media WHERE spot_id LIKE 'hotspot-%';

INSERT INTO spot_media (spot_id, type, source, url, created_at) VALUES
  -- アメリカ
  ('hotspot-us-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-us-1', NOW() - INTERVAL '1 day'),
  ('hotspot-us-2', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-us-2', NOW() - INTERVAL '2 days'),
  ('hotspot-us-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-us-3', NOW() - INTERVAL '3 days'),
  ('hotspot-us-4', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-us-4', NOW() - INTERVAL '4 days'),
  ('hotspot-us-5', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-us-5', NOW() - INTERVAL '5 days'),
  ('hotspot-us-6', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-us-6', NOW() - INTERVAL '6 days'),
  -- イギリス
  ('hotspot-uk-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-uk-1', NOW() - INTERVAL '1 day'),
  ('hotspot-uk-2', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-uk-2', NOW() - INTERVAL '2 days'),
  ('hotspot-uk-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-uk-3', NOW() - INTERVAL '3 days'),
  ('hotspot-uk-4', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-uk-4', NOW() - INTERVAL '4 days'),
  ('hotspot-uk-5', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-uk-5', NOW() - INTERVAL '5 days'),
  -- オーストラリア
  ('hotspot-au-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-au-1', NOW() - INTERVAL '1 day'),
  ('hotspot-au-2', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-au-2', NOW() - INTERVAL '2 days'),
  ('hotspot-au-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-au-3', NOW() - INTERVAL '3 days'),
  ('hotspot-au-4', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-au-4', NOW() - INTERVAL '4 days'),
  ('hotspot-au-5', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-au-5', NOW() - INTERVAL '5 days'),
  ('hotspot-au-6', 'cover', 'Instagram', 'https://www.instagram.com/p/hotspot-au-6', NOW() - INTERVAL '6 days'),
  ('hotspot-au-7', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-au-7', NOW() - INTERVAL '7 days');

