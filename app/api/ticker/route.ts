import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import type { TickerItem } from "@/types/spot"
import { ERROR_MESSAGES } from "@/lib/constants"

const PREFECTURE_ENGLISH_LABELS: Record<string, string> = {
  北海道: "HOKKAIDO",
  青森県: "AOMORI",
  岩手県: "IWATE",
  宮城県: "MIYAGI",
  秋田県: "AKITA",
  山形県: "YAMAGATA",
  福島県: "FUKUSHIMA",
  茨城県: "IBARAKI",
  栃木県: "TOCHIGI",
  群馬県: "GUNMA",
  埼玉県: "SAITAMA",
  千葉県: "CHIBA",
  東京都: "TOKYO",
  神奈川県: "KANAGAWA",
  新潟県: "NIIGATA",
  富山県: "TOYAMA",
  石川県: "ISHIKAWA",
  福井県: "FUKUI",
  山梨県: "YAMANASHI",
  長野県: "NAGANO",
  岐阜県: "GIFU",
  静岡県: "SHIZUOKA",
  愛知県: "AICHI",
  三重県: "MIE",
  滋賀県: "SHIGA",
  京都府: "KYOTO",
  大阪府: "OSAKA",
  兵庫県: "HYOGO",
  奈良県: "NARA",
  和歌山県: "WAKAYAMA",
  鳥取県: "TOTTORI",
  島根県: "SHIMANE",
  岡山県: "OKAYAMA",
  広島県: "HIROSHIMA",
  山口県: "YAMAGUCHI",
  徳島県: "TOKUSHIMA",
  香川県: "KAGAWA",
  愛媛県: "EHIME",
  高知県: "KOCHI",
  福岡県: "FUKUOKA",
  佐賀県: "SAGA",
  長崎県: "NAGASAKI",
  熊本県: "KUMAMOTO",
  大分県: "OITA",
  宮崎県: "MIYAZAKI",
  鹿児島県: "KAGOSHIMA",
  沖縄県: "OKINAWA",
}

function getAreaLabel(locationName?: string | null) {
  const normalized = locationName?.trim()

  if (!normalized) return "UNKNOWN"

  return PREFECTURE_ENGLISH_LABELS[normalized] ?? normalized.replace(/(都|道|府|県)$/u, "").toUpperCase()
}

function getSpotReleaseAt(spot: {
  visible_after?: string | null
  approved_at?: string | null
  created_at?: string | null
}) {
  return spot.visible_after || spot.approved_at || spot.created_at || null
}

function isMissingExplorationSchemaError(message?: string) {
  return (
    message?.includes("public.exploration_sessions") ||
    message?.includes("start_exploration_session")
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100)

    const [
      { data: discoveries, error: discoveryError },
      { data: spots, error: spotsError },
      { data: explorations, error: explorationsError },
    ] = await Promise.all([
      supabase
        .from("discovery_logs")
        .select("id, spot_id, discovered_at")
        .order("discovered_at", { ascending: false })
        .limit(limit),
      supabase
        .from("spots")
        .select("id, prefecture, approved_at, visible_after, created_at")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .limit(limit),
      supabase
        .from("exploration_sessions")
        .select("id, spot_id, started_at")
        .order("started_at", { ascending: false })
        .limit(limit),
    ])

    if (discoveryError || spotsError) {
      console.error("[GET /api/ticker] Query error:", {
        discoveryError,
        spotsError,
      })
      return NextResponse.json(
        { error: "ティッカーの取得に失敗しました" },
        { status: 500 }
      )
    }

    const safeExplorations =
      explorationsError && isMissingExplorationSchemaError(explorationsError.message)
        ? []
        : explorations

    if (explorationsError && !isMissingExplorationSchemaError(explorationsError.message)) {
      console.error("[GET /api/ticker] Exploration query error:", explorationsError)
      return NextResponse.json(
        { error: "ティッカーの取得に失敗しました" },
        { status: 500 }
      )
    }

    const spotIds = new Set<string>()
    for (const item of discoveries || []) spotIds.add(item.spot_id)
    for (const item of safeExplorations || []) spotIds.add(item.spot_id)

    const { data: relatedSpots, error: relatedSpotsError } = spotIds.size
      ? await supabase
          .from("spots")
          .select("id, prefecture")
          .in("id", Array.from(spotIds))
      : { data: [], error: null }

    if (relatedSpotsError) {
      console.error("[GET /api/ticker] Related spots error:", relatedSpotsError)
      return NextResponse.json(
        { error: "ティッカーの取得に失敗しました" },
        { status: 500 }
      )
    }

    const spotMap = new Map((relatedSpots || []).map((spot) => [spot.id, spot]))
    const now = Date.now()

    const discoveryItems: TickerItem[] = (discoveries || []).map((item) => {
      const locationName = getAreaLabel(spotMap.get(item.spot_id)?.prefecture)
      return {
        id: `discovery:${item.id}`,
        type: "discovery",
        createdAt: item.discovered_at,
        locationName,
        message: `✨ ${locationName} でAhhHum【発見】！✨`,
      }
    })

    const spotReleaseItems: TickerItem[] = (spots || [])
      .map((spot) => {
        const releaseAt = getSpotReleaseAt(spot)
        if (!releaseAt || new Date(releaseAt).getTime() > now) {
          return null
        }

        const locationName = getAreaLabel(spot.prefecture)
        return {
          id: `spot_release:${spot.id}:${releaseAt}`,
          type: "spot_release" as const,
          createdAt: releaseAt,
          locationName,
          message: `📍 ${locationName} にAhhHumが【出現】！🐻`,
        }
      })
      .filter((item): item is TickerItem => item !== null)

    const explorationItems: TickerItem[] = (safeExplorations || []).map((item) => {
      const locationName = getAreaLabel(spotMap.get(item.spot_id)?.prefecture)
      return {
        id: `exploration:${item.id}`,
        type: "exploration",
        createdAt: item.started_at,
        locationName,
        message: `👀 ${locationName} で【探索】開始！👀`,
      }
    })

    const items = [...discoveryItems, ...spotReleaseItems, ...explorationItems]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)

    return NextResponse.json(items)
  } catch (error) {
    console.error("[GET /api/ticker] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
