import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { getUserProfile, upsertUserProfile } from "@/lib/api/user-profile-utils"
import { USER_SKILL_LEVELS } from "@/lib/constants"

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
      // プロフィールが存在しない場合はデフォルト値を返す
      return NextResponse.json({
        skillLevel: USER_SKILL_LEVELS.DEFAULT,
        levelSetBy: null,
        detectedSkaterName: null,
      })
    }

    return NextResponse.json({
      skillLevel: profile.skillLevel,
      levelSetBy: profile.levelSetBy,
      detectedSkaterName: profile.detectedSkaterName,
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
    const { skillLevel, levelSetBy, detectedSkaterName } = body

    // バリデーション
    if (typeof skillLevel !== "number" || skillLevel < USER_SKILL_LEVELS.MIN || skillLevel > USER_SKILL_LEVELS.MAX) {
      return NextResponse.json(
        { error: `Skill level must be between ${USER_SKILL_LEVELS.MIN} and ${USER_SKILL_LEVELS.MAX}` },
        { status: 400 }
      )
    }

    if (!levelSetBy || !["questionnaire", "auto_detected", "manual"].includes(levelSetBy)) {
      return NextResponse.json(
        { error: "levelSetBy must be one of: questionnaire, auto_detected, manual" },
        { status: 400 }
      )
    }

    const profile = await upsertUserProfile(user.id, skillLevel, levelSetBy, detectedSkaterName)

    if (!profile) {
      return NextResponse.json({ error: "プロフィールの作成/更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      skillLevel: profile.skillLevel,
      levelSetBy: profile.levelSetBy,
      detectedSkaterName: profile.detectedSkaterName,
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

