import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import type { Spot } from "@/types/spot"
import { dbToSpot, spotToDb, mediaToDb } from "@/lib/spot/spot-converter"
import { parseApiError, logApiError } from "@/lib/api/api-utils"
import { SPOT_MERGE_CONFIG, SPOT_STATUS, ERROR_MESSAGES } from "@/lib/constants"
import { calculateDistance } from "@/lib/spot/spot-utils"
import { isTrustedUser } from "@/lib/api/admin-utils"

/**
 * 認証チェック: ユーザーがログインしているか確認
 * 未認証の場合は401エラーを返す
 */
async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: "認証が必要です" }
  }

  return { user, error: null }
}

export async function GET(request: NextRequest) {
  try {
    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient()

    // 認証情報を取得（ログ出力用）
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[GET /api/spots] Auth status:", {
      hasUser: !!user,
      userId: user?.id || null,
      authError: authError?.message || null,
    })

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (id) {
      // 特定のスポットを取得
      const { data: spot, error: spotError } = await supabase
        .from("spots")
        .select("*")
        .eq("id", id)
        .single()

      if (spotError) {
        console.error("[GET /api/spots] Error fetching spot:", {
          id,
          error: spotError.message,
          code: spotError.code,
          hint: spotError.hint,
          details: spotError.details,
        })
        const apiError = parseApiError(
          { status: 500 } as Response,
          { error: spotError.message, code: spotError.code }
        )
        logApiError("Error fetching spot", apiError)
        return NextResponse.json(
          {
            error: "Failed to fetch spot",
            details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
            code: apiError.code,
          },
          { status: 500 }
        )
      }

      if (!spot) {
        return NextResponse.json({ error: "Spot not found" }, { status: 404 })
      }

      // メディアを取得
      const { data: media, error: mediaError } = await supabase
        .from("spot_media")
        .select("*")
        .eq("spot_id", id)
        .order("created_at", { ascending: true })

      if (mediaError) {
        console.error("[GET /api/spots] Error fetching media:", mediaError)
      }

      const spotWithMedia = dbToSpot(spot, media || [])
      const response = NextResponse.json(spotWithMedia)
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    // すべてのスポットを取得
    // RLSポリシーにより承認済みまたはstatusがNULLのスポットのみ返される
    // RLSポリシーに完全に依存する（明示的なフィルタリングは行わない）
    const { data: spots, error: spotsError } = await supabase
      .from("spots")
      .select("*")
      .order("created_at", { ascending: false })

    if (spotsError) {
      console.error("[GET /api/spots] Error fetching spots:", {
        error: spotsError.message,
        code: spotsError.code,
        hint: spotsError.hint,
        details: spotsError.details,
        hasUser: !!user,
        userId: user?.id || null,
      })
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: spotsError.message,
          code: spotsError.code,
          hint: spotsError.hint,
        }
      )
      logApiError("Error fetching spots", apiError)
      return NextResponse.json(
        {
          error: "Failed to fetch spots",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    console.log("[GET /api/spots] Fetched spots:", {
      count: spots?.length || 0,
      spots: spots?.map((s) => ({
        id: s.id,
        status: s.status,
        spot_name: s.spot_name,
      })) || [],
    })

    // 各スポットのメディアを取得
    const spotsWithMedia = await Promise.all(
      (spots || []).map(async (spot) => {
        const { data: media, error: mediaError } = await supabase
          .from("spot_media")
          .select("*")
          .eq("spot_id", spot.id)
          .order("created_at", { ascending: true })

        if (mediaError) {
          console.error(`[GET /api/spots] Error fetching media for spot ${spot.id}:`, mediaError)
        }

        return dbToSpot(spot, media || [])
      })
    )

    console.log("[GET /api/spots] Returning spots with media:", {
      count: spotsWithMedia.length,
    })

    // キャッシュを無効化して、常に最新のデータを返す
    const response = NextResponse.json(spotsWithMedia)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("[GET /api/spots] Unexpected error:", error)
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

/**
 * 管理者へのメール通知を送信（承認待ちの記録について）
 */
async function sendAdminNotification(
  spot: Spot,
  submittedByEmail: string | null,
  trickName: string | null,
  mediaUrl: string | null
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase URL or Anon Key not configured, skipping admin notification")
      return
    }

    // Supabase Edge Functionを呼び出してメール通知を送信
    // Edge Function内で管理者のメールアドレスを取得して送信します
    const functionUrl = `${supabaseUrl}/functions/v1/send-admin-notification`
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        spotId: spot.id,
        spotName: spot.spotName || "（場所名なし）",
        submittedBy: spot.submittedBy || null,
        submittedByEmail: submittedByEmail,
        trickName: trickName,
        mediaUrl: mediaUrl,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Failed to send admin notification:", errorData)
    } else {
      const result = await response.json().catch(() => ({}))
      console.log(`Admin notification sent to ${result.adminEmails || "unknown"} admin(s)`)
    }
  } catch (error) {
    console.error("Error calling admin notification function:", error)
    // 通知エラーは致命的ではないので、続行
  }
}

