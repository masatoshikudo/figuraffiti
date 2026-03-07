import { type NextRequest, NextResponse } from "next/server"
import { supabase, checkSupabaseConfig } from "@/lib/supabase/supabase"
import { requireAdmin } from "@/lib/api/admin-utils"
import { parseApiError, logApiError } from "@/lib/api/api-utils"

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

    // 信頼ユーザー一覧を取得
    const { data: trustedUsers, error: trustedUsersError } = await supabase!
      .from("trusted_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (trustedUsersError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: trustedUsersError.message,
          code: trustedUsersError.code,
          hint: trustedUsersError.hint,
        }
      )
      logApiError("Error fetching trusted users", apiError)
      return NextResponse.json(
        {
          error: "Failed to fetch trusted users",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    // ユーザー情報を取得
    const usersWithInfo = await Promise.all(
      (trustedUsers || []).map(async (trustedUser) => {
        const { data: userData } = await supabase!.auth.admin.getUserById(trustedUser.user_id)
        return {
          ...trustedUser,
          email: userData?.user?.email || null,
        }
      })
    )

    return NextResponse.json(usersWithInfo)
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
    const { userId, note } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // ユーザーの存在確認
    const { data: userData, error: userError } = await supabase!.auth.admin.getUserById(userId)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 既に信頼ユーザーかどうかを確認
    const { data: existingTrustedUser } = await supabase!
      .from("trusted_users")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (existingTrustedUser) {
      return NextResponse.json({ error: "User is already a trusted user" }, { status: 400 })
    }

    // 信頼ユーザーを追加
    const { data: newTrustedUser, error: insertError } = await supabase!
      .from("trusted_users")
      .insert({
        user_id: userId,
        created_by: user.id,
        note: note || null,
      })
      .select()
      .single()

    if (insertError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: insertError.message,
          code: insertError.code,
          hint: insertError.hint,
        }
      )
      logApiError("Error adding trusted user", apiError)
      return NextResponse.json(
        {
          error: "Failed to add trusted user",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...newTrustedUser,
      email: userData.user.email,
    })
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

