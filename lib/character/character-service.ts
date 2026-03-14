import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { CharacterDiscoveryEntry } from "@/types/character"
import type { Spot } from "@/types/spot"
import { dbToSpot } from "@/lib/spot/spot-converter"
import { buildCharacterFromSpot, createCharacterSlug } from "@/lib/character/character-utils"

type AppSupabaseClient = SupabaseClient<Database>

async function fetchSpotBySlug(
  supabase: AppSupabaseClient,
  slug: string
): Promise<Spot | null> {
  const leadingSpotNumber = slug.match(/^(\d+)-/)?.[1]

  if (leadingSpotNumber) {
    const { data } = await supabase
      .from("spots")
      .select("*")
      .eq("spot_number", Number.parseInt(leadingSpotNumber, 10))
      .eq("status", "approved")
      .single()

    if (data) {
      const spot = dbToSpot(data)
      if (createCharacterSlug(spot) === slug) {
        return spot
      }
    }
  }

  const { data: spots, error } = await supabase
    .from("spots")
    .select("*")
    .eq("status", "approved")

  if (error || !spots) {
    return null
  }

  const matched = spots
    .map((spot) => dbToSpot(spot))
    .find((spot) => createCharacterSlug(spot) === slug)

  return matched ?? null
}

async function fetchCharacterDiscoveries(
  supabase: AppSupabaseClient,
  spotId: string
): Promise<CharacterDiscoveryEntry[]> {
  const { data: logs } = await supabase
    .from("discovery_logs")
    .select("id, user_id, discovered_at")
    .eq("spot_id", spotId)
    .order("discovered_at", { ascending: false })
    .limit(20)

  if (!logs || logs.length === 0) {
    return []
  }

  const userIds = [...new Set(logs.map((log) => log.user_id))]
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name")
    .in("user_id", userIds)

  const profileMap = new Map((profiles || []).map((profile) => [profile.user_id, profile.display_name]))

  return logs.map((log) => ({
    id: log.id,
    discoveredAt: log.discovered_at,
    userName: profileMap.get(log.user_id) ?? "未設定",
  }))
}

export async function getCharacterBySlug(
  supabase: AppSupabaseClient,
  slug: string
) {
  const spot = await fetchSpotBySlug(supabase, slug)
  if (!spot) {
    return null
  }

  const discoveries = await fetchCharacterDiscoveries(supabase, spot.id)
  return buildCharacterFromSpot(spot, discoveries)
}
