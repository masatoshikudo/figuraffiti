import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { dbToCoCreateSubmission } from "@/lib/co-create/co-create-converter"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("co_create_submissions")
      .select("*")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[GET /api/co-create/my-submissions] Failed:", error)
      return NextResponse.json({ error: "共創申請の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json((data || []).map(dbToCoCreateSubmission))
  } catch (error) {
    console.error("[GET /api/co-create/my-submissions] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
