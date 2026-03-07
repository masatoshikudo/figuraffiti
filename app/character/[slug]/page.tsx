"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
import type { Character } from "@/types/character"
import type { Spot } from "@/types/spot"

export default function CharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [character, setCharacter] = useState<Character | null>(null)
  const [discoveryLog, setDiscoveryLog] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    setLoading(true)
    setError(null)
    fetch(`/api/characters/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("キャラクターが見つかりません")
          throw new Error("読み込みに失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setCharacter(data.character)
        setDiscoveryLog(data.discoveryLog || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-destructive">{error || "キャラクターが見つかりません"}</p>
        <Link
          href="/mapping"
          className="text-sm text-primary underline flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> マップへ
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <Link
          href="/mapping"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> マップへ戻る
        </Link>

        <article>
          {character.imageUrl && (
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted mb-6">
              <Image
                src={character.imageUrl}
                alt={character.name}
                fill
                className="object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight mb-2">{character.name}</h1>
          {character.story && (
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground whitespace-pre-wrap mb-8">
              {character.story}
            </div>
          )}

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">発見ログ</h2>
            {discoveryLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">まだ発見報告はありません。</p>
            ) : (
              <ul className="space-y-4">
                {discoveryLog.map((spot) => (
                  <li
                    key={spot.id}
                    className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border text-sm"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {spot.spotName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {spot.spotName}
                        </span>
                      )}
                      {spot.approvedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(spot.approvedAt).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </div>
                    {spot.media?.[0]?.url && (
                      <a
                        href={spot.media[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary text-xs"
                      >
                        <ExternalLink className="h-3 w-3" /> メディアを見る
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        <Link
          href="/mapping"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium"
        >
          <MapPin className="h-4 w-4" /> マップで探す
        </Link>
      </div>
    </div>
  )
}
