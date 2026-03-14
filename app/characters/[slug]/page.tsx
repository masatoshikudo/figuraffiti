import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/supabase-server"
import { getCharacterBySlug } from "@/lib/character/character-service"
import { formatLastSeen } from "@/lib/spot/last-seen-utils"

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const character = await getCharacterBySlug(supabase, slug)

  if (!character) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-10 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">Character</p>
          <h1 className="text-4xl font-bold tracking-tight">{character.name}</h1>
          <p className="text-muted-foreground">
            {character.context || "この痕跡に紐づく物語は、現地での発見とともに少しずつ立ち上がります。"}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>#{character.spotNumber ?? "?"}</span>
            <span>{character.locationName}</span>
            <span>Last Seen: {formatLastSeen(character.lastSeen)}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Wall</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {character.discoveries.length > 0 ? (
                character.discoveries.map((discovery, index) => (
                  <div key={discovery.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{discovery.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(discovery.discoveredAt).toLocaleString("ja-JP")}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  まだ発見記録はありません。最初の痕跡を残してください。
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                現地で AhhHum の NFCタグを読み取ると、発見記録が更新されます。
              </p>
              <Button asChild className="w-full">
                <Link href="/discover/nfc">
                  NFCでの記録方法を見る
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/discover/mapping">マップへ戻る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
