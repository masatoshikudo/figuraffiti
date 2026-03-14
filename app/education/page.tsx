import Link from "next/link"
import { ArrowRight, Map, Sparkles, Trophy, type LucideIcon } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { EXTERNAL_URLS } from "@/lib/constants"

type ParticipationPath = {
  title: string
  catchcopy: string
  members: string
  body: string
  firstStep: string
  nextStep: string
  ctaLabel: string
  href: string
  icon: LucideIcon
  external?: boolean
}

const participationPaths: readonly ParticipationPath[] = [
  {
    title: "探す人",
    catchcopy: "まずは、街の気配を追いかけよう。",
    members: "観測者 / 探索者",
    body:
      "マップの手がかりを見て、気になるスポットへ歩いていく入口です。はじめてなら、ここが最初の一歩です。",
    firstStep: "近くのサークルをひとつ開いて、気になる場所を決める。",
    nextStep: "現地で探しながら、街の余白や違和感を見つける。",
    ctaLabel: "マップで手がかりを見る",
    href: "/discover/mapping",
    icon: Map,
  },
  {
    title: "残す人",
    catchcopy: "見つけたなら、その証を残そう。",
    members: "発見者 / 収集者",
    body:
      "見つけた AhhHum にタッチして、発見の証を残していく入口です。見つけた順番や履歴が、キミだけの参加の痕跡になります。",
    firstStep: "まずは1体見つけて、その場で発見を記録する。",
    nextStep: "記録を重ねながら、履歴や発見順を自分なりに楽しむ。",
    ctaLabel: "探しに行く準備をする",
    href: "/discover/mapping",
    icon: Trophy,
  },
  {
    title: "広げる人",
    catchcopy: "遊ぶだけじゃなく、広げる側へ。",
    members: "設置者 / 共創者",
    body:
      "将来的には、設置や共創のかたちで世界を広げる関わり方も想定しています。いまはまだ公開参加を広く開く前段階なので、興味があれば個別に相談してください。",
    firstStep: "どんな関わり方をしたいかを整理して運営に伝える。",
    nextStep: "運営との対話を通じて、これからの共創の可能性を探る。",
    ctaLabel: "共創について相談する",
    href: EXTERNAL_URLS.CONTACT_FORM,
    icon: Sparkles,
    external: true,
  },
]

export default function EducationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="flex-1 pt-24">
        <section className="border-b border-border/70 bg-card/35">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">YOUR NEXT STEP</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">キミはどこから？</h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              AhhHum への入り方は、ひとつじゃない。
              <br />
              いまのキミに合う入口から始めよう。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2">探す人</span>
              <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2">残す人</span>
              <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2">広げる人</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {participationPaths.map((path) => {
              const Icon = path.icon

              return (
                <article key={path.title} className="rounded-[2rem] border border-border/70 bg-card/60 p-6 sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-strong">{path.members}</p>
                      <h2 className="text-2xl font-semibold tracking-tight">{path.title}</h2>
                    </div>
                  </div>

                  <p className="text-lg font-medium">{path.catchcopy}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{path.body}</p>

                  <div className="mt-6 space-y-4 rounded-[1.5rem] border border-border/70 bg-background/55 p-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">最初の一歩</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{path.firstStep}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">次に起きること</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{path.nextStep}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button size="lg" className="h-12 rounded-full px-6" asChild>
                      <a
                        href={path.href}
                        target={path.external ? "_blank" : undefined}
                        rel={path.external ? "noopener noreferrer" : undefined}
                      >
                        {path.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/35">
          <div className="container mx-auto max-w-4xl px-4 py-14 sm:py-16">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">How It Expands</p>
              <h2 className="text-3xl font-semibold tracking-tight">まずは探す。そこから、少しずつ広がっていく。</h2>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                いきなり全部わからなくて大丈夫です。まずは探すところから始めて、見つけたら残す。
                もっと深く関わりたくなったら、広げる側へ進めます。
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "探す人は、街へ出て気配を見つける入口です。",
                "残す人は、発見を自分の履歴として刻む入口です。",
                "広げる人は、文化を一緒につくっていく入口です。",
              ].map((text, index) => (
                <div key={text} className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-strong">Step {index + 1}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/60 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium">はじめてなら、まずは「探す人」から。</p>
              <p className="mt-2 text-sm text-muted-foreground">
                近くのスポットをひとつ開いて、気になった場所へ歩いてみてください。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-full px-8" asChild>
                <Link href="/discover/mapping">
                  <Map className="h-4 w-4" />
                  マップで手がかりを見る
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-8" asChild>
                <Link href="/guidelines">ガイドラインを見る</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
