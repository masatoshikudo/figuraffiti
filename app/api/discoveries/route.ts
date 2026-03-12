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
      const displayName =
        profileMap.get(log.user_id) || `Explorer_${log.user_id.slice(-6)}`
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
 * 発見を記録（NFC/QR読み取り後のタギング）
 * Body: { spotId: string } または { spotNumber: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 }
      )
    }

    const body = await request.json()
    const spotId = body.spotId as string | undefined
    const spotNumber = body.spotNumber as number | undefined

    if (!spotId && spotNumber === undefined) {
      return NextResponse.json(
        { error: "spotId または spotNumber が必要です" },
        { status: 400 }
      )
    }

    let resolvedSpotId: string
    if (spotId) {
      resolvedSpotId = spotId
    } else {
      // spotNumber からスポットを検索
      const { data: spot, error: spotError } = await supabase
        .from("spots")
        .select("id")
        .eq("spot_number", spotNumber)
        .eq("status", "approved")
        .single()

      if (spotError || !spot) {
        return NextResponse.json(
          { error: "該当するスポットが見つかりません" },
          { status: 404 }
        )
      }
      resolvedSpotId = spot.id
    }

    // スポットの存在確認
    const { data: spot, error: spotError } = await supabase
      .from("spots")
      .select("id, status")
      .eq("id", resolvedSpotId)
      .single()

    if (spotError || !spot || spot.status !== "approved") {
      return NextResponse.json(
        { error: "該当するスポットが見つかりません" },
        { status: 404 }
      )
    }

    // discovery_logs 追加 + last_seen 更新を DB 関数で一括実行
    // SECURITY DEFINER により、必要最小限の権限で RLS を越えて更新する
    const { data: result, error: rpcError } = await supabase
      .rpc("record_discovery", { p_spot_id: resolvedSpotId })
      .single()

    if (rpcError) {
      console.error("[POST /api/discoveries] RPC error:", rpcError)

      if (rpcError.message.includes("AUTH_REQUIRED")) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.AUTH_REQUIRED },
          { status: 401 }
        )
      }

      if (rpcError.message.includes("SPOT_NOT_FOUND")) {
        return NextResponse.json(
          { error: "該当するスポットが見つかりません" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "発見記録の更新に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: result?.success ?? true,
      duplicate: result?.duplicate ?? false,
      spotId: resolvedSpotId,
      message: result?.message ?? "発見を記録しました",
    })
  } catch (error) {
    console.error("[POST /api/discoveries] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
