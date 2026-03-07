"use client"

import { useEffect, useState } from "react"
import type { Spot } from "@/types/spot"
import { SpotWindow } from "@/components/spot/spot-window"
import { MultipleRecordsList } from "@/components/spot/multiple-records-list"

interface SpotBottomSheetProps {
  spot: Spot | null
  nearbySpots: Spot[]
  isOpen: boolean
  onSelectSpot: (spot: Spot) => void
  onClose: () => void
}

export function SpotBottomSheet({
  spot,
  nearbySpots,
  isOpen,
  onSelectSpot,
  onClose,
}: SpotBottomSheetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    if (spot && isOpen) {
      setIsCollapsed(false)
      // 記録数が1件の場合は直接詳細表示、2件以上の場合はリスト表示
      setShowDetail(nearbySpots.length === 1)
    } else if (!isOpen) {
      setIsCollapsed(false)
      setShowDetail(false)
    }
  }, [spot, isOpen, nearbySpots.length])

  const handleToggleWindow = () => setIsCollapsed((prev) => !prev)

  const handleSelectSpot = (selectedSpot: Spot) => {
    onSelectSpot(selectedSpot)
    setShowDetail(true)
  }

  const handleBackToList = () => {
    setShowDetail(false)
  }

  if (!spot || !isOpen) return null

  // 記録数が2件以上で、詳細表示していない場合はリスト表示
  if (nearbySpots.length > 1 && !showDetail) {
    return <MultipleRecordsList spots={nearbySpots} onSelectSpot={handleSelectSpot} onClose={onClose} />
  }

  // 記録数が1件、または詳細表示の場合はSpotWindowを表示
  return (
    <SpotWindow
      spot={spot}
      isOpen={!isCollapsed}
      onToggle={handleToggleWindow}
      onClose={onClose}
      showBackButton={nearbySpots.length > 1}
      onBack={handleBackToList}
    />
  )
}
