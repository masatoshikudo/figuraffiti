"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { searchPlaces, getPlaceDetails, type GooglePlacePrediction } from "@/lib/google-places"
import { MAPBOX_CONFIG, EXTERNAL_URLS } from "@/lib/constants"
import {
  initializeMapboxWorker,
  setMapboxToken,
  getMapboxMapOptions,
  createCenterMarker,
} from "@/lib/mapbox/mapbox-utils"
import { LocationSearchBar } from "./location-picker/location-search-bar"
import { MapContainer } from "./location-picker/map-container"

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
}

export function LocationPicker({ onLocationChange, initialLat, initialLng }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [searchError, setSearchError] = useState<string>("")
  const [searchResults, setSearchResults] = useState<GooglePlacePrediction[]>([])
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null)
  const isDraggingRef = useRef(false) // ドラッグ中かどうかを追跡
  const isZoomingRef = useRef(false) // ズーム中かどうかを追跡
  const initialCenterSetRef = useRef(false) // 初期位置が設定されたかどうかを追跡
  const onLocationChangeRef = useRef(onLocationChange)
  const updateLocationRef = useRef<((lng: number, lat: number) => Promise<void>) | null>(null) // updateLocation関数を保持
  
  // onLocationChangeの最新値を保持
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  // トークンのチェック
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    setHasToken(!!token)
    
    // Google Places APIキーのチェック
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    setGoogleApiKey(googleKey || null)
    
    if (!googleKey) {
      console.warn('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set. Google Places search will not work.')
    }
  }, [])


  // 地図の初期化（currentLocationを依存配列から削除して無限ループを防ぐ）
  useEffect(() => {
    if (hasToken !== true || !mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    if (map.current) return

    setMapboxToken(token)
    initializeMapboxWorker()

    const center: [number, number] = initialLat && initialLng
      ? [initialLng, initialLat]
      : MAPBOX_CONFIG.DEFAULT_CENTER

    map.current = new mapboxgl.Map({
      ...getMapboxMapOptions(mapContainer.current, center, initialLat && initialLng ? MAPBOX_CONFIG.DETAIL_ZOOM : MAPBOX_CONFIG.DEFAULT_ZOOM),
    })

    // 中心にマーカーを追加・更新（useEffect内で定義）
    const addCenterMarker = (lng: number, lat: number) => {
      if (!map.current) return

      // 既存のマーカーを削除
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // 新しいマーカーを作成
      markerRef.current = createCenterMarker(lng, lat, map.current)
    }

    // 位置を更新して親コンポーネントに通知（useEffect内で定義して無限ループを防ぐ）
    const updateLocation = async (lng: number, lat: number) => {
      // 逆ジオコーディングで住所を取得
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const response = await fetch(
          `${EXTERNAL_URLS.MAPBOX_API_GEOCODING}/${lng},${lat}.json?access_token=${token}&language=ja`
        )
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          const address = data.features[0].place_name
          setSelectedAddress(address)
          onLocationChangeRef.current(lat, lng, address)
        } else {
          onLocationChangeRef.current(lat, lng)
        }
      } catch (error) {
        console.error('Error fetching address:', error)
        onLocationChangeRef.current(lat, lng)
      }
    }
    
    // updateLocation関数をrefに保存（他の関数から参照できるように）
    updateLocationRef.current = updateLocation

    map.current.on('load', () => {
      // 初期位置にマーカーを中心に配置
      const initialCenter = map.current!.getCenter()
      addCenterMarker(initialCenter.lng, initialCenter.lat)
      // 初期位置が設定されている場合は位置を確定
      if (initialLat && initialLng) {
        updateLocation(initialLng, initialLat)
      }
    })

    // 地図の移動中（ドラッグ中）にマーカーを中心に更新
    map.current.on('move', () => {
      if (!map.current) return
      const center = map.current.getCenter()
      // マーカーを常に中心に配置
      if (markerRef.current) {
        markerRef.current.setLngLat([center.lng, center.lat])
      }
    })

    // ズーム開始を検知
    map.current.on('zoomstart', () => {
      isZoomingRef.current = true
    })

    // ズーム終了を検知
    map.current.on('zoomend', () => {
      isZoomingRef.current = false
    })

    // 地図の移動開始（ドラッグ開始）
    map.current.on('dragstart', () => {
      isDraggingRef.current = true
      setIsDragging(true)
    })

    // 地図の移動終了（ドラッグ終了）時に位置を確定
    map.current.on('dragend', () => {
      if (!map.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      const center = map.current.getCenter()
      // 位置を確定して親コンポーネントに通知
      updateLocation(center.lng, center.lat)
    })

    // moveendイベント（モバイル対応：ドラッグ操作が完了した場合のみ位置を確定）
    // ズーム操作では位置確定しない
    map.current.on('moveend', () => {
      // ドラッグ操作が完了し、ズーム操作中でない場合のみ位置を確定
      if (isDraggingRef.current && !isZoomingRef.current) {
        if (!map.current) return
        // dragendで既に位置確定している可能性があるため、少し遅延させて重複を防ぐ
        setTimeout(() => {
          if (isDraggingRef.current && !isZoomingRef.current && map.current) {
            isDraggingRef.current = false
            setIsDragging(false)
            const center = map.current.getCenter()
            updateLocation(center.lng, center.lat)
          }
        }, 50)
      }
    })

    // 初期位置が設定されている場合は地図を移動（初回のみ）
    if (initialLat && initialLng && !initialCenterSetRef.current) {
      map.current.once('load', () => {
        initialCenterSetRef.current = true
        map.current?.flyTo({
          center: [initialLng, initialLat],
          zoom: MAPBOX_CONFIG.DETAIL_ZOOM,
        })
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [hasToken]) // initialLatとinitialLngを依存配列から削除


  // 住所検索（Google Places API使用）
  const handleSearch = async () => {
    if (!searchQuery.trim() || !map.current) return

    setIsSearching(true)
    setSearchError("")
    try {
      // Google Places API Autocompleteで検索候補を取得（APIルート経由）
      const predictions = await searchPlaces(searchQuery)
      
      if (predictions.length > 0) {
        setSearchResults(predictions)
        setSearchError("")
      } else {
        setSearchResults([])
        setSearchError("検索結果が見つかりませんでした")
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchResults([])
      setSearchError(error instanceof Error ? error.message : "検索に失敗しました")
    } finally {
      setIsSearching(false)
    }
  }

  // 検索候補を選択
  const handleSelectResult = async (prediction: GooglePlacePrediction) => {
    setIsSearching(true)
    setSearchError("")
    try {
      // Google Places API Place Detailsで場所の詳細情報を取得（APIルート経由）
      const placeDetails = await getPlaceDetails(prediction.place_id)
      
      if (!placeDetails) {
        setSearchError("場所の詳細情報を取得できませんでした")
        return
      }

      const lat = placeDetails.geometry.location.lat
      const lng = placeDetails.geometry.location.lng
      const address = placeDetails.formatted_address || prediction.description

      // 選択した結果の座標を直接使用して位置を確定
      if (updateLocationRef.current) {
        updateLocationRef.current(lng, lat)
      }

      // 地図を移動（アニメーション）
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: MAPBOX_CONFIG.DETAIL_ZOOM,
          duration: MAPBOX_CONFIG.FLY_TO_DURATION,
        })

        // flyTo完了後にマーカーを確実に中心に配置
        map.current.once('moveend', () => {
          if (map.current && markerRef.current) {
            const center = map.current.getCenter()
            markerRef.current.setLngLat([center.lng, center.lat])
          }
        })
      }

      setSelectedAddress(address)
      setSearchResults([]) // 候補リストを閉じる
      setSearchQuery("") // 検索欄をクリア
      setSearchError("") // エラーをクリア
    } catch (error) {
      console.error('Error getting place details:', error)
      const errorMessage = error instanceof Error ? error.message : "場所の詳細情報を取得できませんでした"
      setSearchError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  // GPSで現在地を取得
  const handleUseCurrentLocation = () => {
    if (!map.current) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // GPS座標を直接使用して位置を確定（flyTo前に確定）
          if (updateLocationRef.current) {
            updateLocationRef.current(longitude, latitude)
          }

        // 地図を移動（アニメーション）
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: MAPBOX_CONFIG.DETAIL_ZOOM,
          duration: MAPBOX_CONFIG.FLY_TO_DURATION,
        })

          // flyTo完了後にマーカーを確実に中心に配置
          map.current?.once('moveend', () => {
            if (map.current && markerRef.current) {
              const center = map.current.getCenter()
              markerRef.current.setLngLat([center.lng, center.lat])
            }
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  if (hasToken === null) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">地図を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Mapboxトークンが設定されていません</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 検索バー */}
      <LocationSearchBar
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query)
          setSearchError("")
          setSearchResults([])
        }}
        isSearching={isSearching}
        searchError={searchError}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
        onUseCurrentLocation={handleUseCurrentLocation}
      />

      {/* 地図 */}
      <MapContainer
        mapContainerRef={mapContainer}
        selectedAddress={selectedAddress}
        isDragging={isDragging}
      />

      <p className="text-xs text-muted-foreground">
        💡 地図をドラッグして、離した時に位置が確定されます
      </p>
    </div>
  )
}

