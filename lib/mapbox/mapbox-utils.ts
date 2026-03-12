import mapboxgl from "mapbox-gl"
import { MAPBOX_CONFIG, EXTERNAL_URLS, TIMING_CONFIG } from "@/lib/constants"
import type { MapboxError } from "@/types/database"

// MAPBOX_CONFIGを関数内で使用するために、定数をインポート
const SPOT_DETAIL_ZOOM = MAPBOX_CONFIG.SPOT_DETAIL_ZOOM

/**
 * Mapboxのworker設定を初期化
 */
export function initializeMapboxWorker() {
  try {
    // @ts-ignore - workerClass exists but isn't in types
    mapboxgl.workerClass = null
  } catch (e) {
    console.warn("Failed to set worker class:", e)
  }
}

/**
 * Mapboxトークンを設定
 */
export function setMapboxToken(token: string) {
  mapboxgl.accessToken = token
}

/**
 * 中心マーカーを作成（LocationPicker用）
 */
export function createCenterMarker(
  lng: number,
  lat: number,
  map: mapboxgl.Map
): mapboxgl.Marker {
  // 既存のマーカーを削除（必要に応じて）
  const el = document.createElement("div")
  el.className = "custom-marker-center"
  el.style.width = "32px"
  el.style.height = "32px"
  el.style.borderRadius = "50%"
  el.style.border = "3px solid white"
  el.style.backgroundColor = "#E53935"
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
  el.style.pointerEvents = "none"
  el.style.display = "flex"
  el.style.alignItems = "center"
  el.style.justifyContent = "center"
  el.style.zIndex = "1000"

  const icon = document.createElement("div")
  icon.innerHTML = "📍"
  icon.style.fontSize = "20px"
  el.appendChild(icon)

  return new mapboxgl.Marker({
    element: el,
    draggable: false,
    anchor: "center",
  })
    .setLngLat([lng, lat])
    .addTo(map)
}

/**
 * Google Street View Static APIのURLを生成
 */
