import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { requireAdmin } from "@/lib/api/admin-utils"
import { AHHHUM_CONFIG, ERROR_MESSAGES, SPOT_STATUS } from "@/lib/constants"
import { createRandomCircleCenter } from "@/lib/spot/circle-display-utils"

function extractPrefecture(address?: string | null): string | null {
  if (!address) return null

  const match = address.match(
    /(東京都|北海道|(?:京都府|大阪府)|.{2,3}県)/
  )

  return match?.[1] ?? null
}

function createToken() {
  return `nfc_${crypto.randomUUID().replace(/-/g, "")}`
}

function getRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim()
  const host = request.headers.get("host")?.trim()

  if (forwardedHost) {
    return `${forwardedProto || request.nextUrl.protocol.replace(":", "")}://${forwardedHost}`
  }

  if (host) {
    return `${forwardedProto || request.nextUrl.protocol.replace(":", "")}://${host}`
  }

  return request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin()
    if (error || !user) {
      return NextResponse.json(
        { error: error || ERROR_MESSAGES.ADMIN_REQUIRED },
        { status: error === ERROR_MESSAGES.AUTH_REQUIRED ? 401 : 403 }
      )
    }

    const body = await request.json()
    const spotName =
      typeof body.spotName === "string" ? body.spotName.trim() : ""
    const context =
      typeof body.context === "string" ? body.context.trim() : ""
    const address =
      typeof body.address === "string" ? body.address.trim() : ""
    const lat = typeof body.lat === "number" ? body.lat : Number.NaN
    const lng = typeof body.lng === "number" ? body.lng : Number.NaN

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "有効な位置情報が必要です" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const spotId = crypto.randomUUID()

    const { data: latestApprovedSpot, error: latestSpotError } = await supabase
      .from("spots")
      .select("spot_number")
      .eq("status", SPOT_STATUS.APPROVED)
      .order("spot_number", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (latestSpotError) {
      return NextResponse.json(
        { error: "スポット番号の採番に失敗しました" },
        { status: 500 }
      )
    }

    const spotNumber = (latestApprovedSpot?.spot_number ?? 0) + 1
    const token = createToken()
    const prefecture = extractPrefecture(address)
    const displayCenter = createRandomCircleCenter(
      lat,
      lng,
      AHHHUM_CONFIG.CIRCLE_RADIUS_M
    )
    const visibleAfter = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + AHHHUM_CONFIG.SPOT_EXPIRATION_DAYS)

    if (process.env.NODE_ENV !== "development") {
      visibleAfter.setHours(
        visibleAfter.getHours() + AHHHUM_CONFIG.ADMIN_CIRCLE_DELAY_HOURS
      )
    }

    const { data: insertedSpot, error: insertSpotError } = await supabase
      .from("spots")
      .insert({
        id: spotId,
        spot_name: spotName || `Spot #${spotNumber}`,
        context: context || null,
        prefecture,
        lat,
        lng,
        display_lat: displayCenter.lat,
        display_lng: displayCenter.lng,
        status: SPOT_STATUS.APPROVED,
        spot_number: spotNumber,
        visible_after: visibleAfter.toISOString(),
        expires_at: expiresAt.toISOString(),
        submitted_by: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .select("id, spot_name, spot_number, display_lat, display_lng, visible_after, expires_at")
      .single()

    if (insertSpotError || !insertedSpot) {
      console.error("[POST /api/admin/spots/create-with-token] Spot error:", insertSpotError)
      return NextResponse.json(
        { error: "スポットの作成に失敗しました" },
        { status: 500 }
      )
    }

    const { error: insertTokenError } = await supabase
      .from("nfc_tags")
      .insert({
        token,
        spot_id: insertedSpot.id,
        is_active: true,
        note: "Admin MVP generated",
      })

    if (insertTokenError) {
      console.error("[POST /api/admin/spots/create-with-token] Token error:", insertTokenError)
      await supabase.from("spots").delete().eq("id", insertedSpot.id)

      return NextResponse.json(
        { error: "NFCトークンの発行に失敗しました" },
        { status: 500 }
      )
    }

    const nfcUrl = `${getRequestOrigin(request)}/discover/nfc?t=${encodeURIComponent(token)}`

    return NextResponse.json({
      success: true,
      spotId: insertedSpot.id,
      spotName: insertedSpot.spot_name,
      spotNumber: insertedSpot.spot_number,
      address: address || null,
      displayLat: insertedSpot.display_lat,
      displayLng: insertedSpot.display_lng,
      visibleAfter: insertedSpot.visible_after,
      expiresAt: insertedSpot.expires_at,
      token,
      nfcUrl,
    })
  } catch (error) {
    console.error("[POST /api/admin/spots/create-with-token] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
