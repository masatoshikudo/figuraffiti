import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { ERROR_MESSAGES } from "@/lib/constants"

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
    const spotId = typeof body.spotId === "string" ? body.spotId.trim() : ""

    if (!spotId) {
      return NextResponse.json(
        { error: "spotId が必要です" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .rpc("start_exploration_session", { p_spot_id: spotId })
      .single()

    if (error) {
      console.error("[POST /api/explorations] RPC error:", error)

      if (error.message.includes("SPOT_NOT_FOUND")) {
        return NextResponse.json(
          { error: "該当するスポットが見つかりません" },
          { status: 404 }
        )
      }

      if (error.message.includes("AUTH_REQUIRED")) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.AUTH_REQUIRED },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: "探索宣言の開始に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: data?.success ?? true,
      message: data?.message ?? "探索を開始しました",
      explorationId: data?.exploration_id ?? null,
      expiresAt: data?.expires_at ?? null,
    })
  } catch (error) {
    console.error("[POST /api/explorations] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
