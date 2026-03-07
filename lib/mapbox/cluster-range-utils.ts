/**
 * クラスター範囲表示用のユーティリティ関数
 */

import type { Spot } from "@/types/spot"

/**
 * Haversine公式を使用して2点間の距離をメートル単位で計算
 * @param lat1 地点1の緯度
 * @param lng1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lng2 地点2の経度
 * @returns 距離（メートル）
 */
function calculateDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * クラスター内のスポットの範囲を計算
 * @param clusterSpots クラスター内のスポット配列
 * @returns 中心点と半径（メートル）
 */
export function calculateClusterRange(clusterSpots: Spot[]): {
  center: { lat: number; lng: number }
  radiusMeters: number
} {
  if (clusterSpots.length === 0) {
    throw new Error("clusterSpots must not be empty")
  }

  // 中心点を計算
  const centerLat = clusterSpots.reduce((sum, s) => sum + s.lat, 0) / clusterSpots.length
  const centerLng = clusterSpots.reduce((sum, s) => sum + s.lng, 0) / clusterSpots.length

  // 中心点から最も遠いスポットまでの距離を計算
  const maxDistance = Math.max(
    ...clusterSpots.map((s) => calculateDistanceInMeters(centerLat, centerLng, s.lat, s.lng))
  )

  // 最小半径を設定（クラスターが小さすぎる場合でも視認性を確保）
  const minRadius = 10 // 10メートル
  // すべてのスポットが確実に範囲内に含まれるように、より大きな余裕を持たせる（50%の余裕）
  // また、スポット間の最大距離も考慮する
  const spotDistances: number[] = []
  for (let i = 0; i < clusterSpots.length; i++) {
    for (let j = i + 1; j < clusterSpots.length; j++) {
      const distance = calculateDistanceInMeters(
        clusterSpots[i].lat,
        clusterSpots[i].lng,
        clusterSpots[j].lat,
        clusterSpots[j].lng
      )
      spotDistances.push(distance)
    }
  }
  const maxSpotDistance = spotDistances.length > 0 ? Math.max(...spotDistances) : 0
  
  // 中心点からの最大距離と、スポット間の最大距離の両方を考慮
  // より大きい方を使用し、50%の余裕を持たせる
  const baseRadius = Math.max(maxDistance, maxSpotDistance / 2)
  const radiusMeters = Math.max(minRadius, baseRadius * 1.5) // 50%の余裕を持たせる

  return {
    center: { lat: centerLat, lng: centerLng },
    radiusMeters,
  }
}

/**
 * 円形のGeoJSON Polygonを作成（Turf.jsスタイル）
 * @param center 中心点
 * @param radiusMeters 半径（メートル）
 * @param steps 円の精度（デフォルト: 64）
 * @returns GeoJSON Polygon
 */
export function createCirclePolygon(
  center: { lat: number; lng: number },
  radiusMeters: number,
  steps: number = 64
): GeoJSON.Polygon {
  // 地球の半径（メートル）
  const R = 6371000

  // 半径を度に変換（緯度方向）
  const latRadius = radiusMeters / R * (180 / Math.PI)
  // 経度方向の半径を計算（緯度によって異なる）
  const lngRadius = radiusMeters / (R * Math.cos(center.lat * Math.PI / 180)) * (180 / Math.PI)

  // 円の座標を生成
  const coordinates: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const lat = center.lat + latRadius * Math.sin(angle)
    const lng = center.lng + lngRadius * Math.cos(angle)
    coordinates.push([lng, lat])
  }

  return {
    type: "Polygon",
    coordinates: [coordinates],
  }
}