function getStreetViewImageUrl(lat: number, lng: number, size: string = "300x200"): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn("Google Places API key is not set")
    return ""
  }
  
  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&key=${apiKey}&heading=0&pitch=0&fov=90`
}

/**
 * Street View画像を表示するポップアップを作成
 */
function createStreetViewPopup(
  lat: number,
  lng: number,
  map: mapboxgl.Map,
  marker: mapboxgl.Marker
): HTMLElement | null {
  const popup = document.createElement("div")
  popup.className = "street-view-popup"
  popup.style.position = "absolute"
  popup.style.width = "300px"
  popup.style.height = "200px"
  popup.style.borderRadius = "8px"
  popup.style.overflow = "hidden"
  popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"
  popup.style.zIndex = "10000"
  popup.style.pointerEvents = "none"
  popup.style.opacity = "0"
  popup.style.transition = "opacity 0.3s ease"
  popup.style.backgroundColor = "#fff"

  const img = document.createElement("img")
  img.src = getStreetViewImageUrl(lat, lng)
  img.style.width = "100%"
  img.style.height = "100%"
  img.style.objectFit = "cover"
  img.alt = "Street View"
  
  // 画像読み込みエラー時の処理
  img.onerror = () => {
    popup.style.display = "none"
  }

  popup.appendChild(img)
  document.body.appendChild(popup)

  // ポップアップの位置を更新する関数
  const updatePopupPosition = () => {
    if (!map || !marker) return

    const markerElement = marker.getElement()
    if (!markerElement) return

    const rect = markerElement.getBoundingClientRect()
    const mapRect = map.getContainer().getBoundingClientRect()
    
    // マーカーの位置を基準にポップアップを配置（マーカーの上に表示）
    const popupX = rect.left + rect.width / 2 - 150 // ポップアップの幅の半分を引いて中央揃え
    const popupY = rect.top - 220 // マーカーの上に表示（マーカー高さ + マージン）

    popup.style.left = `${popupX}px`
    popup.style.top = `${popupY}px`
  }

  // 初期位置を設定
  updatePopupPosition()

  // マップの移動やズーム時にポップアップの位置を更新
  map.on("move", updatePopupPosition)
  map.on("zoom", updatePopupPosition)
  map.on("rotate", updatePopupPosition)

  // ポップアップにクリーンアップ関数を追加
  ;(popup as any)._cleanup = () => {
    map.off("move", updatePopupPosition)
    map.off("zoom", updatePopupPosition)
    map.off("rotate", updatePopupPosition)
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup)
    }
  }

  return popup
}

/**
 * スポットマーカーを作成（MapView用）
 */
export function createSpotMarker(
  spot: { lng: number; lat: number; media: Array<{ source: string }> },
  map: mapboxgl.Map,
  onClick: () => void,
  getSourceColor: (source: string) => string
): mapboxgl.Marker {
  const el = document.createElement("div")
  el.className = "cursor-pointer"

  // 基本スタイル
  el.style.width = "24px"
  el.style.height = "24px"
  el.style.borderRadius = "50%"
  el.style.border = "2px solid white"
  el.style.backgroundColor = getSourceColor(spot.media[0]?.source || "Other")
  el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
  el.style.pointerEvents = "auto"
  el.style.cursor = "pointer"
  // 位置精度を向上させるため、positionとtransformを調整
  el.style.position = "absolute"
  el.style.transform = "translate(-50%, -50%)"
  el.style.left = "0"
  el.style.top = "0"
  el.style.zIndex = "1000"
  el.style.display = "flex"
  el.style.alignItems = "center"
  el.style.justifyContent = "center"
  el.style.transition = "width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease, margin 0.2s ease"

  // Street Viewポップアップ用の変数
  let streetViewPopup: HTMLElement | null = null
  let popupTimeout: NodeJS.Timeout | null = null

  // クリックイベント
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick()
  }

  el.addEventListener("click", handleClick)

  // タッチイベント（モバイル対応）
  const handleTouchEnd = (e: TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick()
  }

  el.addEventListener("touchend", handleTouchEnd)

  const marker = new mapboxgl.Marker({
    element: el,
    anchor: "center",
    offset: [0, 0], // オフセットを明示的に0に設定して位置精度を向上
  })
    .setLngLat([spot.lng, spot.lat])
    .addTo(map)

  // ホバー時のスタイルとポップアップ表示（marker作成後に定義）
  const handleMouseEnter = () => {
    el.style.width = "28px"
    el.style.height = "28px"
    el.style.marginLeft = "-2px"
    el.style.marginTop = "-2px"
    el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)"
    el.style.zIndex = "1001"

    // ポップアップを表示（少し遅延させてスムーズに）
    if (popupTimeout) {
      clearTimeout(popupTimeout)
    }
    popupTimeout = setTimeout(() => {
      if (!streetViewPopup) {
        streetViewPopup = createStreetViewPopup(spot.lat, spot.lng, map, marker)
      }
      if (streetViewPopup) {
        streetViewPopup.style.opacity = "1"
      }
    }, TIMING_CONFIG.POPUP_DELAY)
  }

  const handleMouseLeave = () => {
    el.style.width = "24px"
    el.style.height = "24px"
    el.style.marginLeft = "0"
    el.style.marginTop = "0"
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
    el.style.zIndex = "1000"

    // ポップアップを非表示
    if (popupTimeout) {
      clearTimeout(popupTimeout)
      popupTimeout = null
    }
    if (streetViewPopup) {
      streetViewPopup.style.opacity = "0"
      // アニメーション後に削除
      setTimeout(() => {
        if (streetViewPopup && streetViewPopup.style.opacity === "0") {
          if ((streetViewPopup as any)._cleanup) {
            ;(streetViewPopup as any)._cleanup()
          }
          streetViewPopup = null
        }
      }, TIMING_CONFIG.POPUP_DELAY)
    }
  }

  el.addEventListener("mouseenter", handleMouseEnter)
  el.addEventListener("mouseleave", handleMouseLeave)

  // マップの移動やズーム時にマーカーの位置を再計算して精度を保つ
  const updateMarkerPosition = () => {
    if (!map || !marker) return
    
    // マーカーの座標を再設定して位置を正確に保つ
    const currentLngLat = marker.getLngLat()
    // 微小な誤差を許容しつつ、大きなずれがある場合は再設定
    const lngDiff = Math.abs(currentLngLat.lng - spot.lng)
    const latDiff = Math.abs(currentLngLat.lat - spot.lat)
    
    // 0.0001度（約11m）以上のずれがある場合のみ再設定
    if (lngDiff > 0.0001 || latDiff > 0.0001) {
      marker.setLngLat([spot.lng, spot.lat])
    }
  }

  // マップのイベントリスナーを追加（ただし、パフォーマンスを考慮してthrottle）
  let updateTimeout: NodeJS.Timeout | null = null
  const throttledUpdate = () => {
    if (updateTimeout) return
    updateTimeout = setTimeout(() => {
      updateMarkerPosition()
      updateTimeout = null
    }, TIMING_CONFIG.MARKER_UPDATE_THROTTLE)
  }

  // イベントリスナーを追加
  map.on("move", throttledUpdate)
  map.on("zoom", throttledUpdate)
  map.on("rotate", throttledUpdate)

  // マーカーにクリーンアップ関数を追加（削除時にイベントリスナーも削除）
  ;(marker as any)._cleanup = () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout)
      updateTimeout = null
    }
    if (popupTimeout) {
      clearTimeout(popupTimeout)
      popupTimeout = null
    }
    if (streetViewPopup) {
      if ((streetViewPopup as any)._cleanup) {
        ;(streetViewPopup as any)._cleanup()
      }
      streetViewPopup = null
    }
    map.off("move", throttledUpdate)
    map.off("zoom", throttledUpdate)
    map.off("rotate", throttledUpdate)
  }

  // デバッグ: マーカーの座標を確認
  const markerLngLat = marker.getLngLat()
  if (Math.abs(markerLngLat.lng - spot.lng) > 0.0001 || Math.abs(markerLngLat.lat - spot.lat) > 0.0001) {
    console.warn(`[createSpotMarker] 座標の不一致を検出:`, {
      spotId: (spot as any).id,
      spotName: (spot as any).spotName,
      expected: { lng: spot.lng, lat: spot.lat },
      actual: { lng: markerLngLat.lng, lat: markerLngLat.lat },
      diff: {
        lng: Math.abs(markerLngLat.lng - spot.lng),
        lat: Math.abs(markerLngLat.lat - spot.lat),
      },
    })
  }

  return marker
}

/**
 * ホットスポットのパルスアニメーションマーカーを作成
 */
export function createHotSpotMarker(
  hotSpot: { center: { lat: number; lng: number }; count: number; intensity: "low" | "medium" | "high" },
  map: mapboxgl.Map
): mapboxgl.Marker {
  const el = document.createElement("div")
  el.className = "hotspot-pulse-marker"
  
  // 強度に応じた色とサイズを設定
  const intensityConfig = {
    low: {
      color: "#3b82f6", // 青
      size: 40,
      pulseSize: 60,
    },
    medium: {
      color: "#10b981", // 緑
      size: 50,
      pulseSize: 75,
    },
    high: {
      color: "#ef4444", // 赤
      size: 60,
      pulseSize: 90,
    },
  }
  
  const config = intensityConfig[hotSpot.intensity]
  
  // マーカー要素のコンテナ（アンカーポイントの基準となる最小サイズ）
  // パルスアニメーションが外側に広がっても中心がずれないように、0pxサイズのコンテナを作成
  el.style.width = "0px"
  el.style.height = "0px"
  el.style.position = "relative"
  el.style.pointerEvents = "none"
  el.style.zIndex = "999" // 更新可能なスポットより後ろに表示（背景として）
  el.style.overflow = "visible"
  
  // 中央の円（アンカーポイントの基準）
  const centerCircle = document.createElement("div")
  centerCircle.style.width = `${config.size}px`
  centerCircle.style.height = `${config.size}px`
  centerCircle.style.borderRadius = "50%"
  centerCircle.style.border = `3px solid ${config.color}`
  centerCircle.style.backgroundColor = `${config.color}20` // 20% opacity
  centerCircle.style.position = "absolute"
  centerCircle.style.top = "50%"
  centerCircle.style.left = "50%"
  centerCircle.style.transform = "translate(-50%, -50%)"
  centerCircle.style.zIndex = "1000"
  
  // パルスエフェクト用の要素（複数のパルスを重ねて視覚効果を強化）
  const pulse1 = document.createElement("div")
  pulse1.className = "hotspot-pulse-1"
  pulse1.style.position = "absolute"
  pulse1.style.width = `${config.size}px`
  pulse1.style.height = `${config.size}px`
  pulse1.style.borderRadius = "50%"
  pulse1.style.border = `3px solid ${config.color}`
  pulse1.style.backgroundColor = "transparent"
  pulse1.style.top = "50%"
  pulse1.style.left = "50%"
  pulse1.style.transform = "translate(-50%, -50%)"
  pulse1.style.zIndex = "999"
  // animation shorthandは順序の解釈差が出ることがあるため、delay→iterationの順で明示
  pulse1.style.animation = "hotspot-pulse-1 2s ease-out 0s infinite"
  
  const pulse2 = document.createElement("div")
  pulse2.className = "hotspot-pulse-2"
  pulse2.style.position = "absolute"
  pulse2.style.width = `${config.size}px`
  pulse2.style.height = `${config.size}px`
  pulse2.style.borderRadius = "50%"
  pulse2.style.border = `3px solid ${config.color}`
  pulse2.style.backgroundColor = "transparent"
  pulse2.style.top = "50%"
  pulse2.style.left = "50%"
  pulse2.style.transform = "translate(-50%, -50%)"
  pulse2.style.zIndex = "998"
  pulse2.style.animation = "hotspot-pulse-2 2s ease-out 0.5s infinite"
  
  // 記録数を表示する要素（背景付きで可読性を向上）
  const countBadge = document.createElement("div")
  countBadge.className = "hotspot-count-badge"
  countBadge.textContent = hotSpot.count.toString()
  countBadge.style.position = "absolute"
  countBadge.style.top = "50%"
  countBadge.style.left = "50%"
  countBadge.style.transform = "translate(-50%, -50%)"
  countBadge.style.color = "#ffffff" // 白でクラスタの青とコントラストを確保
  countBadge.style.fontWeight = "bold"
  countBadge.style.fontSize = "16px"
  countBadge.style.textShadow = "0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5)" // より強いシャドウ
  countBadge.style.zIndex = "1001"
  countBadge.style.display = "flex"
  countBadge.style.alignItems = "center"
  countBadge.style.justifyContent = "center"
  countBadge.style.width = "28px"
  countBadge.style.height = "28px"
  countBadge.style.borderRadius = "50%"
  countBadge.style.backgroundColor = "rgba(0, 0, 0, 0.6)" // 半透明の黒背景で可読性を向上
  countBadge.style.backdropFilter = "blur(4px)" // ぼかし効果でさらに見やすく
  
  // 要素を追加（中央の円を最後に追加して、z-indexの順序を維持）
  el.appendChild(pulse1)
  el.appendChild(pulse2)
  el.appendChild(centerCircle)
  el.appendChild(countBadge)
  
  // CSSアニメーションを追加（まだ追加されていない場合）
  if (!document.getElementById("hotspot-pulse-style")) {
    const style = document.createElement("style")
    style.id = "hotspot-pulse-style"
    style.textContent = `
      @keyframes hotspot-pulse-1 {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.8;
          border-width: 3px;
        }
        50% {
          opacity: 0.3;
        }
        100% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
          border-width: 1px;
        }
      }
      @keyframes hotspot-pulse-2 {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.6;
          border-width: 3px;
        }
        50% {
          opacity: 0.2;
        }
        100% {
          transform: translate(-50%, -50%) scale(3.5);
          opacity: 0;
          border-width: 1px;
        }
      }
      .hotspot-pulse-marker {
        will-change: transform;
        overflow: visible !important;
      }
      .hotspot-pulse-1,
      .hotspot-pulse-2 {
        will-change: transform, opacity;
      }
    `
    document.head.appendChild(style)
  }
  
  // マーカー要素にアニメーションクラスを追加
  el.classList.add("hotspot-pulse-marker")
  
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: "center", // 1px x 1px の要素の中心がアンカーポイント（中央の円の中心と一致）
  })
    .setLngLat([hotSpot.center.lng, hotSpot.center.lat])
    .addTo(map)
  
  return marker
}

/**
 * クラスタ範囲表示用のパルスアニメーションマーカーを作成
 * 更新可能性とホットスポットの状態に応じて、色と波紋の強弱を変更
 * @param clusterSpots クラスタ内の全スポット（サイズ計算用）
 * @param map Mapboxのマップインスタンス
 * @param isUpdatable 更新可能性の有無
 * @param isHotSpot ホットスポットの有無
 * @param clusterCenter クラスタのピンの位置（パルスの中心位置）
 * @returns マーカーインスタンス
 */
export function createClusterRangePulseMarker(
  clusterSpots: Array<{ lat: number; lng: number }>,
  map: mapboxgl.Map,
  isUpdatable: boolean,
  isHotSpot: boolean,
  clusterCenter: { lat: number; lng: number },
  fixedRadiusMeters?: number // 固定の半径（メートル単位）- ズームレベル5でクリックした時の範囲を引き継ぐ場合に使用
): mapboxgl.Marker {
  if (clusterSpots.length === 0) {
    throw new Error("clusterSpots must not be empty")
  }

  if (!isHotSpot) {
    throw new Error("Pulse is only displayed for hotspots")
  }

  // クラスタ範囲を計算（初期値として使用）
  const { calculateClusterRange } = require("@/lib/mapbox/cluster-range-utils")
  const { calculateDistanceInMeters } = require("@/lib/spot/spot-utils")
  
  // Spot型に変換（lat, lngのみ必要）
  // calculateClusterRangeはSpot型を要求するが、実際にはlat, lngのみ使用される
  const spotsForRange = clusterSpots.map((s) => ({
    id: `temp-${s.lat}-${s.lng}`,
    spotName: "",
    lat: s.lat,
    lng: s.lng,
    status: "approved" as const,
    createdAt: new Date().toISOString(),
    media: [],
  })) as any[] // 型チェックを回避（実際にはlat, lngのみ使用）
  
  // 固定の半径が指定されている場合はそれを使用、そうでなければ計算
  let initialRadiusMeters: number
  if (fixedRadiusMeters !== undefined) {
    initialRadiusMeters = fixedRadiusMeters
  } else {
    const range = calculateClusterRange(spotsForRange)
    initialRadiusMeters = range.radiusMeters
  }

  // クラスタのピン位置を基準にサイズを計算する関数（ズームレベル18以上で使用）
  const calculateRadiusFromClusterCenter = (
    center: { lat: number; lng: number },
    spots: Array<{ lat: number; lng: number }>
  ): number => {
    // クラスタのピン位置から最も遠いスポットまでの距離を計算
    const maxDistance = Math.max(
      ...spots.map((s) => 
        calculateDistanceInMeters(center.lat, center.lng, s.lat, s.lng)
      )
    )
    
    // スポット間の最大距離も考慮
    const spotDistances: number[] = []
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const distance = calculateDistanceInMeters(
          spots[i].lat,
          spots[i].lng,
          spots[j].lat,
          spots[j].lng
        )
        spotDistances.push(distance)
      }
    }
    const maxSpotDistance = spotDistances.length > 0 ? Math.max(...spotDistances) : 0
    
    // より大きい方を使用し、50%の余裕を持たせる
    const baseRadius = Math.max(maxDistance, maxSpotDistance / 2)
    const radiusMeters = Math.max(10, baseRadius * 1.5) // 最小10m、50%の余裕
    
    return radiusMeters
  }

  const color = "#3b82f6" // ホットスポット: 青
  const intensity: "medium" = "medium"
  const zIndex = 1000

  // ズームレベルに応じた半径を計算（メートル → ピクセル）
  const getRadiusInPixels = (zoom: number, radiusMeters: number): number => {
    const metersPerDegree = 111000
    const pixelsPerDegree = 256 * Math.pow(2, zoom)
    return (radiusMeters / metersPerDegree) * pixelsPerDegree
  }

  const el = document.createElement("div")
  el.className = "cluster-range-pulse-marker"
  el.style.width = "0px"
  el.style.height = "0px"
  el.style.position = "relative"
  el.style.pointerEvents = "none"
  el.style.zIndex = zIndex.toString()
  el.style.overflow = "visible"

  // アニメーション設定
  const animationConfig = {
    strong: {
      duration: 1.5, // 速い
      delays: [0, 0.3, 0.6], // 短い間隔
      scaleStart: 0.8,
      scaleEnd: 2.0, // 大きい波紋
      opacityStart: 0.9, // 濃い
      opacityMid: 0.3,
      opacityEnd: 0,
      borderWidthStart: 4, // 太め
      borderWidthEnd: 1,
      sizeMultiplier: 1.2, // 大きい
    },
    medium: {
      duration: 2.0, // 標準
      delays: [0, 0.5, 1.0], // 標準間隔
      scaleStart: 0.8,
      scaleEnd: 1.5, // 標準
      opacityStart: 0.8, // 標準
      opacityMid: 0.4,
      opacityEnd: 0,
      borderWidthStart: 3, // 標準
      borderWidthEnd: 1,
      sizeMultiplier: 1.0, // 標準
    },
  }

  const config = animationConfig[intensity]

  // アニメーション用の円形要素
  const createPulseCircle = (delay: number) => {
    const circle = document.createElement("div")
    circle.className = `cluster-range-pulse-circle-${intensity}`
    circle.style.position = "absolute"
    circle.style.top = "50%"
    circle.style.left = "50%"
    circle.style.transform = "translate(-50%, -50%)"
    circle.style.borderRadius = "50%"
    circle.style.border = `${config.borderWidthStart}px solid ${color}`
    circle.style.backgroundColor = "transparent"
    circle.style.animation = `cluster-range-pulse-${intensity} ${config.duration}s ease-out ${delay}s infinite`
    circle.style.willChange = "transform, opacity"
    return circle
  }

  // 更新関数：ズームレベルに応じてサイズを調整
  const updateSize = () => {
    const zoom = map.getZoom()
    let radiusMetersToUse = initialRadiusMeters
    
    // 固定の半径が指定されている場合は、それを常に使用（ズームレベル5でクリックした時の範囲を引き継ぐ）
    // 固定の半径が指定されていない場合のみ、ズームレベル18以上では再計算
    if (fixedRadiusMeters === undefined && zoom >= SPOT_DETAIL_ZOOM) {
      radiusMetersToUse = calculateRadiusFromClusterCenter(clusterCenter, clusterSpots)
    }
    
    const radiusPixels = getRadiusInPixels(zoom, radiusMetersToUse)
    
    // ズームレベル18以上（個別スポット表示時）では、クラスタ内のスポット範囲を正確に表示
    // ズームレベル14以下（クラスタ表示時）では、最小サイズを設定して視認性を確保
    const isSpotDetailZoom = zoom >= SPOT_DETAIL_ZOOM
    const minSize = isSpotDetailZoom ? 0 : 40 // ズームレベル18以上では最小サイズ制限なし
    
    // サイズ倍率を適用
    const baseSize = radiusPixels * 2 * config.sizeMultiplier
    // 最大サイズを設定（低ズームレベルでのパルスサイズが大きすぎるのを防ぐ）
    // ズームレベル10以下では最大300px、10-14では最大500px、14以上では最大1000px
    let maxSize: number
    if (zoom <= 10) {
      maxSize = 300
    } else if (zoom <= 14) {
      maxSize = 500
    } else {
      maxSize = 1000
    }
    const size = Math.max(minSize, Math.min(maxSize, baseSize))

    // すべてのパルス円のサイズを更新
    const circles = el.querySelectorAll(`.cluster-range-pulse-circle-${intensity}`)
    circles.forEach((circle) => {
      ;(circle as HTMLElement).style.width = `${size}px`
      ;(circle as HTMLElement).style.height = `${size}px`
    })
  }

  // パルス円を追加
  config.delays.forEach((delay) => {
    const pulse = createPulseCircle(delay)
    el.appendChild(pulse)
  })

  // 初期サイズを設定
  updateSize()

  // ズーム変更時にサイズを更新
  map.on("zoom", updateSize)
  map.on("moveend", updateSize)

  // CSSアニメーションを追加（まだ追加されていない場合）
  const styleId = `cluster-range-pulse-${intensity}-style`
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      @keyframes cluster-range-pulse-${intensity} {
        0% {
          transform: translate(-50%, -50%) scale(${config.scaleStart});
          opacity: ${config.opacityStart};
          border-width: ${config.borderWidthStart}px;
        }
        50% {
          opacity: ${config.opacityMid};
        }
        100% {
          transform: translate(-50%, -50%) scale(${config.scaleEnd});
          opacity: ${config.opacityEnd};
          border-width: ${config.borderWidthEnd}px;
        }
      }
      .cluster-range-pulse-marker {
        will-change: transform;
        overflow: visible !important;
      }
      .cluster-range-pulse-circle-${intensity} {
        will-change: transform, opacity;
      }
    `
    document.head.appendChild(style)
  }

  // クラスタのピン位置を中心にマーカーを配置（実装計画に従う）
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: "center",
  })
    .setLngLat([clusterCenter.lng, clusterCenter.lat])
    .addTo(map)

  // マーカー削除時にイベントリスナーも削除
  const originalRemove = marker.remove.bind(marker)
  marker.remove = () => {
    map.off("zoom", updateSize)
    map.off("moveend", updateSize)
    originalRemove()
  }

  return marker
}

