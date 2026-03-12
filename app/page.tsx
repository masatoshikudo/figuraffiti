import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto max-w-5xl px-4 py-20">
          <div className="space-y-6">
            <p className="text-sm font-medium text-primary">AhhHum</p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              都市の余白に、
              <br />
              物語を残す。
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              AhhHum は、街の中にある曖昧な痕跡を探し、発見を記録し、やがて共創へつながる都市探索型の体験です。
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/discover/mapping">マップで探す</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover/nfc">発見を記録する</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">曖昧に探す</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                正確な答えではなく、サークルとヒントを頼りに街を読み解きます。
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">発見を刻む</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                NFC / QR で発見を記録し、Last Seen とティッカーに世界の動きを残します。
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">共創へ進む</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                将来は設置申請やアンバサダー制度で、都市そのものを共創する体験へ拡張します。
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
