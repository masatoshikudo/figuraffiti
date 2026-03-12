/**
 * スポット関連のユーティリティ関数
 */

import type { Spot, FilterOptions } from "@/types/spot"
import { SOURCE_COLORS, SPOT_MERGE_CONFIG } from "@/lib/constants"

/**
 * ソースに応じた色を取得
 */
export function getSourceColor(source: string): string {
  return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || SOURCE_COLORS.default
}

/**
 * 2点間の距離を計算（簡易版：緯度経度の差の合計）
 * より正確な計算が必要な場合は、Haversine公式を使用
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const latDiff = Math.abs(lat1 - lat2)
  const lngDiff = Math.abs(lng1 - lng2)
  // 簡易的な距離計算（度単位）
  // 実際の距離は緯度によって変わるが、閾値が小さいため簡易計算で十分
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
}

/**
 * Haversine公式を使用して2点間の距離をメートル単位で計算
 * @param lat1 地点1の緯度
 * @param lng1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lng2 地点2の経度
 * @returns 距離（メートル）
 */
export function calculateDistanceInMeters(
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
 * 指定された位置に近い記録をすべて取得
 */
export function getNearbySpots(
  spots: Spot[],
  lat: number,
  lng: number,
  threshold: number = SPOT_MERGE_CONFIG.DISTANCE_THRESHOLD
): Spot[] {
  return spots.filter((spot) => {
    const distance = calculateDistance(lat, lng, spot.lat, spot.lng)
    return distance <= threshold
  })
}

/**
 * スポットを検索クエリでフィルタリング
 */
export function searchSpots(spots: Spot[], query: string): Spot[] {
  if (!query.trim()) {
    return spots
  }

  const lowerQuery = query.toLowerCase().trim()

  return spots.filter((spot) => {
    // スポット名で検索
    if (spot.spotName?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 文脈で検索
    if (spot.context?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // 都道府県で検索
    if (spot.prefecture?.toLowerCase().includes(lowerQuery)) {
      return true
    }

    return false
  })
}

/**
 * 年代の配列を取得
 */
export function getDecades(_spots: Spot[]): string[] {
  // AhhHum: year カラム廃止のため空配列を返す
  return []
  return Array.from(decades).sort((a, b) => parseInt(b) - parseInt(a))
}

/**
 * ユニークなソースの配列を取得
 */
export function getUniqueSources(spots: Spot[]): string[] {
  const sources = new Set<string>()
  spots.forEach((spot) => {
    spot.media?.forEach((media) => {
      if (media.source) {
        sources.add(media.source)
      }
    })
  })
  return Array.from(sources).sort()
}

/**
 * フィルタリングされたスポットを取得
 */
export function getFilteredSpots(spots: Spot[], filters: FilterOptions): Spot[] {
  return spots.filter((spot) => {
    // ソースフィルタ
    if (filters.sources.length > 0) {
      const spotSources = spot.media?.map((m) => m.source).filter(Boolean) || []
      if (!filters.sources.some((source) => spotSources.includes(source as Spot["media"][0]["source"]))) {
        return false
      }
    }

    // 都道府県フィルタ
    if (filters.prefectures.length > 0) {
      if (!spot.prefecture || !filters.prefectures.includes(spot.prefecture)) {
        return false
      }
    }


    return true
  })
}

/** getFilteredSpots のエイリアス */
export const filterSpots = getFilteredSpots

/**
 * 指定キーのユニークな値を取得（都道府県など）
 */
export function getUniqueValues(spots: Spot[], key: "prefecture"): string[] {
  const set = new Set<string>()
  spots.forEach((spot) => {
    const v = spot[key]
    if (v && typeof v === "string") set.add(v)
  })
  return Array.from(set).sort()
}

/**
 * ユニークなタグの配列を取得
 */
export function getUniqueTags(_spots: Spot[]): string[] {
  // AhhHum: tags カラム廃止のため空配列を返す
  return []
}

/**
 * ホットスポットの型定義
 */
export interface HotSpot {
  center: { lat: number; lng: number }
  count: number // クラスタ内の記録数
  radius: number // 半径（メートル）
  spots: Spot[] // クラスタ内のスポット
  intensity: "low" | "medium" | "high" // アニメーション強度
}

/**
 * ホットスポットを検出（クラスタリングベース）
 * 1週間以内に登録されたスポットを、半径25m以内でクラスタリングし、
 * 5件以上のクラスタをホットスポットとして返す
 * @param spots すべてのスポット
 * @param radiusMeters クラスタリングの半径（メートル、デフォルト: 25m）
 * @param minCount ホットスポットとして表示する最小記録数（デフォルト: 5）
 * @param daysAgo 何日前までの記録を対象にするか（デフォルト: 7日）
 * @returns 検出されたホットスポットの配列
 */
export function detectHotSpots(
  spots: Spot[],
  radiusMeters: number = 25,
  minCount: number = 5,
  daysAgo: number = 7
): HotSpot[] {
  const isDev = process.env.NODE_ENV === "development"
  if (isDev) console.log(`[detectHotSpots] total spots: ${spots.length}`)

  // 期間フィルタ（直近daysAgo日）
  const now = new Date()
  const since = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

  const recentSpots = spots.filter((spot) => {
    if (!spot.createdAt) return false
    const createdAt = new Date(spot.createdAt)
    const isRecent = createdAt >= since
    // approved または (後方互換) statusなし扱いのデータを対象にする
    const isValidStatus = spot.status === "approved" || spot.status === null || spot.status === undefined
    return isRecent && isValidStatus
  })

  if (isDev) console.log(`[detectHotSpots] recent spots: ${recentSpots.length} (minCount=${minCount}, radius=${radiusMeters}m)`)
  if (recentSpots.length < minCount) return []

  // 25m以内で“連結成分”としてクラスタリング（単一点中心の半径検索より安定）
  const visited = new Set<string>()
  const clusters: Spot[][] = []

  for (const seed of recentSpots) {
    if (visited.has(seed.id)) continue

    const queue: Spot[] = [seed]
    const cluster: Spot[] = []
    visited.add(seed.id)

    while (queue.length > 0) {
      const current = queue.shift()!
      cluster.push(current)

      for (const candidate of recentSpots) {
        if (visited.has(candidate.id)) continue
        const d = calculateDistanceInMeters(current.lat, current.lng, candidate.lat, candidate.lng)
        if (d <= radiusMeters) {
          visited.add(candidate.id)
          queue.push(candidate)
        }
      }
    }

    clusters.push(cluster)
  }

  const hotSpots: HotSpot[] = []

  for (const cluster of clusters) {
    if (cluster.length < minCount) continue

    // クラスタ中心（平均）を基準点にして、全点が半径内に収まるものだけを採用
    const centerLat = cluster.reduce((sum, s) => sum + s.lat, 0) / cluster.length
    const centerLng = cluster.reduce((sum, s) => sum + s.lng, 0) / cluster.length

    const maxDistance = Math.max(
      ...cluster.map((s) => calculateDistanceInMeters(centerLat, centerLng, s.lat, s.lng))
    )
    if (maxDistance > radiusMeters) {
      if (isDev) console.log(`[detectHotSpots] cluster rejected (maxDistance=${maxDistance.toFixed(1)}m > ${radiusMeters}m), count=${cluster.length}`)
      continue
    }

    let intensity: "low" | "medium" | "high"
    if (cluster.length >= 10) intensity = "high"
    else if (cluster.length >= 7) intensity = "medium"
    else intensity = "low"

    hotSpots.push({
      center: { lat: centerLat, lng: centerLng },
      count: cluster.length,
      radius: radiusMeters,
      spots: cluster,
      intensity,
    })
  }

  if (isDev) console.log(`[detectHotSpots] hot spots: ${hotSpots.length}`)
  return hotSpots
}

/**
 * クラスタ内の代表スポットを1件返す（先頭を使用）
 * @param cluster クラスタ内のスポット配列
 * @returns 代表スポット（クラスタが空の場合はnull）
 */
export function selectRepresentativeRecord(cluster: Spot[]): Spot | null {
  if (cluster.length === 0) return null
  return cluster[0]
}

/**
 * 指定された位置から一定距離以内の記録をクラスタとして取得
 * @param spots すべての記録
 * @param lat 基準となる緯度
 * @param lng 基準となる経度
 * @param radiusMeters クラスタの半径（メートル、デフォルト: 50m）
 * @returns クラスタ内の記録配列
 */
export function getClusterSpots(
  spots: Spot[],
  lat: number,
  lng: number,
  radiusMeters: number = 50
): Spot[] {
  return spots.filter((spot) => {
    // 承認済みの記録のみを対象
    const isValidStatus = spot.status === "approved" || spot.status === null || spot.status === undefined
    if (!isValidStatus) return false

    const distance = calculateDistanceInMeters(lat, lng, spot.lat, spot.lng)
    return distance <= radiusMeters
  })
}

