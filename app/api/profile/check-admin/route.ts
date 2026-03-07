import { type NextRequest, NextResponse } from "next/server"
import { isAdmin, isTrustedUser } from "@/lib/api/admin-utils"
import { createClient } from "@/lib/supabase/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ isAdmin: false, isTrusted: false, error: "認証が必要です" }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    const trusted = await isTrustedUser(user.id)

    return NextResponse.json({
      isAdmin: admin,
      isTrusted: trusted,
      userId: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        isAdmin: false,
        isTrusted: false,
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

