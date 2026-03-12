import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { dbToCoCreateSubmission } from "@/lib/co-create/co-create-converter"
import type { CoCreateSubmission } from "@/types/co-create"

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

    const body = (await request.json()) as Partial<CoCreateSubmission>

    if (
      typeof body.intentText !== "string" ||
      body.intentText.trim().length === 0 ||
      typeof body.mediaUrl !== "string" ||
      body.mediaUrl.trim().length === 0 ||
      typeof body.lat !== "number" ||
      typeof body.lng !== "number"
    ) {
      return NextResponse.json(
        { error: "intentText, mediaUrl, lat, lng は必須です" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("co_create_submissions")
      .insert({
        title: body.title?.trim() || null,
        intent_text: body.intentText.trim(),
        lat: body.lat,
        lng: body.lng,
        media_url: body.mediaUrl.trim(),
        media_type: body.mediaType || "cover",
        media_source: body.mediaSource || "Other",
        status: "pending",
        submitted_by: user.id,
      })
      .select("*")
      .single()

    if (error || !data) {
      console.error("[POST /api/co-create] Failed to create submission:", error)
      return NextResponse.json({ error: "共創申請の送信に失敗しました" }, { status: 500 })
    }

    return NextResponse.json(dbToCoCreateSubmission(data), { status: 201 })
  } catch (error) {
    console.error("[POST /api/co-create] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
