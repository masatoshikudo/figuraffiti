"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { MAPBOX_CONFIG } from "@/lib/constants"
import {
  initializeMapboxWorker,
  setMapboxToken,
  getMapboxMapOptions,
  formatMapboxError,
} from "@/lib/mapbox/mapbox-utils"
import type { MapboxError } from "@/types/database"

interface SpotMiniMapProps {
  lat: number
  lng: number
  spotName: string
  spotId: string
}

export function SpotMiniMap({ lat, lng, spotName, spotId }: SpotMiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  // トークンのチェック
  useEffect(() => {
    if (typeof window === "undefined") return

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__

    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set")
      setHasToken(false)
      return
    }

    setHasToken(true)
  }, [])

  // 地図の初期化
  useEffect(() => {
    if (hasToken !== true || !mapContainer.current || map.current) return

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      (window as { __NEXT_PUBLIC_MAPBOX_TOKEN__?: string }).__NEXT_PUBLIC_MAPBOX_TOKEN__

    if (!token) return

    try {
      setMapboxToken(token)
      initializeMapboxWorker()

      map.current = new mapboxgl.Map({
        ...getMapboxMapOptions(mapContainer.current, [lng, lat], MAPBOX_CONFIG.DETAIL_ZOOM),
        interactive: true,
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        dragPan: true,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: true,
      })

      map.current.on("load", () => {
        setMapError(null)
        map.current?.resize()

        // マーカーを追加
        if (map.current) {
          const el = document.createElement("div")
          el.className = "spot-mini-map-marker"
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

          markerRef.current = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current)
        }
      })

      map.current.on("error", (e) => {
        const errorMessage = formatMapboxError(e as MapboxError, token)
        setMapError(errorMessage)
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "地図の初期化に失敗しました"
      setMapError(errorMessage)
      console.error("Mapbox initialization error:", error)
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [hasToken, lat, lng, spotName])

  if (hasToken === false) {
    return (
      <div className="border rounded-2xl overflow-hidden h-64 bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">地図を表示できません</p>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="border rounded-2xl overflow-hidden h-64 bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="relative border rounded-2xl overflow-hidden h-64">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="bg-background/90 backdrop-blur-sm shadow-md"
          asChild
        >
          <Link href="/mapping">
            <MapPin className="h-4 w-4 mr-2" />
            マップで見る
            <ExternalLink className="h-3 w-3 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

