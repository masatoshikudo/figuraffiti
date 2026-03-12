import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { requireAdmin } from "@/lib/api/admin-utils"
import { dbToCoCreateSubmission } from "@/lib/co-create/co-create-converter"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (!user || authError) {
      return NextResponse.json({ error: authError || "管理者権限が必要です" }, { status: 403 })
    }

    const body = await request.json()
    const submissionId = typeof body.submissionId === "string" ? body.submissionId : ""
    const reviewComment = typeof body.reviewComment === "string" ? body.reviewComment.trim() : ""

    if (!submissionId || !reviewComment) {
      return NextResponse.json(
        { error: "submissionId と reviewComment は必須です" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("co_create_submissions")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_comment: reviewComment,
      })
      .eq("id", submissionId)
      .select("*")
      .single()

    if (error || !data) {
      console.error("[POST /api/co-create/reject] Failed:", error)
      return NextResponse.json({ error: "共創申請の却下に失敗しました" }, { status: 500 })
    }

    return NextResponse.json(dbToCoCreateSubmission(data))
  } catch (error) {
    console.error("[POST /api/co-create/reject] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
