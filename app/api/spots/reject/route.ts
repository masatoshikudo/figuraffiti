import { type NextRequest, NextResponse } from "next/server"
import { supabase, checkSupabaseConfig } from "@/lib/supabase/supabase"
import { requireAdmin } from "@/lib/api/admin-utils"
import { dbToSpot } from "@/lib/spot/spot-converter"
import { parseApiError, logApiError } from "@/lib/api/api-utils"
import { SPOT_STATUS } from "@/lib/constants"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { spotId, rejectionReason } = body

    if (!spotId) {
      return NextResponse.json({ error: "spotId is required" }, { status: 400 })
    }

    if (!rejectionReason || rejectionReason.trim() === "") {
      return NextResponse.json({ error: "rejectionReason is required" }, { status: 400 })
    }

    // スポットの存在確認
    const { data: spot, error: fetchError } = await supabase!
      .from("spots")
      .select("*")
      .eq("id", spotId)
      .single()

    if (fetchError || !spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 })
    }

    // 既に却下済みの場合はエラー
    if ((spot as any).status === SPOT_STATUS.REJECTED) {
      return NextResponse.json({ error: "Spot is already rejected" }, { status: 400 })
    }

    // スポットを却下
    const { data: updatedSpot, error: updateError } = await supabase!
      .from("spots")
      .update({
        status: SPOT_STATUS.REJECTED,
        rejection_reason: rejectionReason.trim(),
      })
      .eq("id", spotId)
      .select()
      .single()

    if (updateError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
        }
      )
      logApiError("Error rejecting spot", apiError)
      return NextResponse.json(
        {
          error: "Failed to reject spot",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    const spotWithMedia = dbToSpot(updatedSpot)

    // メール通知を送信（認証済みユーザーの場合）
    if ((spot as any).submitted_by) {
      try {
        // Supabase Edge Functionを呼び出してメール通知を送信
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseAnonKey) {
          const functionUrl = `${supabaseUrl}/functions/v1/send-rejection-notification`
          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              spotId: spotId,
              spotName: spotWithMedia.spotName,
              userId: (spot as any).submitted_by,
              rejectionReason: rejectionReason.trim(),
              type: "rejected",
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("Failed to send rejection notification:", errorData)
            // 通知エラーは致命的ではないので、続行
          }
        }
      } catch (error) {
        console.error("Error calling notification function:", error)
        // 通知エラーは致命的ではないので、続行
      }
    }

    return NextResponse.json(spotWithMedia)
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

