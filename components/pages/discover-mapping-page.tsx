"use client"

import { useState, useCallback, useRef } from "react"
import { AhhHumMapView } from "@/components/map/ahhhum-map-view"
import { DiscoveryTicker } from "@/components/discovery/discovery-ticker"
import { AhhHumSpotDetail } from "@/components/spot/ahhhum-spot-detail"
import { SiteHeader } from "@/components/layout/site-header"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useSpots } from "@/hooks/use-spots"
import { useDiscoveries } from "@/hooks/use-discoveries"
import type { Spot } from "@/types/spot"
import { SPOT_STATUS } from "@/lib/constants"
import mapboxgl from "mapbox-gl"

export function DiscoverMappingPage() {
  const { user } = useAuth()
  const { spots: allSpots } = useSpots()
  const { discoveries, isLoading: discoveriesLoading } = useDiscoveries()

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const approvedSpots = allSpots.filter(
    (s) => !s.status || s.status === SPOT_STATUS.APPROVED
  )

  const handleSpotClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot)
    if (!user) {
      setShowAuthDialog(true)
    }
  }, [user])

  const handleRecordDiscovery = useCallback(() => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    if (!selectedSpot) return

    const spotNumber = selectedSpot.spotNumber
    const spotId = selectedSpot.id
    const params = new URLSearchParams()

    if (spotNumber != null) {
      params.set("spotNumber", String(spotNumber))
    } else {
      params.set("spotId", spotId)
    }

    window.location.href = `/discover/nfc?${params.toString()}`
  }, [user, selectedSpot])

  const handleCloseSpotDetail = useCallback(() => {
    setSelectedSpot(null)
  }, [])

  return (
    <div className="relative h-screen flex flex-col">
      <main className="absolute inset-0">
        <AhhHumMapView
          spots={approvedSpots}
          onSpotClick={handleSpotClick}
          selectedSpot={selectedSpot}
          mapRef={mapRef}
        />
      </main>

      <SiteHeader variant="overlay" />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        gateMessage="発見を記録するにはログインが必要です。"
      />

      {selectedSpot && (
        <div className="absolute bottom-9 left-0 right-0 z-40 pointer-events-none">
          <div className="pointer-events-auto max-h-[50vh] overflow-y-auto">
            <AhhHumSpotDetail
              spot={selectedSpot}
              onRecordDiscovery={handleRecordDiscovery}
              onClose={handleCloseSpotDetail}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]">
        <DiscoveryTicker
          discoveries={discoveries}
          isLoading={discoveriesLoading}
        />
      </div>
    </div>
  )
}
