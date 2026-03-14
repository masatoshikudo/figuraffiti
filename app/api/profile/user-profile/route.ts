import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { getUserProfile, upsertUserProfile } from "@/lib/api/user-profile-utils"

/**
 * GET: ユーザープロフィールを取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)

    if (!profile) {
      return NextResponse.json({
        displayName: null,
      })
    }

    return NextResponse.json({
      displayName: profile.displayName,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? errorMessage : "Internal server error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST: ユーザープロフィールを作成または更新
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await request.json()
    const rawDisplayName = body.displayName
    if (typeof rawDisplayName !== "string") {
      return NextResponse.json(
        { error: "displayName must be a string" },
        { status: 400 }
      )
    }

    const displayName = rawDisplayName.trim().slice(0, 40)

    if (!displayName) {
      return NextResponse.json(
        { error: "アカウント名は必須です" },
        { status: 400 }
      )
    }

    const profile = await upsertUserProfile(user.id, displayName)

    if (!profile) {
      return NextResponse.json({ error: "プロフィールの作成/更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      displayName: profile.displayName,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? errorMessage : "Internal server error",
      },
      { status: 500 }
    )
  }
}