/**
 * Mapboxエラーメッセージをユーザーフレンドリーに変換
 */
export function formatMapboxError(error: MapboxError, token?: string): string {
  const errorMessage = error.error?.message || error.message || "Unknown Mapbox error"
  const errorType = error.error?.type || error.type || "unknown"
  const errorStatus = error.error?.status || error.status || "unknown"
  const errorUrl = error.error?.url || error.url || ""

  // エラーの詳細をログに出力
  console.error("Mapbox error details:", {
    message: errorMessage,
    type: errorType,
    status: errorStatus,
    url: errorUrl,
    tile: error.tile,
    fullError: error,
    errorObject: error.error,
  })

  // 403エラーの場合、より詳細な情報を表示
  if (errorStatus === 403 && token) {
    console.error("403 Forbidden Error Details:", {
      url: errorUrl,
      tokenPrefix: token.substring(0, 10) + "...",
      tokenLength: token.length,
      isPublicToken: token.startsWith("pk."),
      isSecretToken: token.startsWith("sk."),
      currentUrl: typeof window !== "undefined" ? window.location.href : "N/A",
    })
  }

  // エラーメッセージをユーザーフレンドリーに変換
  let userFriendlyMessage = errorMessage

  if (errorStatus === 401 || errorMessage.includes("Unauthorized") || errorMessage.includes("Invalid token")) {
    userFriendlyMessage = "Mapboxトークンが無効です。トークンを確認してください。"
  } else if (errorStatus === 403) {
    if (errorUrl.includes("mapbox-streets-v8") || errorUrl.includes("tiles")) {
      userFriendlyMessage = "Mapboxトークンの権限が不足しています。トークンに「Styles:Read」スコープが必要です。"
    } else {
      userFriendlyMessage = "Mapboxトークンの権限が不足しています。Mapboxダッシュボードでトークンのスコープを確認してください。"
    }
  } else if (errorMessage.includes("style")) {
    userFriendlyMessage = "地図スタイルの読み込みに失敗しました。"
  } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    userFriendlyMessage = "ネットワークエラーが発生しました。接続を確認してください。"
  }

  return `${userFriendlyMessage} (${errorType})`
}

