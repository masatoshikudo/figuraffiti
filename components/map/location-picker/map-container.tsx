"use client"

import { MapPin } from "lucide-react"

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>
  selectedAddress?: string
  isDragging?: boolean
}

export function MapContainer({ mapContainerRef, selectedAddress, isDragging }: MapContainerProps) {
  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-lg border"
        style={{ minHeight: "256px" }}
      />
      {selectedAddress && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded text-xs shadow-lg">
          <MapPin className="h-3 w-3 inline mr-1" />
          {selectedAddress}
        </div>
      )}
      {isDragging && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-xs">
          地図を動かして位置を選んでね
        </div>
      )}
    </div>
  )
}

