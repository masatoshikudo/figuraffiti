import Image from "next/image"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Compass, MapPinned, ScanSearch, Shapes } from "lucide-react"

const pillars = [
  {
    icon: MapPinned,
    title: "ヒントから探せる",
    body: "正確な場所をすぐに出さないから、自分の感覚で探す楽しさがあります。",
  },
  {
    icon: ScanSearch,
    title: "見つけた記録を残せる",
    body: "見つけた場所や体験を記録して、あとから振り返れます。",
  },
  {
    icon: Shapes,
    title: "楽しみ方が広がる",
    body: "まずは探すところから始めて、少しずつ自分なりの楽しみ方を広げられます。",
  },
] as const

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="flex-1 pt-24">
        <section className="border-b border-border/70">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
              <div className="max-w-3xl space-y-5">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">About AhhHum</p>
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                  街の気配を、
                  <br />
                  歩いて見つける。
                </h1>
                <p className="text-lg leading-8 text-muted-foreground">
                  AhhHum は、地図のヒントから気になる場所を見つけて、歩いて確かめて、発見を記録できるサービスです。
                  ただ見るだけでは終わらない、街歩きの入口をつくります。
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  街に配置される Ahh と Hum のフィギュアが、探索体験の象徴として現地での発見をつくります。
                </p>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-[#f3ebda] shadow-[0_18px_40px_rgba(28,34,40,0.08)]">
                <Image
                  src="/ahh-hum-figures.png"
                  alt="街に配置される Ahh と Hum のフィギュア"
                  width={1024}
                  height={1024}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div key={pillar.title} className="rounded-[2rem] border border-border/70 bg-card/60 p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold tracking-tight">{pillar.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{pillar.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/35">
          <div className="container mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:py-16">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">Why It Feels Different</p>
              <h2 className="text-3xl font-semibold tracking-tight">買う前に、まず探して楽しむ。</h2>
            </div>
            <div className="space-y-5 text-muted-foreground">
              <p className="leading-8">
                AhhHum では、場所の文脈や見つける体験を大切にしています。
                商品を見るだけでなく、自分で探して見つける楽しさを味わえます。
              </p>
              <div className="rounded-[2rem] border border-border/70 bg-background/40 p-5">
                <div className="flex gap-3">
                  <Compass className="mt-0.5 h-5 w-5 text-brand" />
                  <p className="text-sm leading-7">
                    最初は、曖昧サークルや発見記録を見ながら街を歩くところから。
                    難しい準備はいりません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/60 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium">まずは近くの気配を探す</p>
              <p className="mt-2 text-sm text-muted-foreground">
                マップを見て、気になる場所から気軽に歩き始めてみてください。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                <Link href="/discover/mapping">マップで探し始める</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base" asChild>
                <Link href="/education">遊び方を見る</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
