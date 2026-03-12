import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/admin-utils"

/**
 * Phase1: trusted_users テーブル廃止のため stub 化
 * GET: 空配列を返す / POST: 410 Gone
 */
export async function GET(_request: NextRequest) {
  const { user, error: authError } = await requireAdmin()
  if (!user || authError) {
    return NextResponse.json({ error: authError || "管理者権限が必要です" }, { status: 403 })
  }
  return NextResponse.json([])
}

export async function POST(_request: NextRequest) {
  const { user, error: authError } = await requireAdmin()
  if (!user || authError) {
    return NextResponse.json({ error: authError || "管理者権限が必要です" }, { status: 403 })
  }
  return NextResponse.json(
    { error: "信頼ユーザー機能は Phase1 では無効です" },
    { status: 410 }
  )
}
