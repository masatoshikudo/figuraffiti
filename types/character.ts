export interface CharacterDiscoveryEntry {
  id: string
  discoveredAt: string
  userName: string
}

export interface Character {
  slug: string
  name: string
  spotId: string
  spotNumber?: number | null
  locationName: string
  context?: string | null
  coverUrl?: string | null
  lastSeen?: string | null
  discoveries: CharacterDiscoveryEntry[]
}
