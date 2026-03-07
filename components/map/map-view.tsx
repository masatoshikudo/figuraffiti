"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Spot } from "@/types/spot"
import { getSourceColor, detectHotSpots, type HotSpot, getClusterSpots, selectRepresentativeRecord, calculateDistanceInMeters } from "@/lib/spot/spot-utils"
import { calculateClusterRange, createCirclePolygon } from "@/lib/mapbox/cluster-range-utils"
import { Button } from "@/components/ui/button"
import { Locate } from "lucide-react"
import { MAPBOX_CONFIG, TIMING_CONFIG, HOTSPOT_CONFIG, SPOT_MARKER_STYLES, SPOT_STATUS } from "@/lib/constants"
import {
  initializeMapboxWorker,
  setMapboxToken,
  getMapboxMapOptions,
  formatMapboxError,
  createSpotMarker,
  createTempPin,
  createHotSpotMarker,
  createClusterRangePulseMarker,
} from "@/lib/mapbox/mapbox-utils"
import type { MapboxError } from "@/types/database"

interface MapViewProps {
  spots: Spot[]
  onSpotClick: (spot: Spot, clusterSpots?: Spot[]) => void
  selectedSpot?: Spot | null
  onMapClick?: (lat: number, lng: number) => void
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>
  preserveMapPosition?: boolean // 地図位置を保持するかどうか
  tempPinLocation?: { lat: number; lng: number } | null // 仮ピンの位置
}

