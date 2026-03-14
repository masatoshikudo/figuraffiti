"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Spot } from "@/types/spot"
import { createCirclePolygon } from "@/lib/mapbox/cluster-range-utils"
import { getSpotCircleCenter, isSpotVisible } from "@/lib/spot/circle-display-utils"
import { getCircleColor } from "@/lib/spot/last-seen-utils"
import { MAPBOX_CONFIG, AHHHUM_CONFIG } from "@/lib/constants"
import { SPOT_STATUS } from "@/lib/constants"
import {
  initializeMapboxWorker,
  setMapboxToken,
  getMapboxMapOptions,
} from "@/lib/mapbox/mapbox-utils"
import { Button } from "@/components/ui/button"
import { Locate } from "lucide-react"

interface AhhHumMapViewProps {
  spots: Spot[]
  onSpotClick: (spot: Spot) => void
  selectedSpot?: Spot | null
  mapRef?: React.MutableRefObject<mapboxgl.Map | null>
}

const SOURCE_ID = "ahhhum-spots-circles"
const POINT_SOURCE_ID = "ahhhum-spots-points"
const FILL_LAYER_ID = "ahhhum-spots-fill"
const OUTLINE_LAYER_ID = "ahhhum-spots-outline"
const PIN_LAYER_ID = "ahhhum-spots-pin"

/**
 * AhhHum Phase1: 曖昧なサークル（直径300m）のみ表示するマップ
 */
