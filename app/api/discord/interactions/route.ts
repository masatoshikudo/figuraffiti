import { NextResponse } from "next/server"

/**
 * Discord 連携はこのコードベースでは無効です。
 * 承認は Web の /admin 画面で行ってください。
 */
export async function POST() {
  return NextResponse.json(
    { error: "Discord integration is disabled in this application." },
    { status: 410 }
  )
}
