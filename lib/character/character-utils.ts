import type { Spot, DiscoveryLog } from "@/types/spot"
import type { Character, CharacterDiscoveryEntry } from "@/types/character"

export function createCharacterSlug(spot: Pick<Spot, "id" | "spotNumber" | "spotName">): string {
  const normalizedName = spot.spotName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

  const base = normalizedName || `spot-${spot.id.slice(0, 6).toLowerCase()}`
  return spot.spotNumber != null ? `${spot.spotNumber}-${base}` : base
}

export function buildCharacterFromSpot(
  spot: Spot,
  discoveries: CharacterDiscoveryEntry[] = []
): Character {
  return {
    slug: createCharacterSlug(spot),
    name: spot.spotName || `Spot #${spot.spotNumber ?? spot.id.slice(0, 6)}`,
    spotId: spot.id,
    spotNumber: spot.spotNumber,
    locationName: [spot.prefecture, spot.spotName].filter(Boolean).join(" / ") || "Unknown",
    context: spot.context,
    coverUrl: spot.media[0]?.url ?? null,
    lastSeen: spot.lastSeen ?? null,
    discoveries,
  }
}

export function buildCharacterDiscoveries(logs: DiscoveryLog[]): CharacterDiscoveryEntry[] {
  return logs.map((log) => ({
    id: log.id,
    discoveredAt: log.discoveredAt,
    userName: log.userName || `Explorer_${log.userId.slice(-6)}`,
  }))
}
