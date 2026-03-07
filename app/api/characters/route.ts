import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import type { Character } from "@/types/character"

function rowToCharacter(row: {
  id: string
  slug: string
  name: string
  story: string | null
  image_url: string | null
  created_at: string
  updated_at: string | null
}): Character {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    story: row.story ?? null,
    imageUrl: row.image_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("characters")
      .select("id, slug, name, story, image_url, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[GET /api/characters]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const characters = (data || []).map(rowToCharacter)
    return NextResponse.json(characters)
  } catch (e) {
    console.error("[GET /api/characters]", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
