import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { requireAdmin } from "@/lib/api/admin-utils"
import { dbToCoCreateSubmission } from "@/lib/co-create/co-create-converter"

export async function GET() {
  try {
    const { user, error: authError } = await requireAdmin()
    if (!user || authError) {
      return NextResponse.json({ error: authError || "管理者権限が必要です" }, { status: 403 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("co_create_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[GET /api/co-create/pending] Failed:", error)
      return NextResponse.json({ error: "共創審査キューの取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json((data || []).map(dbToCoCreateSubmission))
  } catch (error) {
    console.error("[GET /api/co-create/pending] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
