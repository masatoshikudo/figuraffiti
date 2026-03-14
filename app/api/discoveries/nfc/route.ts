import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { ERROR_MESSAGES } from "@/lib/constants"

/**
 * POST /api/discoveries/nfc
 * NFCタグの token から発見記録を実行
 * Body: { token: string }
 */
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
    const token = typeof body.token === "string" ? body.token.trim() : ""

    if (!token) {
      return NextResponse.json(
        { error: "NFCトークンが必要です" },
        { status: 400 }
      )
    }

    const { data: result, error: rpcError } = await supabase
      .rpc("record_discovery_by_token", { p_token: token })
      .single()

    if (rpcError) {
      console.error("[POST /api/discoveries/nfc] RPC error:", rpcError)

      if (rpcError.message.includes("AUTH_REQUIRED")) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.AUTH_REQUIRED },
          { status: 401 }
        )
      }

      if (rpcError.message.includes("NFC_TAG_NOT_FOUND")) {
        return NextResponse.json(
          { error: "こんなタグ知らない" },
          { status: 404 }
        )
      }

      if (rpcError.message.includes("NFC_TAG_ALREADY_USED")) {
        return NextResponse.json(
          { error: "すでに誰かに発見されています" },
          { status: 409 }
        )
      }

      if (rpcError.message.includes("SPOT_NOT_FOUND")) {
        return NextResponse.json(
          { error: "紐づくスポットが見つかりません" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "NFCによる発見記録に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: result?.success ?? true,
      spotId: result?.spot_id ?? null,
      message: result?.message ?? "発見を記録しました",
    })
  } catch (error) {
    console.error("[POST /api/discoveries/nfc] Unexpected error:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
