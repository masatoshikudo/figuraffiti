import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import type { DiscoveryLog } from "@/types/spot"
import { ERROR_MESSAGES } from "@/lib/constants"

/**
 * GET /api/discoveries
 * 発見ログを取得（ティッカー表示用）
 * limit: 取得件数（デフォルト: 50）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100)

    const { data: logs, error } = await supabase
      .from("discovery_logs")
      .select("id, spot_id, user_id, discovered_at")
      .order("discovered_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[GET /api/discoveries] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json([])
    }

    const spotIds = [...new Set(logs.map((l) => l.spot_id))]
    const userIds = [...new Set(logs.map((l) => l.user_id))]

    const { data: spots } = await supabase
      .from("spots")
      .select("id, spot_number, prefecture")
      .in("id", spotIds)

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, display_name")
      .in("user_id", userIds)

    const spotMap = new Map(
      (spots || []).map((s) => [s.id, s])
    )
    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p.display_name])
    )

    const result: DiscoveryLog[] = logs.map((log) => {
      const spot = spotMap.get(log.spot_id)
      const displayName = profileMap.get(log.user_id) ?? undefined
      const locationName = spot?.prefecture || "Unknown"

      return {
        id: log.id,
        spotId: log.spot_id,
        userId: log.user_id,
        discoveredAt: log.discovered_at,
        userName: displayName,
        spotNumber: spot?.spot_number ?? undefined,
        locationName,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/discoveries] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

/**
 * POST /api/discoveries
 * MVPでは無効。発見記録は NFC トークン経由のみ。
 */
export async function POST(_request: NextRequest) {
  try {
    return NextResponse.json({
      error: "発見記録はNFCタグの読み取りからのみ実行できます",
    }, { status: 410 })
  } catch (error) {
    console.error("[POST /api/discoveries] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
