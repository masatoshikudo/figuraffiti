import { type NextRequest, NextResponse } from "next/server"
import { supabase, checkSupabaseConfig } from "@/lib/supabase/supabase"
import { requireAdmin } from "@/lib/api/admin-utils"
import { parseApiError, logApiError } from "@/lib/api/api-utils"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // 信頼ユーザーの存在確認
    const { data: existingTrustedUser, error: fetchError } = await supabase!
      .from("trusted_users")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (fetchError || !existingTrustedUser) {
      return NextResponse.json({ error: "Trusted user not found" }, { status: 404 })
    }

    // 信頼ユーザーを削除
    const { error: deleteError } = await supabase!
      .from("trusted_users")
      .delete()
      .eq("user_id", userId)

    if (deleteError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint,
        }
      )
      logApiError("Error deleting trusted user", apiError)
      return NextResponse.json(
        {
          error: "Failed to delete trusted user",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Trusted user deleted successfully" })
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

