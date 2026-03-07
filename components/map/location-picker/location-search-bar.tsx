"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Locate, MapPin, Loader2 } from "lucide-react"
import type { GooglePlacePrediction } from "@/lib/google-places"

interface LocationSearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean
  searchError: string
  searchResults: GooglePlacePrediction[]
  onSearch: () => void
  onSelectResult: (prediction: GooglePlacePrediction) => void
  onUseCurrentLocation: () => void
}

export function LocationSearchBar({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchError,
  searchResults,
  onSearch,
  onSelectResult,
  onUseCurrentLocation,
}: LocationSearchBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="住所や建物名で検索"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.stopPropagation()
              if (searchQuery.trim() && !isSearching) {
                onSearch()
              }
            }
          }}
          disabled={isSearching}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (searchQuery.trim() && !isSearching) {
              onSearch()
            }
          }}
          disabled={isSearching || !searchQuery.trim()}
          size="icon"
          title={isSearching ? "検索中..." : "検索"}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔍"}
        </Button>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onUseCurrentLocation()
          }}
          variant="outline"
          size="icon"
          title="現在地を使う"
          disabled={isSearching}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>
      {searchError && <p className="text-xs text-destructive">{searchError}</p>}
      {/* 検索候補リスト */}
      {searchResults.length > 0 && (
        <div className="border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
          {searchResults.map((prediction, index) => (
            <button
              key={prediction.place_id || index}
              type="button"
              onClick={() => onSelectResult(prediction)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  {prediction.structured_formatting.secondary_text && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