/**
 * 位置情報ベースで既存スポットを検索
 * 指定された位置から一定距離以内の既存スポットを検索する
 */
async function findExistingSpotByLocation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lat: number,
  lng: number,
  threshold: number = SPOT_MERGE_CONFIG.DISTANCE_THRESHOLD
): Promise<{ id: string; spot_name: string; lat: number; lng: number } | null> {
  try {
    // 範囲内のスポットを検索（簡易的な範囲検索）
    // 緯度・経度の差が閾値以内のスポットを取得
    const { data: spots, error } = await supabase
      .from("spots")
      .select("id, spot_name, lat, lng")
      .gte("lat", lat - threshold)
      .lte("lat", lat + threshold)
      .gte("lng", lng - threshold)
      .lte("lng", lng + threshold)

    if (error) {
      console.error("Error searching for existing spots:", error)
      return null
    }

    if (!spots || spots.length === 0) {
      return null
    }

    // 距離を計算して、最も近いスポットを返す
    let closestSpot: { id: string; spot_name: string; lat: number; lng: number } | null = null
    let minDistance = threshold

    for (const spot of spots) {
      const distance = calculateDistance(lat, lng, spot.lat, spot.lng)
      if (distance < minDistance) {
        minDistance = distance
        closestSpot = spot
      }
    }

    return closestSpot
  } catch (error) {
    console.error("Unexpected error in findExistingSpotByLocation:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient()

    // 認証情報を取得（認証必須）
    const supabaseServer = supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    // 認証チェック（必須）
    if (authError || !user) {
      console.error("[POST /api/spots] Authentication failed:", {
        authError: authError?.message,
        hasUser: !!user,
      })
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 }
      )
    }

    console.log("[POST /api/spots] Authenticated user:", {
      userId: user.id,
      email: user.email,
    })

    const body = await request.json()
    const spotData = body as Partial<Spot>

    // バリデーション（Phase 1-1: 最小限の必須項目のみ）
    // spotNameは空文字でもOK（後で追加可能）
    if (spotData.lat === undefined || spotData.lng === undefined) {
      return NextResponse.json({ error: "Missing required fields: lat, lng" }, { status: 400 })
    }

    if (!spotData.media || spotData.media.length === 0) {
      return NextResponse.json({ error: "At least one media item is required" }, { status: 400 })
    }

    // 信頼ユーザーかどうかを確認（自動承認のため）
    const isTrusted = await isTrustedUser(user.id)
    const initialStatus = isTrusted ? SPOT_STATUS.APPROVED : SPOT_STATUS.PENDING

    // 既存スポットを検索（位置情報ベース）
    const existingSpot = await findExistingSpotByLocation(supabase, spotData.lat, spotData.lng)

    let spotId: string
    let insertedSpot: any

    if (existingSpot) {
      // 既存スポットが見つかった場合、そのスポットIDを使用
      spotId = existingSpot.id
      console.log(`[POST /api/spots] Found existing spot: ${spotId} (${existingSpot.spot_name})`)
      
      // 既存スポットの情報を取得
      const { data: spot, error: spotError } = await supabase
        .from("spots")
        .select("*")
        .eq("id", spotId)
        .single()

      if (spotError || !spot) {
        // 既存スポットの取得に失敗した場合、新しいスポットを作成
        console.warn(`[POST /api/spots] Failed to fetch existing spot ${spotId}, creating new spot`)
        const dbSpot = spotToDb(spotData)
        spotId = spotData.id || Date.now().toString()

        const insertData: any = {
          ...dbSpot,
          id: spotId,
          status: initialStatus,
          created_at: new Date().toISOString(),
        }

        // 認証済みユーザーの場合、submitted_byを設定（必須）
        insertData.submitted_by = user.id

        // 信頼ユーザーの場合、自動承認の情報を設定
        if (isTrusted) {
          insertData.approved_by = user.id
          insertData.approved_at = new Date().toISOString()
        }

        const { data: newSpot, error: newSpotError } = await supabase
          .from("spots")
          .insert(insertData)
          .select()
          .single()

        if (newSpotError) {
          const apiError = parseApiError(
            { status: 500 } as Response,
            {
              error: newSpotError.message,
              code: newSpotError.code,
              hint: newSpotError.hint,
            }
          )
          logApiError("Error inserting spot", apiError)
          
          // 本番環境でもエラー詳細を返す（デバッグ用）
          return NextResponse.json(
            {
              error: "Failed to create spot",
              details: newSpotError.message,
              code: apiError.code,
              hint: apiError.hint,
              // RLSポリシーエラーの場合、より詳細な情報を提供
              ...(newSpotError.code === "42501" && {
                message: "権限エラー: RLSポリシーを確認してください",
              }),
              ...(newSpotError.code === "23505" && {
                message: "重複エラー: 既に存在する記録です",
              }),
            },
            { status: 500 }
          )
        }

        insertedSpot = newSpot
      } else {
        insertedSpot = spot
      }
    } else {
      // 既存スポットが見つからなかった場合、新しいスポットを作成
      console.log(`[POST /api/spots] No existing spot found, creating new spot`)
      const dbSpot = spotToDb(spotData)
      spotId = spotData.id || Date.now().toString()

      const insertData: any = {
        ...dbSpot,
        id: spotId,
        status: initialStatus,
        created_at: new Date().toISOString(),
      }

      // 認証済みユーザーの場合、submitted_byを設定（必須）
      insertData.submitted_by = user.id

      // 信頼ユーザーの場合、自動承認の情報を設定
      if (isTrusted) {
        insertData.approved_by = user.id
        insertData.approved_at = new Date().toISOString()
      }

      const { data: newSpot, error: spotError } = await supabase
        .from("spots")
        .insert(insertData)
        .select()
        .single()

      if (spotError) {
        // 詳細なエラーログを出力（本番環境でも確認できるように）
        console.error("[POST /api/spots] Error inserting spot:", {
          error: spotError.message,
          code: spotError.code,
          hint: spotError.hint,
          details: spotError.details,
          insertData: {
            ...insertData,
            // 機密情報は除外
            submitted_by: insertData.submitted_by ? "[REDACTED]" : null,
          },
          userId: user.id,
          isTrusted,
        })

        const apiError = parseApiError(
          { status: 500 } as Response,
          {
            error: spotError.message,
            code: spotError.code,
            hint: spotError.hint,
          }
        )
        logApiError("Error inserting spot", apiError)
        
        // 本番環境でもエラー詳細を返す（デバッグ用）
        return NextResponse.json(
          {
            error: "Failed to create spot",
            details: spotError.message,
            code: apiError.code,
            hint: apiError.hint,
            // RLSポリシーエラーの場合、より詳細な情報を提供
            ...(spotError.code === "42501" && {
              message: "権限エラー: RLSポリシーを確認してください",
            }),
            ...(spotError.code === "23505" && {
              message: "重複エラー: 既に存在する記録です",
            }),
          },
          { status: 500 }
        )
      }

      insertedSpot = newSpot
    }

    // メディアをデータベースに挿入
    const mediaInserts = spotData.media.map((media) => mediaToDb(media, spotId))

    console.log("[POST /api/spots] Inserting media:", {
      spotId,
      mediaCount: mediaInserts.length,
      mediaInserts: mediaInserts.map((m) => ({
        spot_id: m.spot_id,
        type: m.type,
        source: m.source,
        url: m.url ? "[REDACTED]" : null,
      })),
    })

    const { error: mediaError } = await supabase.from("spot_media").insert(mediaInserts)

    if (mediaError) {
      // 詳細なエラーログを出力
      console.error("[POST /api/spots] Error inserting media:", {
        error: mediaError.message,
        code: mediaError.code,
        hint: mediaError.hint,
        details: mediaError.details,
        spotId,
        mediaCount: mediaInserts.length,
      })

      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: mediaError.message,
          code: mediaError.code,
          hint: mediaError.hint,
        }
      )
      logApiError("Error inserting media", apiError)
      
      // 新しいスポットを作成した場合のみ削除（既存スポットの場合は削除しない）
      if (!existingSpot) {
        await supabase.from("spots").delete().eq("id", spotId)
      }
      
      return NextResponse.json(
        {
          error: "Failed to create media",
          details: process.env.NODE_ENV === "development" ? apiError.details : mediaError.message,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    // 作成された/更新されたスポットを取得して返す
    const { data: media } = await supabase
      .from("spot_media")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: true })

    const updatedSpot = dbToSpot(insertedSpot, media || [])

    // 承認待ちの場合はメッセージを追加し、管理者に通知を送信
    if (updatedSpot.status === SPOT_STATUS.PENDING) {
      // 管理者へのメール通知を送信（非同期、エラーは無視）
      sendAdminNotification(updatedSpot, user.email || null, spotData.trick || null, spotData.media?.[0]?.url || null).catch((error) => {
        console.error("Error sending admin notification:", error)
        // 通知エラーは致命的ではないので、続行
      })

      return NextResponse.json(
        {
          ...updatedSpot,
          message: "発見報告を受け付けました。承認後にマップに表示されます。",
        },
        { status: existingSpot ? 200 : 201 }
      )
    }

    return NextResponse.json(updatedSpot, { status: existingSpot ? 200 : 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient()

    // 認証チェック
    const { user, error: authError } = await requireAuth()
    if (!user || authError) {
      return NextResponse.json({ error: authError || "認証が必要です" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Spot ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const spotData = body as Partial<Spot>

    // バリデーション
    if (spotData.lat !== undefined && (spotData.lat < -90 || spotData.lat > 90)) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 })
    }

    if (spotData.lng !== undefined && (spotData.lng < -180 || spotData.lng > 180)) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 })
    }

    // スポットの存在確認
    const { data: existingSpot, error: fetchError } = await supabase
      .from("spots")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingSpot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 })
    }

    // スポット情報を更新
    const dbSpot = spotToDb(spotData)
    const { data: updatedSpot, error: updateError } = await supabase
      .from("spots")
      .update({
        ...dbSpot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
      logApiError("Error updating spot", apiError)
      return NextResponse.json(
        {
          error: "Failed to update spot",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    // メディアの更新（提供されている場合）
    if (spotData.media && spotData.media.length > 0) {
      // 既存のメディアを削除
      await supabase.from("spot_media").delete().eq("spot_id", id)

      // 新しいメディアを挿入
      const mediaInserts = spotData.media.map((media) => mediaToDb(media, id))
      const { error: mediaError } = await supabase.from("spot_media").insert(mediaInserts)

      if (mediaError) {
        const apiError = parseApiError(
          { status: 500 } as Response,
          {
            error: mediaError.message,
            code: mediaError.code,
            hint: mediaError.hint,
          }
        )
        logApiError("Error updating media", apiError)
        return NextResponse.json(
          {
            error: "Failed to update media",
            details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
            code: apiError.code,
            hint: apiError.hint,
          },
          { status: 500 }
        )
      }
    }

    // 更新されたスポットを取得して返す
    const { data: media } = await supabase
      .from("spot_media")
      .select("*")
      .eq("spot_id", id)
      .order("created_at", { ascending: true })

    const updatedSpotWithMedia = dbToSpot(updatedSpot, media || [])

    return NextResponse.json(updatedSpotWithMedia)
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // サーバーサイド用のSupabaseクライアントを作成
    const supabase = await createClient()

    // 認証チェック
    const { user, error: authError } = await requireAuth()
    if (!user || authError) {
      return NextResponse.json({ error: authError || "認証が必要です" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Spot ID is required" }, { status: 400 })
    }

    // スポットの存在確認
    const { data: existingSpot, error: fetchError } = await supabase
      .from("spots")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingSpot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 })
    }

    // メディアを先に削除（外部キー制約のため）
    const { error: mediaDeleteError } = await supabase
      .from("spot_media")
      .delete()
      .eq("spot_id", id)

    if (mediaDeleteError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: mediaDeleteError.message,
          code: mediaDeleteError.code,
          hint: mediaDeleteError.hint,
        }
      )
      logApiError("Error deleting media", apiError)
      return NextResponse.json(
        {
          error: "Failed to delete media",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    // スポットを削除
    const { error: deleteError } = await supabase.from("spots").delete().eq("id", id)

    if (deleteError) {
      const apiError = parseApiError(
        { status: 500 } as Response,
        {
          error: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint,
        }
      )
      logApiError("Error deleting spot", apiError)
      return NextResponse.json(
        {
          error: "Failed to delete spot",
          details: process.env.NODE_ENV === "development" ? apiError.details : undefined,
          code: apiError.code,
          hint: apiError.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Spot deleted successfully" })
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
