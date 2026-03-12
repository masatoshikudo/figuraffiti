import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto max-w-4xl px-4 py-16 space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">About AhhHum</p>
            <h1 className="text-4xl font-bold tracking-tight">都市の余白に、探索の物語をつくる。</h1>
            <p className="text-lg text-muted-foreground">
              AhhHum は、街の中に潜む痕跡を探し、発見を記録し、やがて共創へ進んでいく都市探索型の体験プラットフォームです。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Discovery</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                曖昧なサークルとティッカーで、都市のどこかに何かがある感覚をつくります。
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Proof</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                NFC / QR 読み取りで発見を記録し、街で見つけた事実を自分の痕跡として残します。
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Co-Create</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                将来的には、設置申請やアンバサダー制度を通じて、都市そのものを共創していきます。
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/discover/mapping">マップを見る</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/how-it-works">探し方を見る</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