/**
 * 仮ピン（一時的なピン）を作成（記録投稿用）
 */
export function createTempPin(
  lng: number,
  lat: number,
  map: mapboxgl.Map,
  onClick: () => void
): mapboxgl.Marker {
  if (!map) {
    throw new Error("Map instance is required to create temp pin")
  }

  console.log('[createTempPin] Creating temp pin at:', lat, lng)

  const el = document.createElement("div")
  el.className = "cursor-pointer temp-pin"

  // 基本スタイル（グレー、点線、アニメーション）
  el.style.width = "32px"
  el.style.height = "32px"
  el.style.borderRadius = "50%"
  el.style.border = "3px dashed #9CA3AF"
  el.style.backgroundColor = "rgba(156, 163, 175, 0.3)"
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
  el.style.pointerEvents = "auto"
  el.style.cursor = "pointer"
  el.style.position = "absolute"
  el.style.transform = "translate(-50%, -50%)"
  el.style.left = "0"
  el.style.top = "0"
  el.style.zIndex = "2000" // 既存のピンより上に表示
  el.style.display = "flex"
  el.style.alignItems = "center"
  el.style.justifyContent = "center"
  
  // パルスアニメーション
  el.style.animation = "pulse 1s ease-in-out infinite"
  
  // プラス記号を追加
  const plusIcon = document.createElement("div")
  plusIcon.textContent = "+"
  plusIcon.style.color = "#9CA3AF"
  plusIcon.style.fontSize = "20px"
  plusIcon.style.fontWeight = "bold"
  plusIcon.style.lineHeight = "1"
  el.appendChild(plusIcon)

  // クリックイベント
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick()
  }

  el.addEventListener("click", handleClick)

  // タッチイベント（モバイル対応）
  const handleTouchEnd = (e: TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick()
  }

  el.addEventListener("touchend", handleTouchEnd)

  try {
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "center",
      offset: [0, 0],
    })
      .setLngLat([lng, lat])
      .addTo(map)

    console.log('[createTempPin] Temp pin created successfully')
    return marker
  } catch (error) {
    console.error('[createTempPin] Error creating marker:', error)
    throw error
  }
}

/**
 * Mapboxマップの基本設定を取得
 */
export function getMapboxMapOptions(
  container: HTMLElement,
  center?: [number, number],
  zoom?: number
): mapboxgl.MapboxOptions {
  return {
    container,
    style: MAPBOX_CONFIG.STYLE,
    center: center || MAPBOX_CONFIG.DEFAULT_CENTER,
    zoom: zoom || MAPBOX_CONFIG.DEFAULT_ZOOM,
    antialias: true,
  }
}

