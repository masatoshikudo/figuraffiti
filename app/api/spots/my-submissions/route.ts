import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { dbToSpot } from "@/lib/spot/spot-converter"

export async function GET(request: NextRequest) {
  try {
    // 環境変数のチェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[GET /api/spots/my-submissions] Missing environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "Supabase environment variables are not configured",
        },
        { status: 500 }
      )
    }

    // 認証チェックとSupabaseクライアントの作成
    let supabaseServer
    try {
      supabaseServer = await createClient()
    } catch (clientError) {
      console.error("[GET /api/spots/my-submissions] Failed to create Supabase client:", clientError)
      return NextResponse.json(
        {
          error: "Failed to initialize database connection",
          message: clientError instanceof Error ? clientError.message : "Unknown error",
        },
        { status: 500 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    console.log("[GET /api/spots/my-submissions] Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    })

    if (authError || !user) {
      console.error("[GET /api/spots/my-submissions] Auth failed:", {
        authError: authError?.message,
        authErrorCode: authError?.status,
        hasUser: !!user,
      })
      return NextResponse.json(
        { 
          error: "認証が必要です",
          details: authError?.message || "User not authenticated",
          code: authError?.status || 401,
        },
        { status: 401 }
      )
    }

    // 自分の投稿を取得（全ステータス）
    // サーバー側のクライアントを使用してRLSポリシーを適用
    console.log(`[GET /api/spots/my-submissions] Fetching submissions for user: ${user.id}`)
    
    // RLSポリシーが正しく適用されるように、認証済みコンテキストでクエリを実行
    // submitted_byがNULLの場合は除外されるが、これは意図通り
    const { data: spots, error: spotsError } = await supabaseServer
      .from("spots")
      .select("*")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })

    console.log("[GET /api/spots/my-submissions] Query result:", {
      spotsCount: spots?.length || 0,
      hasError: !!spotsError,
      errorMessage: spotsError?.message,
      errorCode: spotsError?.code,
      errorHint: spotsError?.hint,
    })

    if (spotsError) {
      console.error("[GET /api/spots/my-submissions] Supabase error:", {
        message: spotsError.message,
        code: spotsError.code,
        hint: spotsError.hint,
        details: spotsError.details,
        userId: user.id,
      })
      
      // RLSポリシーエラーの可能性がある場合の詳細なエラーメッセージ
      const errorMessage = spotsError.code === "PGRST301" || spotsError.message?.includes("RLS")
        ? `RLSポリシーエラー: ${spotsError.message}. マイグレーションが正しく実行されているか確認してください。`
        : spotsError.message

      return NextResponse.json(
        {
          error: "Failed to fetch submissions",
          message: errorMessage,
          code: spotsError.code,
          hint: spotsError.hint,
          details: process.env.NODE_ENV === "development" ? spotsError.details : undefined,
        },
        { status: 500 }
      )
    }

    console.log(`[GET /api/spots/my-submissions] Found ${spots?.length || 0} spots`)

    // 各スポットのメディアを取得
    const spotsWithMedia = await Promise.all(
      (spots || []).map(async (spot) => {
        const { data: media } = await supabaseServer
          .from("spot_media")
          .select("*")
          .eq("spot_id", spot.id)
          .order("created_at", { ascending: true })

        return dbToSpot(spot, media || [])
      })
    )

    return NextResponse.json(spotsWithMedia)
  } catch (error) {
    console.error("[GET /api/spots/my-submissions] Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}

