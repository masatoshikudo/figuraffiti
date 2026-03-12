import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import { getCharacterBySlug } from "@/lib/character/character-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const character = await getCharacterBySlug(supabase, slug)

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error("[GET /api/characters/[slug]] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
