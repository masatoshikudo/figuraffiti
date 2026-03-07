import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/supabase-server"
import type { Character } from "@/types/character"
import type { Spot } from "@/types/spot"
import { dbToSpot } from "@/lib/spot/spot-converter"

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: char, error: charError } = await supabase
      .from("characters")
      .select("id, slug, name, story, image_url, created_at, updated_at")
      .eq("slug", slug)
      .single()

    if (charError || !char) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    const character = rowToCharacter(char)

    // 発見ログ: このキャラに紐づく承認済みスポット
    const { data: spots, error: spotsError } = await supabase
      .from("spots")
      .select("*")
      .eq("character_id", character.id)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })

    if (spotsError) {
      console.error("[GET /api/characters/[slug]] spots", spotsError)
    }

    let discoveryLog: Spot[] = []
    if (spots && spots.length > 0) {
      const mediaBySpot = await Promise.all(
        spots.map(async (s) => {
          const { data: media } = await supabase
            .from("spot_media")
            .select("*")
            .eq("spot_id", s.id)
            .order("created_at", { ascending: true })
          return { spot: s, media: media || [] }
        })
      )
      discoveryLog = mediaBySpot.map(({ spot, media }) => dbToSpot(spot, media))
    }

    return NextResponse.json({ character, discoveryLog })
  } catch (e) {
    console.error("[GET /api/characters/[slug]]", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
