"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import type { Spot } from "@/types/spot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buildCharacterFromSpot } from "@/lib/character/character-utils"

export default function AdminContentPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSpots = () => {
    setLoading(true)
    fetch("/api/spots")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("スポットの取得に失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setSpots(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error("[AdminContentPage] Failed to fetch spots:", error)
        setSpots([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSpots()
  }, [])

  const characters = spots.map((spot) => buildCharacterFromSpot(spot))

  return (
    <AdminShell
      title="Admin / Content"
      description="Character ページに見えているコンテンツ単位を確認します。"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Character Candidates</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchSpots} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">読み込み中...</p>
          ) : characters.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">表示できる Character はまだありません。</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {characters.map((character) => (
                <div key={character.slug} className="rounded-xl border p-4 space-y-3">
                  <div>
                    <p className="font-semibold">{character.name}</p>
                    <p className="text-sm text-muted-foreground">
                      #{character.spotNumber ?? "?"} / {character.locationName}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {character.context || "まだ文脈テキストは設定されていません。"}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/characters/${character.slug}`}>Character を開く</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}
