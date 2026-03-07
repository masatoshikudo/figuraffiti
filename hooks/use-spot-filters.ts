import { useState, useEffect, useMemo } from "react"
import type { Spot, FilterOptions } from "@/types/spot"
import {
  searchSpots,
  filterSpots,
  getDecades,
  getUniqueSources,
  getUniqueValues,
  getUniqueTags,
} from "@/lib/spot/spot-utils"

interface UseSpotFiltersReturn {
  filteredSpots: Spot[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: FilterOptions
  setFilters: (filters: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void
  availableDecades: string[]
  availableSources: string[]
  availablePrefectures: string[]
  availableTags: string[]
}

/**
 * スポットの検索・フィルタリング機能を提供するカスタムフック
 */
export function useSpotFilters(allSpots: Spot[]): UseSpotFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    decades: [],
    sources: [],
    prefectures: [],
    tags: [],
  })

  // 検索とフィルタリングを適用したスポットリスト
  const filteredSpots = useMemo(() => {
    let result = searchSpots(allSpots, searchQuery)
    result = filterSpots(result, filters)
    return result
  }, [allSpots, searchQuery, filters])

  // フィルタオプションの候補を計算
  const availableDecades = useMemo(() => getDecades(allSpots), [allSpots])
  const availableSources = useMemo(() => getUniqueSources(allSpots), [allSpots])
  const availablePrefectures = useMemo(
    () => getUniqueValues(allSpots, "prefecture"),
    [allSpots]
  )
  const availableTags = useMemo(() => getUniqueTags(allSpots), [allSpots])

  return {
    filteredSpots,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    availableDecades,
    availableSources,
    availablePrefectures,
    availableTags,
  }
}

