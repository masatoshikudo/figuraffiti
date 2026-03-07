-- ============================================
-- 統合ダミーデータSQL
-- 開発環境・本番環境共通で使用可能
-- Supabase DashboardのSQL Editorから実行してください
-- ============================================

-- ============================================
-- セクション1: 基本テストデータ
-- ============================================

-- テスト用のスポットデータを追加
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  ('test-spot-1', '渋谷スクランブル交差点', 35.6598, 139.7006, 2020, '東京都', 'approved', NOW()),
  ('test-spot-2', '新宿駅前', 35.6896, 139.7006, 2021, '東京都', 'approved', NOW()),
  ('test-spot-3', '原宿竹下通り', 35.6702, 139.7026, 2019, '東京都', 'approved', NOW()),
  ('test-spot-4', '大阪梅田', 34.7054, 135.4983, 2022, '大阪府', 'approved', NOW()),
  ('test-spot-5', '名古屋栄', 35.1706, 136.8816, 2021, '愛知県', 'approved', NOW())
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  year = EXCLUDED.year,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- テスト用のメディアデータを追加
DELETE FROM spot_media WHERE spot_id IN ('test-spot-1', 'test-spot-2', 'test-spot-3', 'test-spot-4', 'test-spot-5');

INSERT INTO spot_media (spot_id, type, source, url, created_at) VALUES
  ('test-spot-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test1', NOW()),
  ('test-spot-2', 'cover', 'Instagram', 'https://www.instagram.com/p/test2', NOW()),
  ('test-spot-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test3', NOW()),
  ('test-spot-4', 'cover', 'Instagram', 'https://www.instagram.com/p/test4', NOW()),
  ('test-spot-5', 'video', 'YouTube', 'https://www.youtube.com/watch?v=test5', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- セクション2: ホットスポットデータ（海外）
-- 直近7日以内に登録された記録で、同じ場所（25m以内）に5件以上
-- ============================================

-- 既存のホットスポットデータを削除（重複を防ぐため）
DELETE FROM spot_media WHERE spot_id LIKE 'hotspot-%';
DELETE FROM spots WHERE id LIKE 'hotspot-%';

-- アメリカ（ロサンゼルス）: 34.0522, -118.2437 を中心に半径25m以内に6件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  ('hotspot-us-1', 'LA Downtown Spot 1', 34.052200, -118.243700, 2024, 'California', 'approved', NOW() - INTERVAL '1 day'),
  ('hotspot-us-2', 'LA Downtown Spot 2', 34.052230, -118.243670, 2024, 'California', 'approved', NOW() - INTERVAL '2 days'),
  ('hotspot-us-3', 'LA Downtown Spot 3', 34.052230, -118.243730, 2024, 'California', 'approved', NOW() - INTERVAL '3 days'),
  ('hotspot-us-4', 'LA Downtown Spot 4', 34.052170, -118.243670, 2024, 'California', 'approved', NOW() - INTERVAL '4 days'),
  ('hotspot-us-5', 'LA Downtown Spot 5', 34.052170, -118.243730, 2024, 'California', 'approved', NOW() - INTERVAL '5 days'),
  ('hotspot-us-6', 'LA Downtown Spot 6', 34.052220, -118.243700, 2024, 'California', 'approved', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = EXCLUDED.created_at;

-- イギリス（ロンドン）: 51.5074, -0.1278 を中心に半径25m以内に5件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  ('hotspot-uk-1', 'London Central Spot 1', 51.507400, -0.127800, 2024, 'London', 'approved', NOW() - INTERVAL '1 day'),
  ('hotspot-uk-2', 'London Central Spot 2', 51.507420, -0.127780, 2024, 'London', 'approved', NOW() - INTERVAL '2 days'),
  ('hotspot-uk-3', 'London Central Spot 3', 51.507420, -0.127820, 2024, 'London', 'approved', NOW() - INTERVAL '3 days'),
  ('hotspot-uk-4', 'London Central Spot 4', 51.507380, -0.127780, 2024, 'London', 'approved', NOW() - INTERVAL '4 days'),
  ('hotspot-uk-5', 'London Central Spot 5', 51.507380, -0.127820, 2024, 'London', 'approved', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = EXCLUDED.created_at;

-- オーストラリア（シドニー）: -33.8688, 151.2093 を中心に半径25m以内に7件
INSERT INTO spots (id, spot_name, lat, lng, year, prefecture, status, created_at) VALUES
  ('hotspot-au-1', 'Sydney CBD Spot 1', -33.868800, 151.209300, 2024, 'NSW', 'approved', NOW() - INTERVAL '1 day'),
  ('hotspot-au-2', 'Sydney CBD Spot 2', -33.868770, 151.209330, 2024, 'NSW', 'approved', NOW() - INTERVAL '2 days'),
  ('hotspot-au-3', 'Sydney CBD Spot 3', -33.868770, 151.209270, 2024, 'NSW', 'approved', NOW() - INTERVAL '3 days'),
  ('hotspot-au-4', 'Sydney CBD Spot 4', -33.868830, 151.209330, 2024, 'NSW', 'approved', NOW() - INTERVAL '4 days'),
  ('hotspot-au-5', 'Sydney CBD Spot 5', -33.868830, 151.209270, 2024, 'NSW', 'approved', NOW() - INTERVAL '5 days'),
  ('hotspot-au-6', 'Sydney CBD Spot 6', -33.868810, 151.209300, 2024, 'NSW', 'approved', NOW() - INTERVAL '6 days'),
  ('hotspot-au-7', 'Sydney CBD Spot 7', -33.868790, 151.209300, 2024, 'NSW', 'approved', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  created_at = EXCLUDED.created_at;

-- ホットスポット用のメディアデータ（海外）
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
  ('hotspot-au-7', 'video', 'YouTube', 'https://www.youtube.com/watch?v=hotspot-au-7', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- セクション3: ホットスポットデータ（国内）
-- 直近7日以内に登録された記録で、同じ場所（25m以内）に5件以上
-- ============================================

-- ホットスポットA: 渋谷駅前（25m以内に6件の記録を配置）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at) VALUES
  ('dummy-hotspot-a-1', '渋谷駅前', 'Ollie', 35.6585, 139.7012, '東京都', 'approved', NOW() - INTERVAL '1 day'),
  ('dummy-hotspot-a-2', '渋谷駅前', 'Kickflip', 35.6586, 139.7013, '東京都', 'approved', NOW() - INTERVAL '2 days'),
  ('dummy-hotspot-a-3', '渋谷駅前', 'Heelflip', 35.6584, 139.7011, '東京都', 'approved', NOW() - INTERVAL '3 days'),
  ('dummy-hotspot-a-4', '渋谷駅前', 'Pop Shove-it', 35.6587, 139.7014, '東京都', 'approved', NOW() - INTERVAL '4 days'),
  ('dummy-hotspot-a-5', '渋谷駅前', 'Frontside 180', 35.6583, 139.7010, '東京都', 'approved', NOW() - INTERVAL '5 days'),
  ('dummy-hotspot-a-6', '渋谷駅前', 'Backside 180', 35.6588, 139.7015, '東京都', 'approved', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- ホットスポットB: 新宿駅東口（25m以内に7件の記録を配置）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at) VALUES
  ('dummy-hotspot-b-1', '新宿駅東口', 'Ollie', 35.6915, 139.7008, '東京都', 'approved', NOW() - INTERVAL '1 day'),
  ('dummy-hotspot-b-2', '新宿駅東口', 'Kickflip', 35.6916, 139.7009, '東京都', 'approved', NOW() - INTERVAL '2 days'),
  ('dummy-hotspot-b-3', '新宿駅東口', 'Heelflip', 35.6914, 139.7007, '東京都', 'approved', NOW() - INTERVAL '3 days'),
  ('dummy-hotspot-b-4', '新宿駅東口', 'Pop Shove-it', 35.6917, 139.7010, '東京都', 'approved', NOW() - INTERVAL '4 days'),
  ('dummy-hotspot-b-5', '新宿駅東口', 'Frontside 180', 35.6913, 139.7006, '東京都', 'approved', NOW() - INTERVAL '5 days'),
  ('dummy-hotspot-b-6', '新宿駅東口', 'Backside 180', 35.6918, 139.7011, '東京都', 'approved', NOW() - INTERVAL '6 days'),
  ('dummy-hotspot-b-7', '新宿駅東口', 'Shove-it', 35.6912, 139.7005, '東京都', 'approved', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- ホットスポットC: 渋谷宮益坂（25m以内に5件の記録を配置）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at) VALUES
  ('dummy-hotspot-c-1', '渋谷宮益坂', 'Ollie', 35.6575, 139.7018, '東京都', 'approved', NOW() - INTERVAL '1 day'),
  ('dummy-hotspot-c-2', '渋谷宮益坂', 'Kickflip', 35.6576, 139.7019, '東京都', 'approved', NOW() - INTERVAL '2 days'),
  ('dummy-hotspot-c-3', '渋谷宮益坂', 'Heelflip', 35.6574, 139.7017, '東京都', 'approved', NOW() - INTERVAL '3 days'),
  ('dummy-hotspot-c-4', '渋谷宮益坂', 'Pop Shove-it', 35.6577, 139.7020, '東京都', 'approved', NOW() - INTERVAL '4 days'),
  ('dummy-hotspot-c-5', '渋谷宮益坂', 'Frontside 180', 35.6573, 139.7016, '東京都', 'approved', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- ホットスポット用のメディアデータ（国内）
INSERT INTO spot_media (spot_id, type, source, url, thumb_url, created_at) VALUES
  ('dummy-hotspot-a-1', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-a1', NULL, NOW()),
  ('dummy-hotspot-a-2', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-a2', NULL, NOW()),
  ('dummy-hotspot-a-3', 'video', 'Twitter', 'https://twitter.com/dummy-hotspot-a3', NULL, NOW()),
  ('dummy-hotspot-a-4', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-a4', NULL, NOW()),
  ('dummy-hotspot-a-5', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-a5', NULL, NOW()),
  ('dummy-hotspot-a-6', 'video', 'Twitter', 'https://twitter.com/dummy-hotspot-a6', NULL, NOW()),
  ('dummy-hotspot-b-1', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-b1', NULL, NOW()),
  ('dummy-hotspot-b-2', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-b2', NULL, NOW()),
  ('dummy-hotspot-b-3', 'video', 'Twitter', 'https://twitter.com/dummy-hotspot-b3', NULL, NOW()),
  ('dummy-hotspot-b-4', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-b4', NULL, NOW()),
  ('dummy-hotspot-b-5', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-b5', NULL, NOW()),
  ('dummy-hotspot-b-6', 'video', 'Twitter', 'https://twitter.com/dummy-hotspot-b6', NULL, NOW()),
  ('dummy-hotspot-b-7', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-b7', NULL, NOW()),
  ('dummy-hotspot-c-1', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-c1', NULL, NOW()),
  ('dummy-hotspot-c-2', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-c2', NULL, NOW()),
  ('dummy-hotspot-c-3', 'video', 'Twitter', 'https://twitter.com/dummy-hotspot-c3', NULL, NOW()),
  ('dummy-hotspot-c-4', 'video', 'Instagram', 'https://instagram.com/p/dummy-hotspot-c4', NULL, NOW()),
  ('dummy-hotspot-c-5', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-hotspot-c5', NULL, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- セクション4: 更新可能性デモ用データ
-- 同じ場所（半径50m以内）に複数の記録を作成し、異なる難易度レベルの技を含める
-- ============================================

-- 東京（渋谷周辺）: 35.6598, 139.7006 を中心に半径50m以内に3件（進化パターン）
-- レベル1（Ollie, 2020年）→ レベル2（Kickflip, 2022年）→ レベル3（Hardflip, 2024年）
INSERT INTO spots (id, spot_name, trick, lat, lng, year, prefecture, status, created_at) VALUES
  ('update-demo-tokyo-1', '渋谷スクエア', 'Ollie', 35.659800, 139.700600, 2020, '東京都', 'approved', NOW() - INTERVAL '4 years'),
  ('update-demo-tokyo-2', '渋谷スクエア', 'Kickflip', 35.659850, 139.700650, 2022, '東京都', 'approved', NOW() - INTERVAL '2 years'),
  ('update-demo-tokyo-3', '渋谷スクエア', 'Hardflip', 35.659750, 139.700550, 2024, '東京都', 'approved', NOW() - INTERVAL '1 month')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  trick = EXCLUDED.trick,
  created_at = EXCLUDED.created_at;

-- 大阪（梅田周辺）: 34.7054, 135.4983 を中心に半径50m以内に2件
-- レベル1（Kickflip, 2021年）→ レベル2（360 Flip, 2023年）
INSERT INTO spots (id, spot_name, trick, lat, lng, year, prefecture, status, created_at) VALUES
  ('update-demo-osaka-1', '梅田プラザ', 'Kickflip', 34.705400, 135.498300, 2021, '大阪府', 'approved', NOW() - INTERVAL '3 years'),
  ('update-demo-osaka-2', '梅田プラザ', '360 Flip', 34.705450, 135.498350, 2023, '大阪府', 'approved', NOW() - INTERVAL '1 year')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  trick = EXCLUDED.trick,
  created_at = EXCLUDED.created_at;

-- 名古屋（栄周辺）: 35.1706, 136.8816 を中心に半径50m以内に4件
-- レベル2（Hardflip, 2020年）→ レベル2（Varial Kickflip, 2022年）→ レベル3（Laser Flip, 2024年）→ レベル1（Ollie, 2021年）
-- 代表記録: Laser Flip（レベル3、2024年）
INSERT INTO spots (id, spot_name, trick, lat, lng, year, prefecture, status, created_at) VALUES
  ('update-demo-nagoya-1', '栄セントラル', 'Hardflip', 35.170600, 136.881600, 2020, '愛知県', 'approved', NOW() - INTERVAL '4 years'),
  ('update-demo-nagoya-2', '栄セントラル', 'Varial Kickflip', 35.170650, 136.881650, 2022, '愛知県', 'approved', NOW() - INTERVAL '2 years'),
  ('update-demo-nagoya-3', '栄セントラル', 'Laser Flip', 35.170550, 136.881550, 2024, '愛知県', 'approved', NOW() - INTERVAL '1 month'),
  ('update-demo-nagoya-4', '栄セントラル', 'Ollie', 35.170620, 136.881620, 2021, '愛知県', 'approved', NOW() - INTERVAL '3 years')
ON CONFLICT (id) DO UPDATE SET
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  trick = EXCLUDED.trick,
  created_at = EXCLUDED.created_at;

-- 更新可能性デモ用のメディアデータ
DELETE FROM spot_media WHERE spot_id LIKE 'update-demo-%';

INSERT INTO spot_media (spot_id, type, source, url, created_at) VALUES
  -- 東京（進化パターン）
  ('update-demo-tokyo-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=update-demo-tokyo-1', NOW() - INTERVAL '4 years'),
  ('update-demo-tokyo-2', 'cover', 'Instagram', 'https://www.instagram.com/p/update-demo-tokyo-2', NOW() - INTERVAL '2 years'),
  ('update-demo-tokyo-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=update-demo-tokyo-3', NOW() - INTERVAL '1 month'),
  -- 大阪
  ('update-demo-osaka-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=update-demo-osaka-1', NOW() - INTERVAL '3 years'),
  ('update-demo-osaka-2', 'cover', 'Instagram', 'https://www.instagram.com/p/update-demo-osaka-2', NOW() - INTERVAL '1 year'),
  -- 名古屋
  ('update-demo-nagoya-1', 'video', 'YouTube', 'https://www.youtube.com/watch?v=update-demo-nagoya-1', NOW() - INTERVAL '4 years'),
  ('update-demo-nagoya-2', 'cover', 'Instagram', 'https://www.instagram.com/p/update-demo-nagoya-2', NOW() - INTERVAL '2 years'),
  ('update-demo-nagoya-3', 'video', 'YouTube', 'https://www.youtube.com/watch?v=update-demo-nagoya-3', NOW() - INTERVAL '1 month'),
  ('update-demo-nagoya-4', 'cover', 'Instagram', 'https://www.instagram.com/p/update-demo-nagoya-4', NOW() - INTERVAL '3 years')
ON CONFLICT DO NOTHING;

-- ============================================
-- セクション5: ステータス別ピンデザイン確認用データ
-- 承認済み、承認待ち、更新可能、高難易度の各ステータスを確認するためのデータ
-- ============================================

-- 1. 承認済み（緑）のスポット - 基本技（難易度レベル1）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-approved-1', '渋谷スクランブル交差点', 'Ollie', 35.6598, 139.7006, '東京都', 'approved', NOW() - INTERVAL '2 days'),
  ('dummy-approved-2', '渋谷ハチ公前', 'Kickflip', 35.6594, 139.7004, '東京都', 'approved', NOW() - INTERVAL '3 days'),
  ('dummy-approved-3', '新宿駅前', 'Heelflip', 35.6909, 139.7003, '東京都', 'approved', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

INSERT INTO spot_media (spot_id, type, source, url, thumb_url, created_at)
VALUES 
  ('dummy-approved-1', 'video', 'Instagram', 'https://instagram.com/p/dummy1', NULL, NOW()),
  ('dummy-approved-2', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy2', NULL, NOW()),
  ('dummy-approved-3', 'cover', 'Instagram', 'https://thrasher.com/dummy3', NULL, NOW())
ON CONFLICT DO NOTHING;

-- 2. 承認待ち（グレー）のスポット
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-pending-1', '渋谷センター街', 'Pop Shove-it', 35.6600, 139.7010, '東京都', 'pending', NOW() - INTERVAL '4 days'),
  ('dummy-pending-2', '新宿アルタ前', 'Frontside 180', 35.6910, 139.7005, '東京都', 'pending', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

INSERT INTO spot_media (spot_id, type, source, url, thumb_url, created_at)
VALUES 
  ('dummy-pending-1', 'video', 'Instagram', 'https://instagram.com/p/dummy-pending1', NULL, NOW()),
  ('dummy-pending-2', 'video', 'Twitter', 'https://twitter.com/dummy-pending2', NULL, NOW())
ON CONFLICT DO NOTHING;

-- 3. 高難易度（紫）のスポット - 上級技（難易度レベル3以上）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-high-diff-1', '渋谷マークシティ前', 'Laser Flip', 35.6580, 139.7015, '東京都', 'approved', NOW() - INTERVAL '1 day'),
  ('dummy-high-diff-2', '新宿サザンテラス', '360 Hardflip', 35.6920, 139.7010, '東京都', 'approved', NOW() - INTERVAL '2 days'),
  ('dummy-high-diff-3', '渋谷109前', 'Impossible', 35.6590, 139.7008, '東京都', 'approved', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

INSERT INTO spot_media (spot_id, type, source, url, thumb_url, created_at)
VALUES 
  ('dummy-high-diff-1', 'video', 'Instagram', 'https://thrasher.com/dummy-high1', NULL, NOW()),
  ('dummy-high-diff-2', 'video', 'YouTube', 'https://kawa.com/dummy-high2', NULL, NOW()),
  ('dummy-high-diff-3', 'cover', 'Other', 'https://transworld.com/dummy-high3', NULL, NOW())
ON CONFLICT DO NOTHING;

-- 4. 更新可能（オレンジ/金色）のスポット
-- 更新可能 = 近接する記録の中で最も高い難易度より低い難易度の記録
-- 同じ場所（50m以内）に複数の記録を作成し、一方が低難易度、もう一方が高難易度にする

-- 場所A: 渋谷駅前（複数の記録を同じ場所に配置）
-- 低難易度の記録（更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-1', '渋谷駅前広場', 'Ollie', 35.6585, 139.7010, '東京都', 'approved', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 同じ場所に高難易度の記録（これにより上記の記録が更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-1-high', '渋谷駅前広場', '720 Flip', 35.6585, 139.7014, '東京都', 'approved', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 場所B: 新宿駅東口（複数の記録を同じ場所に配置）
-- 低難易度の記録（更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-2', '新宿駅東口', 'Kickflip', 35.6913, 139.7008, '東京都', 'approved', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 同じ場所に高難易度の記録（これにより上記の記録が更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-2-high', '新宿駅東口', 'Triple Flip', 35.6917, 139.7008, '東京都', 'approved', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 場所C: 渋谷宮益坂（複数の記録を同じ場所に配置）
-- 中級技の記録（更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-3', '渋谷宮益坂', '360 Flip', 35.6574, 139.7017, '東京都', 'approved', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 同じ場所に高難易度の記録（これにより上記の記録が更新可能になる）
INSERT INTO spots (id, spot_name, trick, lat, lng, prefecture, status, created_at)
VALUES 
  ('dummy-updatable-3-high', '渋谷宮益坂', 'Gazelle Flip', 35.6577, 139.7020, '東京都', 'approved', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
  spot_name = EXCLUDED.spot_name,
  trick = EXCLUDED.trick,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  prefecture = EXCLUDED.prefecture,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- 更新可能スポット用のメディアデータ
INSERT INTO spot_media (spot_id, type, source, url, thumb_url, created_at)
VALUES 
  ('dummy-updatable-1', 'video', 'Instagram', 'https://instagram.com/p/dummy-updatable1', NULL, NOW()),
  ('dummy-updatable-1-high', 'video', 'Instagram', 'https://thrasher.com/dummy-updatable1-high', NULL, NOW()),
  ('dummy-updatable-2', 'video', 'YouTube', 'https://youtube.com/watch?v=dummy-updatable2', NULL, NOW()),
  ('dummy-updatable-2-high', 'video', 'YouTube', 'https://kawa.com/dummy-updatable2-high', NULL, NOW()),
  ('dummy-updatable-3', 'cover', 'Other', 'https://transworld.com/dummy-updatable3', NULL, NOW()),
  ('dummy-updatable-3-high', 'video', 'Instagram', 'https://thrasher.com/dummy-updatable3-high', NULL, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 確認用クエリ
-- ============================================

-- すべてのダミーデータを確認
SELECT 
  s.id,
  s.spot_name,
  s.trick,
  s.status,
  s.lat,
  s.lng,
  COUNT(sm.id) as media_count
FROM spots s
LEFT JOIN spot_media sm ON s.id = sm.spot_id
WHERE s.id LIKE 'test-%' 
   OR s.id LIKE 'hotspot-%' 
   OR s.id LIKE 'update-demo-%' 
   OR s.id LIKE 'dummy-%'
GROUP BY s.id, s.spot_name, s.trick, s.status, s.lat, s.lng
ORDER BY s.status, s.trick;
