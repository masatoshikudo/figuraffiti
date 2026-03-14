import Link from "next/link"
import { Compass, LifeBuoy, ShieldAlert } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { EXTERNAL_URLS } from "@/lib/constants"

const principles = [
  {
    title: "公共の場所だけで探す",
    body: "歩いて探すのは、立ち入りが許されている公共の場所だけです。私有地や管理区域には入らないでください。",
    icon: Compass,
  },
  {
    title: "実際に見つけたことだけを残す",
    body: "発見記録は、現地で本当に見つけた内容だけを扱います。推測や代理記録、捏造はしないでください。",
    icon: ShieldAlert,
  },
  {
    title: "迷ったらやらない",
    body: "危ないかもしれない、迷惑かもしれない、と感じた時点で中止するのが AhhHum の前提です。",
    icon: LifeBuoy,
  },
] as const

const dos = [
  "周囲に配慮しながら、歩いて探す",
  "実際に見つけた AhhHum だけを記録する",
  "人通りや交通の妨げにならない場所で行動する",
  "迷ったら中止し、必要なら運営へ相談する",
] as const

const donts = [
  "私有地や立入禁止エリアへ無断で入ること",
  "危険行為、迷惑行為、法令違反につながる行為",
  "自分で見つけていない発見を記録すること",
  "NFCタグや設置物を壊したり持ち去ったりすること",
] as const

const decisionRules = [
  "その場所に入ってよいと即答できないなら、入らない。",
  "周囲の人から見て不審に映る行為になりそうなら、やらない。",
  "安全より発見を優先しそうになったら、その時点でやめる。",
] as const

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="flex-1 pt-24">
        <section className="border-b border-border/70 bg-card/35">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">Guidelines</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">安全に楽しむための境界線</h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              このページは、AhhHum を安全に、そして長く続けられる遊びにするための最低限のルールをまとめたものです。
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className="rounded-[2rem] border border-border/70 bg-card/60 p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/35">
          <div className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[2rem] border border-primary/15 bg-background/60 p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">してよいこと</h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                  {dos.map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[2rem] border border-destructive/15 bg-background/60 p-6">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">してはいけないこと</h2>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                  {donts.map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-14 sm:py-16">
          <div className="rounded-[2rem] border border-border/70 bg-card/60 p-7">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">When You Are Unsure</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">迷ったときの判断基準</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
              {decisionRules.map((rule) => (
                <li key={rule} className="rounded-2xl border border-border/70 bg-background/55 px-4 py-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/60 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium">細かい条件が必要な場合は、規約と問い合わせ先を確認してください。</p>
              <p className="mt-2 text-sm text-muted-foreground">
                このページは原則だけに絞っています。個別判断が必要なケースは運営へ相談できます。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/terms"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border/80 bg-background/50 px-6 text-sm font-semibold text-foreground transition-colors hover:bg-card"
              >
                利用規約を見る
              </Link>
              <a
                href={EXTERNAL_URLS.CONTACT_FORM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
