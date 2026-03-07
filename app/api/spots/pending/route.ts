import { type NextRequest, NextResponse } from "next/server"
import { supabase, checkSupabaseConfig } from "@/lib/supabase/supabase"
import { requireAdmin } from "@/lib/api/admin-utils"
import { dbToSpot } from "@/lib/spot/spot-converter"
import { parseApiError, logApiError } from "@/lib/api/api-utils"
import { SPOT_STATUS } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const { user, error: authError } = await requireAdmin()
    if (!user || authError) {
      return NextResponse.json({ error: authError || "管理者権限が必要です" }, { status: 403 })
    }

    // Supabase設定のチェック
    if (!supabase) {
      checkSupabaseConfig()
    }

    // 承認待ちのスポットを取得
    const { data: spots, error: spotsError } = await supabase!
      .from("spots")
      .select("*")
      .eq("status", SPOT_STATUS.PENDING)
      .order("created_at", { ascending: false })

    if (spotsError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: spotsError.message,
          code: spotsError.code,
          hint: spotsError.hint,
        }
      )
      logApiError("Error fetching pending spots", apiError)
      return NextResponse.json(
        {
          error: "Failed to fetch pending spots",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: spotsError.hint,
        },
        { status: 500 }
      )
    }

    // 各スポットのメディアを取得
    const spotsWithMedia = await Promise.all(
      (spots || []).map(async (spot) => {
        const { data: media } = await supabase!
          .from("spot_media")
          .select("*")
          .eq("spot_id", spot.id)
          .order("created_at", { ascending: true })

        return dbToSpot(spot, media || [])
      })
    )

    return NextResponse.json(spotsWithMedia)
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

