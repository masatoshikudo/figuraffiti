"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { MapView } from "@/components/map/map-view"
import { SpotBottomSheet } from "@/components/spot/spot-bottom-sheet"
import { SubmitFormBottomSheet } from "@/components/form/submit-form-bottom-sheet"
import { SiteHeader } from "@/components/layout/site-header"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import type { Spot } from "@/types/spot"
import { useSpots } from "@/hooks/use-spots"
import { getNearbySpots } from "@/lib/spot/spot-utils"
import { createTempPin } from "@/lib/mapbox/mapbox-utils"
import { TIMING_CONFIG, SPOT_STATUS } from "@/lib/constants"
import mapboxgl from "mapbox-gl"

export default function MappingPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number } | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [pendingPinLocation, setPendingPinLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const tempPinMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const mapCenterRef = useRef<{ lng: number; lat: number; zoom: number } | null>(null)
  const { spots: allSpots } = useSpots()

  // 承認済みのスポットのみ表示（statusが未設定の場合は既存データとして承認済みとみなす）
  const approvedSpots = allSpots.filter((spot) => !spot.status || spot.status === SPOT_STATUS.APPROVED)

  // クラスタ内のスポットを保持する状態
  const [clusterSpots, setClusterSpots] = useState<Spot[] | null>(null)

  // 選択された記録に近い記録をすべて取得
  // クラスタから来た場合はクラスタ内のスポットを優先、そうでない場合は距離ベースで取得
  const nearbySpots = useMemo(() => {
    if (!selectedSpot) return []
    // クラスタ内のスポットが指定されている場合はそれを使用
    if (clusterSpots && clusterSpots.length > 0) {
      return clusterSpots
    }
    // そうでない場合は距離ベースで取得
    return getNearbySpots(approvedSpots, selectedSpot.lat, selectedSpot.lng)
  }, [selectedSpot, approvedSpots, clusterSpots])

  const handleSpotClick = useCallback((spot: Spot, clusterSpots?: Spot[]) => {
    setSelectedSpot(spot)
    // クラスタ内のスポットが指定されている場合は保存、そうでない場合はクリア
    setClusterSpots(clusterSpots || null)
    // 既存のスポットをクリックした場合は、仮ピンとフォームを閉じる
    setTempPin(null)
    setIsFormOpen(false)
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // 認証チェック
    if (!user) {
      // 未認証の場合は位置を保存して認証ダイアログを表示
      setPendingPinLocation({ lat, lng })
      setShowAuthDialog(true)
      return
    }

    // 認証済みの場合は仮ピンを設定してフォームを開く
    setTempPin({ lat, lng })
    setTimeout(() => setIsFormOpen(true), TIMING_CONFIG.FORM_OPEN_DELAY)
  }, [user])

  // 仮ピンの表示・削除
  useEffect(() => {
    // 既存の仮ピンを削除
    if (tempPinMarkerRef.current) {
      tempPinMarkerRef.current.remove()
      tempPinMarkerRef.current = null
    }

    // tempPinが設定され、mapRefが利用可能な場合のみ仮ピンを作成
    if (tempPin && mapRef.current) {
      tempPinMarkerRef.current = createTempPin(
        tempPin.lng,
        tempPin.lat,
        mapRef.current,
        () => setIsFormOpen(true)
      )
    }

    return () => {
      if (tempPinMarkerRef.current) {
        tempPinMarkerRef.current.remove()
        tempPinMarkerRef.current = null
      }
    }
  }, [tempPin])

  const handleFormClose = () => {
    setIsFormOpen(false)
    // フォームを閉じる時に仮ピンも削除
    setTempPin(null)
  }

  const handleFormSuccess = () => {
    // 記録が送信されたら、仮ピンを削除
    setTempPin(null)
    setIsFormOpen(false)
  }

  // 認証成功後に仮ピンを設定してフォームを開く
  useEffect(() => {
    if (user && pendingPinLocation) {
      setTempPin(pendingPinLocation)
      setPendingPinLocation(null)
      setTimeout(() => setIsFormOpen(true), TIMING_CONFIG.FORM_OPEN_DELAY)
    }
  }, [user, pendingPinLocation])

  // 認証ダイアログが閉じられた時の処理
  const handleAuthDialogClose = (open: boolean) => {
    setShowAuthDialog(open)
    if (!open && !user) {
      // 認証ダイアログが閉じられて、まだログインしていない場合は保留中の位置をクリア
      setPendingPinLocation(null)
    }
  }

  return (
    <div className="relative h-screen">
      {/* Map - Full Screen (headerより背面に敷く) */}
      <main className="absolute inset-0">
        <MapView
          spots={approvedSpots}
          onSpotClick={handleSpotClick}
          selectedSpot={selectedSpot}
          onMapClick={handleMapClick}
          mapRef={mapRef}
          preserveMapPosition={isFormOpen} // フォームが開いている間は地図位置を保持
          tempPinLocation={tempPin} // 仮ピンの位置を渡す
        />
      </main>

      {/* Header Overlay */}
      <SiteHeader variant="overlay" />

      <AuthDialog open={showAuthDialog} onOpenChange={handleAuthDialogClose} />

      {/* Bottom Sheet - 記録カード */}
      <SpotBottomSheet
        spot={selectedSpot}
        nearbySpots={nearbySpots}
        isOpen={!!selectedSpot && !isFormOpen}
        onSelectSpot={setSelectedSpot}
        onClose={() => setSelectedSpot(null)}
      />

      {/* Bottom Sheet - 記録フォーム */}
      <SubmitFormBottomSheet
        isOpen={isFormOpen}
        lat={tempPin?.lat || null}
        lng={tempPin?.lng || null}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