export function AhhHumMapView({
  spots,
  onSpotClick,
  selectedSpot,
  mapRef,
}: AhhHumMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRefInternal = useRef<mapboxgl.Map | null>(null)
  const approvedSpotsRef = useRef<Spot[]>([])
  const onSpotClickRef = useRef(onSpotClick)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const approvedSpots = spots.filter(
    (s) => (!s.status || s.status === SPOT_STATUS.APPROVED) && isSpotVisible(s)
  )

  useEffect(() => {
    approvedSpotsRef.current = approvedSpots
  }, [approvedSpots])

  useEffect(() => {
    onSpotClickRef.current = onSpotClick
  }, [onSpotClick])

  // GeoJSON FeatureCollection を生成
  const getGeoJSONData = useCallback((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = approvedSpots.map(
      (spot) => {
        const center = getSpotCircleCenter(spot)
        const polygon = createCirclePolygon(
          center,
          AHHHUM_CONFIG.CIRCLE_RADIUS_M
        )
        const color = getCircleColor(spot.lastSeen)
        return {
          type: "Feature",
          geometry: polygon,
          properties: {
            spotId: spot.id,
            color,
          },
        }
      }
    )
    return { type: "FeatureCollection", features }
  }, [approvedSpots])

  const getPointGeoJSONData = useCallback((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = approvedSpots.map((spot) => {
      const center = getSpotCircleCenter(spot)
      const color = getCircleColor(spot.lastSeen)

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [center.lng, center.lat],
        },
        properties: {
          spotId: spot.id,
          color,
        },
      }
    })

    return { type: "FeatureCollection", features }
  }, [approvedSpots])

  useEffect(() => {
    if (typeof window === "undefined") return
    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__
    setHasToken(!!token)
    if (!token) {
      setMapError("NEXT_PUBLIC_MAPBOX_TOKEN is not set")
    }
  }, [])

  useEffect(() => {
    if (hasToken !== true || !mapContainerRef.current) return

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__
    if (!token) return

    if (mapRefInternal.current) return

    setMapboxToken(token)
    initializeMapboxWorker()

    try {
      const map = new mapboxgl.Map({
        ...getMapboxMapOptions(mapContainerRef.current),
      })

      if (mapRef) mapRef.current = map
      mapRefInternal.current = map

      map.on("load", () => {
        setMapError(null)

        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: getGeoJSONData(),
        })

        map.addSource(POINT_SOURCE_ID, {
          type: "geojson",
          data: getPointGeoJSONData(),
        })

        map.addLayer({
          id: FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          minzoom: AHHHUM_CONFIG.CIRCLE_SWITCH_ZOOM,
          paint: {
            "fill-antialias": false,
            "fill-color": ["get", "color"],
            "fill-opacity": 0.25,
          },
        })

        map.addLayer({
          id: OUTLINE_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          minzoom: AHHHUM_CONFIG.CIRCLE_SWITCH_ZOOM,
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
          },
        })

        map.addLayer({
          id: PIN_LAYER_ID,
          type: "circle",
          source: POINT_SOURCE_ID,
          maxzoom: AHHHUM_CONFIG.CIRCLE_SWITCH_ZOOM,
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": 7,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        })

        const getSpotFromEvent = (
          e: mapboxgl.MapLayerMouseEvent | mapboxgl.MapMouseEvent
        ) => {
          const feature = e.features?.[0]
          if (!feature?.properties?.spotId) return null

          return approvedSpotsRef.current.find(
            (s) => s.id === feature.properties!.spotId
          )
        }

        const handleCircleClick = (
          e: mapboxgl.MapLayerMouseEvent | mapboxgl.MapMouseEvent
        ) => {
          const spot = getSpotFromEvent(e)
          if (spot) onSpotClickRef.current(spot)
        }

        const handlePinClick = (
          e: mapboxgl.MapLayerMouseEvent | mapboxgl.MapMouseEvent
        ) => {
          const spot = getSpotFromEvent(e)
          if (!spot) return

          const center = getSpotCircleCenter(spot)
          map.flyTo({
            center: [center.lng, center.lat],
            zoom: Math.max(AHHHUM_CONFIG.PIN_CLICK_ZOOM, AHHHUM_CONFIG.CIRCLE_SWITCH_ZOOM),
            duration: 1000,
          })
        }

        map.on("click", FILL_LAYER_ID, handleCircleClick)
        map.on("click", OUTLINE_LAYER_ID, handleCircleClick)
        map.on("click", PIN_LAYER_ID, handlePinClick)

        ;[FILL_LAYER_ID, OUTLINE_LAYER_ID, PIN_LAYER_ID].forEach((layerId) => {
          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer"
          })
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = ""
          })
        })
      })

      map.on("error", (e) => {
        setMapError((e as any).error?.message || "Mapbox error")
      })
    } catch (err) {
      setMapError(err instanceof Error ? err.message : "Map initialization failed")
    }

    return () => {
      if (mapRefInternal.current) {
        mapRefInternal.current.remove()
        mapRefInternal.current = null
        if (mapRef) mapRef.current = null
      }
    }
  }, [hasToken])

  // スポットデータが変わったら GeoJSON を更新
  useEffect(() => {
    const map = mapRefInternal.current
    if (!map || !map.loaded()) return

    const polygonSource = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
    if (polygonSource) {
      polygonSource.setData(getGeoJSONData())
    }

    const pointSource = map.getSource(POINT_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
    if (pointSource) {
      pointSource.setData(getPointGeoJSONData())
    }
  }, [getGeoJSONData, getPointGeoJSONData])

  const handleLocate = useCallback(() => {
    const map = mapRefInternal.current
    if (!map) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 1000,
        })
      },
      () => {},
      { enableHighAccuracy: true }
    )
  }, [])

  if (!hasToken || mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        {mapError || "地図を読み込み中..."}
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* スポットがない場合の説明 */}
      {approvedSpots.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg text-center max-w-sm mx-4">
            <p className="font-medium text-foreground mb-1">スポットがありません</p>
            <p className="text-sm text-muted-foreground">
              承認済みのスポットが登録されると、ここにサークルが表示されます。
            </p>
          </div>
        </div>
      )}
      <div className="absolute top-20 right-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocate}
          className="rounded-full shadow-lg"
          aria-label="現在地へ"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
