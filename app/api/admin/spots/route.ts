import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/admin-utils"
import { createClient } from "@/lib/supabase/supabase-server"
import { dbToSpot } from "@/lib/spot/spot-converter"

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await requireAdmin()
    if (error || !user) {
      return NextResponse.json(
        { error: error || "管理者権限が必要です" },
        { status: error === "認証が必要です" ? 401 : 403 }
      )
    }

    const supabase = await createClient()
    const { data: spots, error: spotsError } = await supabase
      .from("spots")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100)

    if (spotsError) {
      return NextResponse.json(
        { error: "管理用スポット一覧の取得に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json((spots || []).map((spot) => dbToSpot(spot)))
  } catch (error) {
    console.error("[GET /api/admin/spots] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