export function MapView({ spots, onSpotClick, selectedSpot, onMapClick, mapRef, preserveMapPosition = false, tempPinLocation }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const hotSpotMarkersRef = useRef<mapboxgl.Marker[]>([])
  const clusterRangePulseMarkersRef = useRef<mapboxgl.Marker[]>([]) // クラスタ範囲表示用のパルスアニメーションマーカー（ホットスポットの状態に応じて表示）
  const hoverClusterRangePulseMarkersRef = useRef<mapboxgl.Marker[]>([]) // ホバー時のクラスタ範囲表示用のパルスアニメーションマーカー（一時表示）
  const clusterHighlightedSpotsRef = useRef<string[]>([]) // ハイライト表示中のスポットID
  const selectedClusterSpotsRef = useRef<Spot[] | null>(null) // 選択されたクラスタのスポット（クリックで固定表示）
  const selectedClusterCenterRef = useRef<{ lat: number; lng: number } | null>(null) // 選択されたクラスタのピンの位置
  const selectedClusterRadiusMetersRef = useRef<number | null>(null) // 選択されたクラスタの範囲（メートル単位）- ズームレベル5でクリックした時の範囲を引き継ぐ
  const currentPulseClusterIdRef = useRef<string | null>(null) // 現在表示中のパルスのクラスタID（重複防止用）
  const clusterRangeCircleRef = useRef<{ sourceId: string; layerId: string } | null>(null)
  const pendingHotSpotUpdateRef = useRef(false)
  const spotsDataRef = useRef<Spot[]>([])
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(MAPBOX_CONFIG.DEFAULT_ZOOM) // 現在のズームレベル
  
  // コールバック関数をrefで保持（依存配列の問題を回避）
  const onSpotClickRef = useRef(onSpotClick)
  const onMapClickRef = useRef(onMapClick)
  const initializeClusteringRef = useRef<((mapInstance: mapboxgl.Map) => void) | null>(null)
  const updateSpotsDataRef = useRef<(() => void) | null>(null)
  
  // コールバック関数の最新値を保持
  useEffect(() => {
    onSpotClickRef.current = onSpotClick
    onMapClickRef.current = onMapClick
  }, [onSpotClick, onMapClick])

  // トークンのチェック（初回のみ）
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__

    console.log('Mapbox token check:', token ? 'Token found' : 'Token not found')

    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set")
      setHasToken(false)
      return
    }

    setHasToken(true)
  }, [])

  // 地図の初期化（トークンが設定され、コンテナが準備できた後）
  useEffect(() => {
    // トークンがない場合はスキップ
    if (hasToken !== true) return
    
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || (typeof window !== 'undefined' ? (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__ : undefined)
    
    if (!token) return

    // 既に初期化済みの場合はスキップ
    if (map.current) {
      console.log('Map already initialized')
      return
    }

    // コンテナが存在しない場合はスキップ
    if (!mapContainer.current) {
      console.log('Container not ready yet')
      return
    }

    let retryCount = 0
    const maxRetries = TIMING_CONFIG.MAP_INIT_MAX_RETRIES

    // コンテナのサイズを確認（サイズがない場合は少し待つ）
    const checkContainerSize = () => {
      if (!mapContainer.current) return false
      
      const width = mapContainer.current.offsetWidth
      const height = mapContainer.current.offsetHeight
      
      console.log('Container size check:', { width, height, retryCount })
      
      // サイズが0でも、親要素のサイズがあれば初期化を試みる
      if (width === 0 || height === 0) {
        const parent = mapContainer.current.parentElement
        if (parent) {
          const parentWidth = parent.offsetWidth
          const parentHeight = parent.offsetHeight
          console.log('Parent size:', { parentWidth, parentHeight })
          
          // 親要素にサイズがあれば、強制的にサイズを設定
          if (parentWidth > 0 && parentHeight > 0) {
            mapContainer.current.style.width = '100%'
            mapContainer.current.style.height = '100%'
            return true
          }
        }
        
        if (retryCount < maxRetries) {
          retryCount++
          return false
        }
        
        // 最大リトライ回数に達した場合でも、強制的に初期化を試みる
        console.warn('Max retries reached, initializing map anyway')
        mapContainer.current.style.width = '100%'
        mapContainer.current.style.height = '100%'
        return true
      }
      
      return true
    }

    // コンテナのサイズが確保されるまで待つ
    const initMap = () => {
      if (!checkContainerSize()) {
        // サイズが確保されていない場合は、次のフレームで再試行
        setTimeout(initMap, TIMING_CONFIG.MAP_INIT_RETRY_DELAY)
        return
      }

      if (map.current || !mapContainer.current) return

      setMapboxToken(token)
      initializeMapboxWorker()

      try {
        const finalWidth = mapContainer.current.offsetWidth || mapContainer.current.clientWidth
        const finalHeight = mapContainer.current.offsetHeight || mapContainer.current.clientHeight
        
        console.log('Initializing Mapbox map...', {
          container: mapContainer.current,
          containerSize: {
            width: finalWidth,
            height: finalHeight
          },
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 7) + '...'
        })
        
        map.current = new mapboxgl.Map({
          ...getMapboxMapOptions(mapContainer.current),
          maxTileCacheSize: 50,
        })

        // mapRefに参照を設定（親コンポーネントから仮ピンを操作できるように）
        if (mapRef) {
          mapRef.current = map.current
        }

        map.current.on('load', () => {
          console.log('Mapbox map loaded successfully')
          setMapError(null)
          map.current?.resize()
          
          if (map.current && map.current.loaded()) {
            initializeClustering(map.current)
            
            // 地図クリックイベントを登録（onMapClickが設定されている場合のみ）
            if (onMapClickRef.current) {
              const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
                // 既存のスポットピンをクリックした場合は無視
                const features = map.current?.queryRenderedFeatures(e.point, {
                  layers: ['clusters', 'unclustered-point']
                })
                if (features && features.length > 0) return
                
                // 地図の空白部分をクリックした場合のみonMapClickを呼び出す
                const { lng, lat } = e.lngLat
                if (onMapClickRef.current) {
                  onMapClickRef.current(lat, lng)
                }
              }
              map.current.on('click', handleMapClick)
            }
            
            setTimeout(() => {
              if (map.current && map.current.loaded() && spots.length > 0) {
                updateSpotsData()
              }
            }, 200)
          }
        })

        map.current.on('error', (e) => {
          const errorMessage = formatMapboxError(e as MapboxError, token)
          setMapError(errorMessage)
          console.error('Mapbox error:', e)
          
          // 403エラーの場合、より詳細な情報を表示
          const errorStatus = (e as any).error?.status || (e as any).status
          if (errorStatus === 403) {
            console.error('Mapbox 403 Forbidden Error:', {
              message: errorMessage,
              tokenPrefix: token ? token.substring(0, 10) + '...' : 'N/A',
              tokenLength: token ? token.length : 0,
              isPublicToken: token ? token.startsWith('pk.') : false,
              url: (e as any).error?.url || (e as any).url,
            })
          }
        })

        map.current.on('style.load', () => {
          console.log('Mapbox style loaded')
          // スタイルが読み込まれたら、リサイズをトリガー
          map.current?.resize()
        })

        // 地図の移動やズーム完了時に、選択されたクラスタの範囲を再描画（統合イベントリスナー）
        const handleMapMoveOrZoom = () => {
          // 現在のズームレベルを更新
          if (map.current) {
            const zoom = map.current.getZoom()
            setCurrentZoom(zoom)
            console.log(`[MapView] Current zoom level: ${zoom.toFixed(2)}`)
          }
          
          // 選択されたクラスタの範囲を再描画（重複防止: 同じクラスタの場合はスキップ）
          if (selectedClusterSpotsRef.current && selectedClusterSpotsRef.current.length > 0 && selectedClusterCenterRef.current && map.current) {
            const clusterId = generateClusterId(selectedClusterSpotsRef.current)
            // 既に同じクラスタのパルスが表示されている場合はスキップ
            if (currentPulseClusterIdRef.current !== clusterId) {
              showClusterRangePulse(map.current, selectedClusterSpotsRef.current, selectedClusterCenterRef.current, true)
            }
          }
        }
        
        map.current.on('moveend', handleMapMoveOrZoom)
        map.current.on('zoomend', handleMapMoveOrZoom)
        
        // 初期ズームレベルを設定
        map.current.on('load', () => {
          if (map.current) {
            setCurrentZoom(map.current.getZoom())
          }
        })
        
        // ズーム中もズームレベルを表示（リアルタイム更新）
        map.current.on('zoom', () => {
          if (map.current) {
            const currentZoom = map.current.getZoom()
            // 頻繁に発火するため、デバッグ時のみ有効化
            // console.log(`[MapView] Zoom level: ${currentZoom.toFixed(2)}`)
          }
        })

        // 拡大縮小ボタン（+/-）は削除（ピンチズームやマウスホイールで操作可能）
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error("Error initializing Mapbox:", error)
        setMapError(errorMessage)
      }
    }

    // 初期化を開始（少し遅延させてコンテナが確実にマウントされるようにする）
    const timeoutId = setTimeout(() => {
      initMap()
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      // クリーンアップは、コンポーネントがアンマウントされる場合のみ実行
      // propsの変更による再レンダリングでは実行しない
      // if (map.current) {
      //   console.log('Cleaning up Mapbox map')
      //   map.current.remove()
      //   map.current = null
      //   if (mapRef) {
      //     mapRef.current = null
      //   }
      // }
    }
  }, [hasToken]) // onMapClickとmapRefを依存配列から削除

  // クラスター内のスポットのハイライトを解除する関数
  const clearClusterHighlight = useCallback((mapInstance: mapboxgl.Map) => {
    clusterHighlightedSpotsRef.current = []

    const highlightLayerId = 'cluster-spots-highlight'
    const highlightSourceId = 'cluster-spots-highlight-source'

    // レイヤーを削除
    if (mapInstance.getLayer(highlightLayerId)) {
      mapInstance.removeLayer(highlightLayerId)
    }

    // ソースを削除
    if (mapInstance.getSource(highlightSourceId)) {
      mapInstance.removeSource(highlightSourceId)
    }
  }, [])

  // クラスタIDを生成する関数（重複防止用）
  const generateClusterId = useCallback((clusterSpots: Spot[]): string => {
    // クラスタ内のスポットIDをソートして結合してユニークなIDを生成
    return clusterSpots.map(s => s.id).sort().join('-')
  }, [])

  // クラスター範囲を削除する関数
  // ホバー時のパルスを削除する関数
  const clearHoverClusterRangePulse = useCallback((mapInstance: mapboxgl.Map) => {
    hoverClusterRangePulseMarkersRef.current.forEach((marker) => {
      marker.remove()
    })
    hoverClusterRangePulseMarkersRef.current = []
  }, [])

  const clearClusterRangePulse = useCallback((mapInstance: mapboxgl.Map, force: boolean = false, clearHover: boolean = true) => {
    // 選択されたクラスタがある場合は、強制削除でない限り削除しない
    if (!force && selectedClusterSpotsRef.current && selectedClusterSpotsRef.current.length > 0) {
      // ホバー時のパルスのみ削除
      if (clearHover) {
        clearHoverClusterRangePulse(mapInstance)
      }
      return
    }

    // パルスアニメーションマーカーを削除
    clusterRangePulseMarkersRef.current.forEach((marker) => {
      marker.remove()
    })
    clusterRangePulseMarkersRef.current = []
    
    // ホバー時のパルスも削除
    if (clearHover) {
      clearHoverClusterRangePulse(mapInstance)
    }
    
    // 現在のパルスクラスタIDをクリア
    currentPulseClusterIdRef.current = null
    
    // 強制削除の場合は、選択されたクラスタもクリア
    if (force) {
      selectedClusterSpotsRef.current = null
      selectedClusterCenterRef.current = null
      selectedClusterRadiusMetersRef.current = null
    }
  }, [clearHoverClusterRangePulse])

  const clearClusterRange = useCallback((mapInstance: mapboxgl.Map, force: boolean = false) => {
    // 選択されたクラスタがある場合は、強制削除でない限り削除しない
    if (!force && selectedClusterSpotsRef.current && selectedClusterSpotsRef.current.length > 0) {
      return
    }

    if (clusterRangeCircleRef.current) {
      const { sourceId, layerId } = clusterRangeCircleRef.current
      
      // レイヤーを削除
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId)
      }
      if (mapInstance.getLayer(`${layerId}-outline`)) {
        mapInstance.removeLayer(`${layerId}-outline`)
      }
      
      // ソースを削除
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId)
      }
      
      clusterRangeCircleRef.current = null
    }

    // ハイライトを解除
    clearClusterHighlight(mapInstance)
    
    // 選択されたクラスタもクリア
    selectedClusterSpotsRef.current = null
  }, [clearClusterHighlight])

  // クラスター内のスポットをハイライト表示する関数
  const highlightClusterSpots = useCallback((mapInstance: mapboxgl.Map, clusterSpots: Spot[]) => {
    const spotIds = clusterSpots.map((s) => s.id)
    clusterHighlightedSpotsRef.current = spotIds

    // ハイライト用のレイヤーを作成（既存のunclustered-pointレイヤーをフィルター）
    // 実際には、unclustered-pointレイヤーのフィルターを更新してハイライト表示
    // または、新しいハイライトレイヤーを作成
    const highlightLayerId = 'cluster-spots-highlight'
    
    // 既存のレイヤーを削除
    if (mapInstance.getLayer(highlightLayerId)) {
      mapInstance.removeLayer(highlightLayerId)
    }

    // ハイライト用のGeoJSONを作成
    const highlightFeatures: GeoJSON.Feature[] = clusterSpots.map((spot) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [spot.lng, spot.lat],
      },
      properties: {
        spotId: spot.id,
      },
    }))

    // ソースを作成または更新
    const highlightSourceId = 'cluster-spots-highlight-source'
    if (mapInstance.getSource(highlightSourceId)) {
      const source = mapInstance.getSource(highlightSourceId) as mapboxgl.GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: highlightFeatures,
      })
    } else {
      mapInstance.addSource(highlightSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: highlightFeatures,
        },
      })
    }

    // ハイライトレイヤーを追加
    mapInstance.addLayer({
      id: highlightLayerId,
      type: 'circle',
      source: highlightSourceId,
      paint: {
        'circle-color': '#3b82f6',
        'circle-radius': 12,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8,
      },
    })
  }, [])

  // ホバー時のクラスタ範囲表示用のパルスアニメーションを表示する関数
  const showHoverClusterRangePulse = useCallback((mapInstance: mapboxgl.Map, clusterSpots: Spot[], clusterCenter: { lat: number; lng: number }) => {
    if (clusterSpots.length === 0) return

    // 低ズームレベル（10以下）では、パルスを表示しない（サイズが大きすぎて不安定になるため）
    const currentZoom = mapInstance.getZoom()
    if (currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.LARGE) {
      return
    }

    // 既存のホバー時のパルスを削除
    clearHoverClusterRangePulse(mapInstance)

    try {
      // ホットスポットの判定
      const centerLat = clusterCenter.lat
      const centerLng = clusterCenter.lng
      const clusterFeatures = mapInstance.queryRenderedFeatures(undefined, {
        layers: ['clusters'],
      })

      let isHotSpot = false
      let minDistance = Infinity
      for (const feature of clusterFeatures) {
        const geometry = feature.geometry as GeoJSON.Point | undefined
        const coords = geometry?.coordinates as [number, number] | undefined
        if (!coords) continue

        const distance = calculateDistanceInMeters(centerLat, centerLng, coords[1], coords[0])
        if (distance < minDistance) {
          minDistance = distance
          const recentCount = Number((feature.properties as any)?.recent_count ?? 0)
          isHotSpot = recentCount >= HOTSPOT_CONFIG.MIN_COUNT
        }
      }

      if (minDistance === Infinity) {
        const hotSpots = detectHotSpots(
          clusterSpots,
          HOTSPOT_CONFIG.RADIUS_METERS,
          HOTSPOT_CONFIG.MIN_COUNT,
          HOTSPOT_CONFIG.DAYS_AGO
        )
        isHotSpot = hotSpots.length > 0
      }

      if (!isHotSpot) return

      const currentZoom = mapInstance.getZoom()
      const isSpotDetailZoom = currentZoom >= MAPBOX_CONFIG.SPOT_DETAIL_ZOOM

      if (isSpotDetailZoom) {
        if (isHotSpot) {
          const marker = createClusterRangePulseMarker(
            clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
            mapInstance,
            false,
            true,
            clusterCenter
          )
          hoverClusterRangePulseMarkersRef.current.push(marker)
        }
      } else {
        const marker = createClusterRangePulseMarker(
          clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
          mapInstance,
          false,
          true,
          clusterCenter
        )
        hoverClusterRangePulseMarkersRef.current.push(marker)
      }
    } catch (error) {
      console.error("[MapView] Failed to show hover cluster range pulse:", error)
    }
  }, [clearHoverClusterRangePulse])

  // クラスタ範囲表示用のパルスアニメーションを表示する関数
  const showClusterRangePulse = useCallback((mapInstance: mapboxgl.Map, clusterSpots: Spot[], clusterCenter: { lat: number; lng: number }, persist: boolean = false) => {
    if (clusterSpots.length === 0) return

    // 低ズームレベル（10以下）では、ホバー時のパルスを表示しない
    // クリック時（persist=true）で、保存された範囲がある場合は表示する
    const currentZoom = mapInstance.getZoom()
    if (!persist && currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.LARGE) {
      return
    }

    // クラスタIDを生成して重複をチェック
    const clusterId = generateClusterId(clusterSpots)
    
    // 既に同じクラスタのパルスが表示されている場合はスキップ（重複防止）
    if (currentPulseClusterIdRef.current === clusterId && persist) {
      return
    }

    // 既存のパルスアニメーションを削除（persistがtrueの場合は選択されたクラスタを保持）
    if (persist) {
      selectedClusterSpotsRef.current = clusterSpots
      selectedClusterCenterRef.current = clusterCenter
      currentPulseClusterIdRef.current = clusterId
    }
    clearClusterRangePulse(mapInstance, !persist, !persist) // persistがfalseの場合はホバー時のパルスも削除

    try {
      // ホットスポットの判定（クラスタのrecent_countを確認）
      const centerLat = clusterCenter.lat
      const centerLng = clusterCenter.lng

      // ビューポート内のクラスタからホットスポット情報を取得
      // まず、クラスタの中心点に最も近いクラスタフィーチャーを探す
      const clusterFeatures = mapInstance.queryRenderedFeatures(undefined, {
        layers: ['clusters'],
      })

      let isHotSpot = false
      let minDistance = Infinity
      for (const feature of clusterFeatures) {
        const geometry = feature.geometry as GeoJSON.Point | undefined
        const coords = geometry?.coordinates as [number, number] | undefined
        if (!coords) continue

        const distance = calculateDistanceInMeters(centerLat, centerLng, coords[1], coords[0])
        if (distance < minDistance) {
          minDistance = distance
          const recentCount = Number((feature.properties as any)?.recent_count ?? 0)
          isHotSpot = recentCount >= HOTSPOT_CONFIG.MIN_COUNT
        }
      }

      // ビューポート内にクラスタが見つからない場合、フォールバックで判定
      if (minDistance === Infinity) {
        // detectHotSpotsを使用して判定
        const hotSpots = detectHotSpots(
          clusterSpots,
          HOTSPOT_CONFIG.RADIUS_METERS,
          HOTSPOT_CONFIG.MIN_COUNT,
          HOTSPOT_CONFIG.DAYS_AGO
        )
        isHotSpot = hotSpots.length > 0
      }

      if (!isHotSpot) return

      const currentZoom = mapInstance.getZoom()
      const isSpotDetailZoom = currentZoom >= MAPBOX_CONFIG.SPOT_DETAIL_ZOOM
      const fixedRadiusMeters = selectedClusterRadiusMetersRef.current ?? undefined

      if (isSpotDetailZoom) {
        if (isHotSpot) {
          const marker = createClusterRangePulseMarker(
            clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
            mapInstance,
            false,
            true,
            clusterCenter,
            fixedRadiusMeters
          )
          clusterRangePulseMarkersRef.current.push(marker)
        }
      } else {
        if (isHotSpot) {
          const marker = createClusterRangePulseMarker(
            clusterSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
            mapInstance,
            false,
            true,
            clusterCenter,
            fixedRadiusMeters
          )
          clusterRangePulseMarkersRef.current.push(marker)
        }
      }

      console.log(`[MapView] showClusterRangePulse: clusterSpots count=${clusterSpots.length}, isHotSpot=${isHotSpot}, persist=${persist}`)
    } catch (error) {
      console.error("[MapView] Failed to show cluster range pulse:", error)
    }
  }, [clearClusterRangePulse, generateClusterId])

  // クラスター範囲を表示する関数（削除予定、後で削除）
  const showClusterRange = useCallback((mapInstance: mapboxgl.Map, clusterSpots: Spot[], persist: boolean = false) => {
    if (clusterSpots.length === 0) return

    // 既存の範囲表示を削除（persistがtrueの場合は選択されたクラスタを保持）
    if (persist) {
      selectedClusterSpotsRef.current = clusterSpots
    }
    clearClusterRangePulse(mapInstance, !persist)

    try {
      // クラスター範囲を計算
      if (clusterSpots.length === 0) {
        console.warn("[MapView] showClusterRange: clusterSpots is empty")
        return
      }
      
      const range = calculateClusterRange(clusterSpots)
      const circlePolygon = createCirclePolygon(range.center, range.radiusMeters)

      // ソースを作成
      const sourceId = 'cluster-range-circle'
      if (mapInstance.getSource(sourceId)) {
        const source = mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: circlePolygon,
              properties: {},
            },
          ],
        })
      } else {
        mapInstance.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: circlePolygon,
                properties: {},
              },
            ],
          },
        })
      }

      // レイヤーを作成
      const layerId = 'cluster-range-circle-layer'
      if (!mapInstance.getLayer(layerId)) {
        mapInstance.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.1,
          },
        })

        mapInstance.addLayer({
          id: `${layerId}-outline`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.6,
            'line-dasharray': [2, 2],
          },
        })
      }

      clusterRangeCircleRef.current = { sourceId, layerId }

      // デバッグ: クラスタ内のスポット数と範囲を確認
      console.log(`[MapView] showClusterRange: clusterSpots count=${clusterSpots.length}, center=[${range.center.lat.toFixed(6)}, ${range.center.lng.toFixed(6)}], radius=${range.radiusMeters.toFixed(2)}m`)
      
      // 範囲内のスポット数を確認
      const spotsInRange = clusterSpots.filter((spot) => {
        const distance = calculateDistanceInMeters(range.center.lat, range.center.lng, spot.lat, spot.lng)
        return distance <= range.radiusMeters
      })
      console.log(`[MapView] showClusterRange: spots in range=${spotsInRange.length}/${clusterSpots.length}`)
      
      if (spotsInRange.length < clusterSpots.length) {
        console.warn(`[MapView] showClusterRange: Some spots are outside the calculated range!`)
        clusterSpots.forEach((spot) => {
          const distance = calculateDistanceInMeters(range.center.lat, range.center.lng, spot.lat, spot.lng)
          if (distance > range.radiusMeters) {
            console.warn(`[MapView] showClusterRange: Spot ${spot.id} is ${distance.toFixed(2)}m away (outside range)`)
          }
        })
      }

      // クラスター内のスポットをハイライト表示
      highlightClusterSpots(mapInstance, clusterSpots)
    } catch (error) {
      console.error("[MapView] Failed to show cluster range:", error)
    }
  }, [clearClusterRange, highlightClusterSpots])

  // クラスタリングを初期化する関数
  const initializeClustering = useCallback((mapInstance: mapboxgl.Map) => {
    if (!mapInstance.loaded()) {
      console.log('[MapView] initializeClustering: map not loaded yet')
      return
    }

    // 既に初期化されている場合はスキップ
    if (mapInstance.getSource('spots-cluster')) {
      console.log('[MapView] initializeClustering: already initialized, skipping')
      return
    }

    console.log('[MapView] initializeClustering: initializing clustering')

    // GeoJSONソースを追加（まだ存在しない場合）
    if (!mapInstance.getSource('spots-cluster')) {
      mapInstance.addSource('spots-cluster', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14, // 最大ズームレベルでクラスタリングを無効化
        // クラスタリングの半径（ピクセル）
        // 注意: Mapbox GL JSではクラスタリング半径を動的に変更できないため、固定値を使用
        // 50ピクセルは、一般的なズームレベル（10-14）で約50メートル相当になる
        clusterRadius: 50, // クラスタリングの半径（ピクセル）
        // ホットスポット用: "直近7日" の件数をクラスタ側で集計できるようにする
        // feature.properties.isRecent (0/1) を合計して recent_count にする
        // 更新可能性用: "更新可能" の件数をクラスタ側で集計できるようにする
        clusterProperties: {
          recent_count: ["+", ["get", "isRecent"]],
        },
      })

      // クラスタリング用のレイヤーを追加
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'spots-cluster',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6',
            10,
            '#10b981',
            50,
            '#f59e0b',
            100,
            '#ef4444',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            50,
            40,
            100,
            50,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // クラスタ内のスポット数を表示するレイヤー
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'spots-cluster',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#fff',
        },
      })

      // ホバーしているクラスタ用のレイヤー（初期状態では非表示）
      mapInstance.addLayer({
        id: 'clusters-hover',
        type: 'circle',
        source: 'spots-cluster',
        filter: ['==', ['get', 'cluster_id'], -1], // 存在しないIDで初期化（非表示）
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3b82f6', // 10未満: 青
            10,
            '#10b981', // 10-50: 緑
            50,
            '#f59e0b', // 50-100: オレンジ
            100,
            '#ef4444', // 100以上: 赤
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20 * 1.2, // 最小サイズを20%拡大
            10,
            30 * 1.2, // 10以上で30px * 1.2
            50,
            40 * 1.2, // 50以上で40px * 1.2
            100,
            50 * 1.2, // 100以上で50px * 1.2
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      })

      // ホバーしているクラスタの数値ラベル用のレイヤー
      mapInstance.addLayer({
        id: 'cluster-count-hover',
        type: 'symbol',
        source: 'spots-cluster',
        filter: ['==', ['get', 'cluster_id'], -1], // 存在しないIDで初期化（非表示）
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#fff',
        },
      })

      // 個別のスポットマーカーレイヤー（クラスタリングされていない場合）
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'spots-cluster',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'statusType'], 'pending'],
            SPOT_MARKER_STYLES.pending.color,
            SPOT_MARKER_STYLES.approved.color,
          ],
          'circle-radius': SPOT_MARKER_STYLES.approved.size / 2,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // ホバーしているスポット用のレイヤー（初期状態では非表示）
      mapInstance.addLayer({
        id: 'unclustered-point-hover',
        type: 'circle',
        source: 'spots-cluster',
        filter: ['==', ['get', 'spotId'], ''],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'statusType'], 'pending'],
            SPOT_MARKER_STYLES.pending.color,
            SPOT_MARKER_STYLES.approved.color,
          ],
          'circle-radius': SPOT_MARKER_STYLES.approved.size / 2 * 1.2,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      })

      // クラスタクリック時のズームイン処理
      mapInstance.on('click', 'clusters', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        const feature = features[0]
        const clusterId = feature?.properties?.cluster_id

        if (!feature || !clusterId || !mapInstance.getSource('spots-cluster')) {
          return
        }

        // クリック位置ではなく「クラスタの実座標」を中心にズームする
        // （遠距離だと円の端をクリックして中心がズレる問題を防ぐ）
        const geometry = feature.geometry as GeoJSON.Point | undefined
        const coords = geometry?.coordinates as [number, number] | undefined
        if (!coords) {
          return
        }

        let [lng, lat] = coords
        // 世界地図の折り返し（wrap）で中心が飛ぶのを防ぐ
        while (Math.abs((e.lngLat?.lng ?? lng) - lng) > 180) {
          lng += (e.lngLat?.lng ?? lng) > lng ? 360 : -360
        }

        const center = [lng, lat] as [number, number]

        if (clusterId && mapInstance.getSource('spots-cluster')) {
          const source = mapInstance.getSource('spots-cluster') as mapboxgl.GeoJSONSource
          
          // クラスタ内の記録を取得して代表記録を選定
          source.getClusterLeaves(clusterId, 999, 0, (err, leaves) => {
            if (err || !leaves) return

            // GeoJSONのFeatureからSpot IDを取得
            const spotIds = leaves
              .map((leaf) => leaf.properties?.spotId)
              .filter((id): id is string => typeof id === 'string')

            // クラスタ内の記録を取得
            const clusterSpots = spotsDataRef.current.filter((spot) => spotIds.includes(spot.id))
            
            // クラスタのピンの位置を取得
            const clusterCenter = { lat, lng }
            
            // ズームレベル5でクリックした時のクラスタ範囲（メートル単位）を計算して保存
            // この範囲はズームレベル14に遷移した後も引き継がれる
            const currentZoom = mapInstance.getZoom()
            if (currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.LARGE && clusterSpots.length > 0) {
              const { calculateClusterRange } = require("@/lib/mapbox/cluster-range-utils")
              const range = calculateClusterRange(clusterSpots)
              selectedClusterRadiusMetersRef.current = range.radiusMeters
              console.log(`[MapView] Cluster click at zoom ${currentZoom.toFixed(2)}: saved radiusMeters=${range.radiusMeters.toFixed(2)}m`)
            }
            
            // クラスター範囲を表示（クリック時は固定表示）
            // showClusterRangePulseが更新可能性とホットスポットの状態に応じて適切に表示する
            if (clusterSpots.length > 0) {
              showClusterRangePulse(mapInstance, clusterSpots, clusterCenter, true)
            }
            
            // 代表記録を選定
            const representativeRecord = selectRepresentativeRecord(clusterSpots)
            
            // 代表記録がある場合、それを表示（クラスタ内の全スポットも一緒に渡す）
            if (representativeRecord && onSpotClickRef.current) {
              onSpotClickRef.current(representativeRecord, clusterSpots)
            } else if (clusterSpots.length > 0) {
              // 代表記録がない場合、最初の記録を表示（クラスタ内の全スポットも一緒に渡す）
              onSpotClickRef.current(clusterSpots[0], clusterSpots)
            }
          })

          // クラスタのサイズに応じたズーム処理
          const pointCount = feature?.properties?.point_count as number | undefined
          if (!pointCount) return

          const currentZoom = mapInstance.getZoom()
          console.log(`[MapView] Cluster click: pointCount=${pointCount}, currentZoom=${currentZoom.toFixed(2)}, CLUSTER_ZOOM_LEVELS.SMALL=${MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL}`)
          
          // ズームレベル14.0以上の場合、個別スポット表示に切り替える（ズームレベル18に遷移）
          // 浮動小数点の誤差を考慮して、13.99以上を14.0以上とみなす
          if (currentZoom >= MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL - 0.01) {
            console.log(`[MapView] Cluster click: Zoom level >= 14, transitioning to ${MAPBOX_CONFIG.SPOT_DETAIL_ZOOM}`)
            const nextZoom = MAPBOX_CONFIG.SPOT_DETAIL_ZOOM
            
            // 直接ズームレベルを設定（アニメーションなし）
            // これにより、確実に目標ズームレベルに到達する
            mapInstance.setZoom(nextZoom)
            mapInstance.setCenter(center)
            
            // アニメーション完了後にズームレベルを確認
            setTimeout(() => {
              const finalZoom = mapInstance.getZoom()
              console.log(`[MapView] Cluster click: Final zoom: ${finalZoom.toFixed(2)}`)
              // 目標ズームレベルに到達していない場合、再度試行
              if (finalZoom < nextZoom - 0.5) {
                console.log(`[MapView] Cluster click: Zoom level not reached, retrying...`)
                mapInstance.setZoom(nextZoom)
                mapInstance.setCenter(center)
              }
            }, 100)
            return
          }
          
          // クラスタのサイズに応じて目標ズームレベルを決定
          let targetZoom: number
          if (pointCount < 10) {
            // 小さいクラスタ（10件未満）: 1回のクリックで個別スポット表示
            targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL
          } else if (pointCount < 50) {
            // 中程度のクラスタ（10-50件）: 2回のクリックで個別スポット表示
            // 現在のズームレベルが12未満の場合は12に、12以上の場合は14に
            if (currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.MEDIUM) {
              targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.MEDIUM
            } else {
              targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL
            }
          } else {
            // 大きいクラスタ（50件以上）: 3回のクリックで個別スポット表示
            // 現在のズームレベルに応じて段階的にズームイン
            if (currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.LARGE) {
              targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.LARGE
            } else if (currentZoom < MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.MEDIUM) {
              targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.MEDIUM
            } else {
              targetZoom = MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL
            }
          }

          // 目標ズームレベルが現在のズームレベルより小さい場合は、目標ズームレベルに設定
          if (targetZoom < currentZoom) {
            targetZoom = currentZoom
          }

          // 固定ステップでズームイン（最大でも+2ステップ）
          const zoomStep = MAPBOX_CONFIG.CLUSTER_ZOOM_STEP
          const nextZoom = Math.min(targetZoom, currentZoom + zoomStep)
          console.log(`[MapView] Cluster click: targetZoom=${targetZoom}, nextZoom=${nextZoom.toFixed(2)}, zoomStep=${zoomStep}`)

          mapInstance.easeTo({
            center,
            zoom: nextZoom,
            duration: TIMING_CONFIG.CLUSTER_CLICK_ZOOM_DURATION,
          })
          
          // ズーム完了後の再描画は、統合されたmoveend/zoomendイベントリスナーで処理されるため、ここでは削除
        }
      })

      // 個別スポットクリック時の処理
      mapInstance.on('click', 'unclustered-point', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point'],
        })
        if (features[0] && features[0].properties) {
          const spotId = features[0].properties.spotId
          const spot = spotsDataRef.current.find((s) => s.id === spotId)
          if (spot && onSpotClickRef.current) {
            // 個別スポットクリック時はクラスタ範囲をクリア
            clearClusterRangePulse(mapInstance, true)
            
            // ズームレベル14.0以上の場合、ズームレベル18に遷移
            const currentZoom = mapInstance.getZoom()
            if (currentZoom >= MAPBOX_CONFIG.CLUSTER_ZOOM_LEVELS.SMALL) {
              const geometry = features[0].geometry as GeoJSON.Point | undefined
              const coords = geometry?.coordinates as [number, number] | undefined
              if (coords) {
                const [lng, lat] = coords
                mapInstance.easeTo({
                  center: [lng, lat],
                  zoom: MAPBOX_CONFIG.SPOT_DETAIL_ZOOM,
                  duration: TIMING_CONFIG.CLUSTER_CLICK_ZOOM_DURATION,
                })
              }
            }
            
            // 個別スポットの場合はクラスタ内のスポットを渡さない（undefined）
            onSpotClickRef.current(spot, undefined)
          }
        }
      })
      
      // 地図の空いている部分をクリックしたときにクラスタ範囲をクリア
      mapInstance.on('click', (e) => {
        // クラスタやスポット以外をクリックした場合
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters', 'unclustered-point'],
        })
        if (features.length === 0) {
          // 空いている部分をクリックした場合はクラスタ範囲をクリア
          clearClusterRangePulse(mapInstance, true)
        }
      })

      // クラスタのホバーエフェクト（特定のクラスタのみに適用）
      mapInstance.on('mouseenter', 'clusters', (e) => {
        mapInstance.getCanvas().style.cursor = 'pointer'
        
        // ホバーしているクラスタのIDを取得
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        
        if (features[0] && features[0].properties) {
          const clusterId = features[0].properties.cluster_id as number
          
          // ホバーしているクラスタ用のレイヤーのフィルターを更新
          mapInstance.setFilter('clusters-hover', ['==', ['get', 'cluster_id'], clusterId])
          mapInstance.setFilter('cluster-count-hover', ['==', ['get', 'cluster_id'], clusterId])

          // クラスタのピンの位置を取得
          const geometry = features[0].geometry as GeoJSON.Point | undefined
          const coords = geometry?.coordinates as [number, number] | undefined
          if (!coords) return

          const [lng, lat] = coords
          const clusterCenter = { lat, lng }

          // クラスター範囲を表示（案1: ホバー時に範囲を表示）
          const source = mapInstance.getSource('spots-cluster') as mapboxgl.GeoJSONSource
          if (source) {
            source.getClusterLeaves(clusterId, 999, 0, (err, leaves) => {
              if (err || !leaves) return

              // GeoJSONのFeatureからSpot IDを取得
              const spotIds = leaves
                .map((leaf) => leaf.properties?.spotId)
                .filter((id): id is string => typeof id === 'string')

              // クラスタ内の記録を取得
              const clusterSpots = spotsDataRef.current.filter((spot) => spotIds.includes(spot.id))

              // 選択されたクラスタがある場合は、ホバー時のパルスを表示しない
              if (selectedClusterSpotsRef.current && selectedClusterSpotsRef.current.length > 0) {
                return
              }

              // ホバー時のパルスを表示（一時表示）
              if (clusterSpots.length > 0) {
                showHoverClusterRangePulse(mapInstance, clusterSpots, clusterCenter)
              }
            })
          }
        }
      })
      
      mapInstance.on('mouseleave', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = ''
        
        // ホバーしているクラスタ用のレイヤーを非表示にする
        mapInstance.setFilter('clusters-hover', ['==', ['get', 'cluster_id'], -1]) // 存在しないIDでフィルター
        mapInstance.setFilter('cluster-count-hover', ['==', ['get', 'cluster_id'], -1]) // 存在しないIDでフィルター

        // ホバー時のパルスを削除（選択されたクラスタがある場合は削除しない）
        if (!selectedClusterSpotsRef.current || selectedClusterSpotsRef.current.length === 0) {
          clearHoverClusterRangePulse(mapInstance)
        }
      })
      
      // 個別スポットのホバーエフェクト（特定のスポットのみに適用）
      mapInstance.on('mouseenter', 'unclustered-point', (e) => {
        mapInstance.getCanvas().style.cursor = 'pointer'
        
        // ホバーしているスポットのIDを取得
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point'],
        })
        
        if (features[0] && features[0].properties) {
          const spotId = features[0].properties.spotId as string
          
          // ホバーしているスポット用のレイヤーのフィルターを更新
          mapInstance.setFilter('unclustered-point-hover', ['==', ['get', 'spotId'], spotId])
        }
      })
      
      mapInstance.on('mouseleave', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = ''
        
        // ホバーしているスポット用のレイヤーを非表示にする
        mapInstance.setFilter('unclustered-point-hover', ['==', ['get', 'spotId'], '']) // 存在しないIDでフィルター
      })
    }
  }, []) // 依存配列を空にして、一度だけ実行されるようにする
  
  // initializeClusteringをrefに保存
  useEffect(() => {
    initializeClusteringRef.current = initializeClustering
  }, [initializeClustering])


  // ホットスポットを更新する関数
  const updateHotSpots = useCallback((spotsToCheck: Spot[]) => {
    if (!map.current) {
      console.log("[MapView] updateHotSpots: map is null, skipping")
      return
    }

    // style load直後など loaded() が一瞬 false になることがあるため、
    // idle を待ってから描画する（skipしない）
    if (!map.current.loaded()) {
      if (pendingHotSpotUpdateRef.current) {
        console.log("[MapView] updateHotSpots: waiting for idle (already pending)")
        return
      }
      pendingHotSpotUpdateRef.current = true
      console.log("[MapView] updateHotSpots: waiting for idle...")
      map.current.once("idle", () => {
        pendingHotSpotUpdateRef.current = false
        updateHotSpots(spotsToCheck)
      })
      return
    }

    console.log("[MapView] updateHotSpots: start", {
      spotsToCheck: spotsToCheck.length,
      radiusMeters: HOTSPOT_CONFIG.RADIUS_METERS,
      minCount: HOTSPOT_CONFIG.MIN_COUNT,
      daysAgo: HOTSPOT_CONFIG.DAYS_AGO,
    })
    
    // 既存のホットスポットマーカーを削除
    hotSpotMarkersRef.current.forEach((marker) => {
      marker.remove()
    })
    hotSpotMarkersRef.current = []
    
    // まずは「クラスタの中心座標」を使ってホットスポットを描画する（クラスタ表示とズレないように）
    const canvas = map.current.getCanvas()
    const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
      [0, 0],
      [canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height],
    ]

    const clusterFeatures = map.current.queryRenderedFeatures(bbox, { layers: ["clusters"] })

    console.log(`[MapView] updateHotSpots: found ${clusterFeatures.length} clusters in viewport`)
    const mapCenter = map.current.getCenter()
    const mapZoom = map.current.getZoom()
    console.log(`[MapView] updateHotSpots: map center: [${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}], zoom: ${mapZoom.toFixed(2)}`)

    const hotSpotsFromClusters: Array<{ center: { lat: number; lng: number }; count: number; intensity: "low" | "medium" | "high" }> = []

    for (const feature of clusterFeatures) {
      const geometry = feature.geometry as GeoJSON.Point | undefined
      const coords = geometry?.coordinates as [number, number] | undefined
      if (!coords) continue

      const recentCount = Number((feature.properties as any)?.recent_count ?? 0)
      const pointCount = Number((feature.properties as any)?.point_count ?? 0)
      
      // オーストラリアの座標範囲をチェック（シドニー周辺: lat -33.8〜-33.9, lng 151.2〜151.3）
      const isAustralia = coords[1] < -33.5 && coords[1] > -34.0 && coords[0] > 151.0 && coords[0] < 151.5
      
      console.log(`[MapView] updateHotSpots: cluster at [${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}], point_count=${pointCount}, recent_count=${recentCount}${isAustralia ? ' (AUSTRALIA)' : ''}`)
      
      if (!Number.isFinite(recentCount) || recentCount < HOTSPOT_CONFIG.MIN_COUNT) {
        if (recentCount > 0) {
          console.log(`[MapView] updateHotSpots: cluster skipped (recentCount=${recentCount} < MIN_COUNT=${HOTSPOT_CONFIG.MIN_COUNT})`)
        }
        continue
      }

      let intensity: "low" | "medium" | "high"
      if (recentCount >= HOTSPOT_CONFIG.INTENSITY_THRESHOLDS.HIGH) intensity = "high"
      else if (recentCount >= HOTSPOT_CONFIG.INTENSITY_THRESHOLDS.MEDIUM) intensity = "medium"
      else intensity = "low"

      hotSpotsFromClusters.push({
        center: { lng: coords[0], lat: coords[1] },
        count: recentCount,
        intensity,
      })
    }

    // ビューポート内のクラスターからホットスポットを取得
    // さらに、フォールバックでビューポート外のホットスポットも検出（オーストラリアなど）
    const fallback = detectHotSpots(
      spotsToCheck,
      HOTSPOT_CONFIG.RADIUS_METERS,
      HOTSPOT_CONFIG.MIN_COUNT,
      HOTSPOT_CONFIG.DAYS_AGO
    )
    const fallbackHotSpots = fallback.map((h) => ({ center: h.center, count: h.count, intensity: h.intensity }))
    console.log(`[MapView] updateHotSpots: fallback detected ${fallbackHotSpots.length} hot spots`)
    
    // オーストラリアのホットスポットを確認
    const auHotSpots = fallbackHotSpots.filter((h) => h.center.lat < -33.5 && h.center.lat > -34.0 && h.center.lng > 151.0 && h.center.lng < 151.5)
    if (auHotSpots.length > 0) {
      console.log(`[MapView] updateHotSpots: found ${auHotSpots.length} Australia hot spots in fallback:`, auHotSpots)
    }
    
    // ビューポート内のクラスターとフォールバックの結果をマージ
    // 同じ位置のホットスポットは重複を避ける（ビューポート内のクラスターを優先）
    const hotSpotsMap = new Map<string, { center: { lat: number; lng: number }; count: number; intensity: "low" | "medium" | "high" }>()
    
    // まずビューポート内のクラスターを追加
    hotSpotsFromClusters.forEach((h) => {
      const key = `${h.center.lat.toFixed(4)},${h.center.lng.toFixed(4)}`
      hotSpotsMap.set(key, h)
    })
    
    // フォールバックの結果を追加（重複していない場合のみ）
    fallbackHotSpots.forEach((h) => {
      const key = `${h.center.lat.toFixed(4)},${h.center.lng.toFixed(4)}`
      if (!hotSpotsMap.has(key)) {
        hotSpotsMap.set(key, h)
      }
    })
    
    const hotSpots = Array.from(hotSpotsMap.values())
    console.log(`[MapView] updateHotSpots: detected ${hotSpots.length} hot spots total (${hotSpotsFromClusters.length} from viewport, ${fallbackHotSpots.length} from fallback, ${hotSpots.length} merged)`)

    hotSpots.forEach((hotSpot) => {
      const marker = createHotSpotMarker(hotSpot, map.current!)
      hotSpotMarkersRef.current.push(marker)
    })

    console.log("[MapView] updateHotSpots: done", { markers: hotSpotMarkersRef.current.length })
  }, [])
  
  // スポットデータを更新する関数（クラスタリング対応）
  const updateSpotsData = useCallback(() => {
    if (!map.current || !map.current.loaded()) {
      console.log('[MapView] updateSpotsData: map not ready')
      return
    }

    const source = map.current.getSource('spots-cluster') as mapboxgl.GeoJSONSource
    if (!source) {
      console.log('[MapView] updateSpotsData: source not found, initializing clustering')
      // ソースがまだ初期化されていない場合は、初期化を待つ
      if (map.current.loaded()) {
        if (initializeClusteringRef.current) {
          initializeClusteringRef.current(map.current)
        }
        // 初期化後に再試行
        setTimeout(() => {
          if (updateSpotsDataRef.current) {
            updateSpotsDataRef.current()
          }
        }, 100)
      }
      return
    }

    // 有効なスポットのみをフィルタリング
    const validSpots = spots.filter(
      (spot) => !isNaN(spot.lat) && !isNaN(spot.lng) && spot.lat !== 0 && spot.lng !== 0
    )

    console.log(`[MapView] updateSpotsData: filtering ${spots.length} spots, ${validSpots.length} valid`)

    // GeoJSON形式に変換
    const now = Date.now()
    const sinceMs = HOTSPOT_CONFIG.DAYS_AGO * 24 * 60 * 60 * 1000
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validSpots.map((spot) => {
        const isApproved = spot.status === SPOT_STATUS.APPROVED || spot.status === null || spot.status === undefined
        const isPending = spot.status === SPOT_STATUS.PENDING
        const statusType: 'approved' | 'pending' = isPending ? 'pending' : 'approved'

        // ホットスポット用: 直近7日かどうか（0/1）
        // clusterProperties で recent_count を合計するため数値にする
        // 承認済みのスポットのみを対象にする（detectHotSpotsと同じ条件）
        let isRecent = 0
        if (spot.createdAt && isApproved) {
          const createdAtTime = new Date(spot.createdAt).getTime()
          const timeDiff = now - createdAtTime
          const isWithin7Days = timeDiff >= 0 && timeDiff <= sinceMs
          
          // デバッグ: オーストラリアのホットスポットデータを確認
          if (spot.id?.startsWith('hotspot-au-')) {
            const timeDiffDays = (timeDiff / (24 * 60 * 60 * 1000)).toFixed(2)
            console.log(`[MapView] updateSpotsData: hotspot-au spot ${spot.id}:`, {
              createdAt: spot.createdAt,
              createdAtTime: new Date(createdAtTime).toISOString(),
              now: new Date(now).toISOString(),
              timeDiff,
              timeDiffDays: `${timeDiffDays} days`,
              sinceMs,
              sinceMsDays: `${(sinceMs / (24 * 60 * 60 * 1000)).toFixed(2)} days`,
              isWithin7Days,
              isApproved,
              isRecent,
              lat: spot.lat,
              lng: spot.lng,
            })
          }
          
          isRecent = isWithin7Days ? 1 : 0
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [spot.lng, spot.lat],
          },
          properties: {
            spotId: spot.id,
            spotName: spot.spotName,
            isRecent,
            statusType,
            status: spot.status || 'approved',
          },
        }
      }),
    }

    // データを更新
    source.setData(geojson)
    spotsDataRef.current = validSpots

    console.log(`[MapView] updateSpotsData: updated ${validSpots.length} spots`)
    
    // ホットスポットを検出して表示
    console.log("[MapView] updateSpotsData: calling updateHotSpots...")
    updateHotSpots(validSpots)
    console.log("[MapView] updateSpotsData: updateHotSpots called")
  }, [spots, updateHotSpots])
  
  // updateSpotsDataをrefに保存
  useEffect(() => {
    updateSpotsDataRef.current = updateSpotsData
  }, [updateSpotsData])
  
  // クリーンアップ: コンポーネントがアンマウントされたときにマーカーを削除
  useEffect(() => {
    return () => {
      // ホットスポットマーカーを削除
      hotSpotMarkersRef.current.forEach((marker) => {
        marker.remove()
      })
      hotSpotMarkersRef.current = []
    }
  }, [])

  // spots配列のIDを追跡して、実際に変更があった場合のみ更新
  const spotsIdsRef = useRef<string>("")

  useEffect(() => {
    if (!map.current) {
      console.log('[MapView] useEffect: map.current is null, skipping update')
      return
    }

    // spots配列のIDを文字列化して比較
    const currentSpotsIds = spots.map(s => s.id).sort().join(",")
    
    if (spotsIdsRef.current === currentSpotsIds) {
      console.log('[MapView] useEffect: spots IDs unchanged, skipping update')
      return
    }

    spotsIdsRef.current = currentSpotsIds
    console.log(`[MapView] useEffect: spots changed, updating data (${spots.length} spots)`)

    // マップが完全に読み込まれるまで待つ
    if (!map.current.loaded()) {
      console.log('[MapView] useEffect: map not loaded yet, waiting...')
      const waitForLoad = () => {
        if (map.current?.loaded()) {
          console.log('[MapView] useEffect: map loaded, initializing clustering')
          if (initializeClusteringRef.current) {
            initializeClusteringRef.current(map.current)
          }
          if (updateSpotsDataRef.current) {
            updateSpotsDataRef.current()
          }
        } else {
                setTimeout(waitForLoad, TIMING_CONFIG.MAP_INIT_RETRY_DELAY)
        }
      }
      waitForLoad()
      return
    }

    // クラスタリングが初期化されていない場合は初期化
    if (!map.current.getSource('spots-cluster')) {
      if (initializeClusteringRef.current) {
        initializeClusteringRef.current(map.current)
      }
    }
    
    if (updateSpotsDataRef.current) {
      updateSpotsDataRef.current()
    }
  }, [spots])

  useEffect(() => {
    if (!map.current || !selectedSpot) return
    
    // preserveMapPositionがtrueの場合は、地図位置を変更しない
    if (preserveMapPosition) {
      console.log('[MapView] preserveMapPosition is true, skipping flyTo')
      return
    }

    // 現在のズームレベルを取得
    const currentZoom = map.current.getZoom()
    // 既にズームインしている場合は現在のズームレベルを保持、そうでない場合はDETAIL_ZOOMにズーム
    const targetZoom = currentZoom > MAPBOX_CONFIG.DETAIL_ZOOM ? currentZoom : MAPBOX_CONFIG.DETAIL_ZOOM

    // PC版では左75%の位置にピンを配置（右側に25%のパディング）
    const isMobile = window.innerWidth < 768
    const padding = isMobile
      ? undefined // SP版は中央配置
      : { right: window.innerWidth * 0.25 } // PC版は右側に25%のパディング

    map.current.flyTo({
      center: [selectedSpot.lng, selectedSpot.lat],
      zoom: targetZoom,
      duration: MAPBOX_CONFIG.FLY_TO_DURATION,
      padding: padding,
    })
  }, [selectedSpot, preserveMapPosition])

  // 仮ピンが設定された時の地図位置調整（既存スポットと同じ配置）
  useEffect(() => {
    if (!map.current || !tempPinLocation) return
    
    // preserveMapPositionがtrueの場合は、地図位置を変更しない
    if (preserveMapPosition) {
      console.log('[MapView] preserveMapPosition is true, skipping flyTo for tempPin')
      return
    }

    // PC版では左75%の位置にピンを配置（右側に25%のパディング）
    const isMobile = window.innerWidth < 768
    const padding = isMobile
      ? undefined // SP版は中央配置
      : { right: window.innerWidth * 0.25 } // PC版は右側に25%のパディング

    map.current.flyTo({
      center: [tempPinLocation.lng, tempPinLocation.lat],
      zoom: MAPBOX_CONFIG.DETAIL_ZOOM,
      duration: MAPBOX_CONFIG.FLY_TO_DURATION,
      padding: padding,
    })
  }, [tempPinLocation, preserveMapPosition])

  const handleLocateUser = () => {
    if (!map.current) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: MAPBOX_CONFIG.DETAIL_ZOOM,
            duration: MAPBOX_CONFIG.FLY_TO_DURATION,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  // ローディング状態
  if (hasToken === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">地図を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // トークンがない場合
  if (!hasToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            環境変数 <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> を設定してください。
          </p>
          <p className="text-sm text-muted-foreground">
            <a
              href="https://www.mapbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>{" "}
            でトークンを取得できます。
          </p>
        </div>
      </div>
    )
  }

  // エラーがある場合
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2 text-destructive">地図の読み込みエラー</h3>
          <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
          <p className="text-xs text-muted-foreground">
            ブラウザのコンソールで詳細を確認してください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {/* ズームレベル表示（デバッグ用） */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-md text-sm font-mono z-10">
        Zoom: {currentZoom.toFixed(2)}
      </div>
      <Button size="icon" className="absolute bottom-4 right-4 rounded-full shadow-lg z-10" onClick={handleLocateUser}>
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  )
}
