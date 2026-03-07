import type { Spot } from "@/types/spot"

/**
 * 過去の投稿からユニークなスケーター名のリストを取得
 */
export function getSkaterSuggestions(spots: Spot[]): string[] {
  const skaters = new Set<string>()
  
  spots.forEach((spot) => {
    if (spot.skater && spot.skater.trim()) {
      skaters.add(spot.skater.trim())
    }
  })
  
  return Array.from(skaters).sort()
}

/**
 * 過去の投稿からユニークな技名のリストを取得
 */
export function getTrickSuggestions(spots: Spot[]): string[] {
  const tricks = new Set<string>()
  
  spots.forEach((spot) => {
    if (spot.trick && spot.trick.trim()) {
      tricks.add(spot.trick.trim())
    }
  })
  
  return Array.from(tricks).sort()
}

/**
 * 過去の投稿からユニークなスポット名のリストを取得
 */
export function getSpotNameSuggestions(spots: Spot[]): string[] {
  const spotNames = new Set<string>()
  
  spots.forEach((spot) => {
    if (spot.spotName && spot.spotName.trim()) {
      spotNames.add(spot.spotName.trim())
    }
  })
  
  return Array.from(spotNames).sort()
}

/**
 * 入力値に基づいて候補をフィルタリング
 */
export function filterSuggestions(suggestions: string[], query: string, maxResults: number = 10): string[] {
  if (!query.trim()) {
    return suggestions.slice(0, maxResults)
  }
  
  const lowerQuery = query.toLowerCase()
  const filtered = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(lowerQuery)
  )
  
  return filtered.slice(0, maxResults)
}

