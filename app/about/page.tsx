import Image from "next/image"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const interviewChats = [
  {
    asker: "Ahh",
    question: "なんで AhhHumをつくったの？",
    answers: [
      "スマホの中だけで終わらない遊びをつくりたかったからです。",
      "ストリートで探して、見つけて、「タッチ」した人だけがその証を残せる。そんな体験を AhhHum でつくりたかったんです。",
    ],
  },
  {
    asker: "Hum",
    question: "なんで街で探すの？",
    answers: [
      "スマホの中で何でも完結できる時代だからこそ、歩いて探して、見つけた瞬間にだけ起きる感覚を残したいと思っています。",
      "場所だけを回収するんじゃなく、その街の空気や余白ごと体験してほしい。AhhHum はそのための入口です。",
    ],
  },
  {
    asker: "Ahh",
    question: "なんで正確な場所を出さないの？",
    answers: [
      "正確な答えを先に出してしまうと、ただ回収するだけの行為になってしまうからです。",
      "少し曖昧な手がかりを頼りに歩いて、周囲を見て、見つけた瞬間に「いた」と思えることを大事にしています。",
    ],
  },
  {
    asker: "Hum",
    question: "見つけて記録するって、どういう意味？",
    answers: [
      "見つけた事実をその場で記録することで、発見が自分だけの記憶で終わらず、街に残る痕跡になります。",
      "見つけた順番や、その日にどう出会えたかまで含めて、その人だけの参加履歴になるところに意味があると考えています。",
    ],
  },
  {
    asker: "Ahh",
    question: "どんなキミに参加してほしい？",
    answers: [
      "まずは、少しでも気になった人に軽く参加してほしいです。全部を理解してからじゃなくても、ひとつ探してみるところから始められます。",
      "そのうえで、探すだけじゃなく、残したり広げたりしながら、街との関わり方を自分なりに深めたい人とも一緒に育てていきたいです。",
    ],
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
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">WHY WE MADE THIS</p>
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  <span className="block">なんで</span>
                  <span className="block">AhhHumを</span>
                  <span className="block">つくったの？</span>
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  トップページが「探して、タッチしよう」の入口なら、
                  <br />
                  ここはその理由を話すページです。
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Ahh と Hum が聞いて、運営者が答える。
                  <br />
                  グループラインみたいに読める、AhhHum の考え方です。
                </p>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,#f5efdf_0%,#f0e7d5_100%)] shadow-[0_18px_40px_rgba(28,34,40,0.08)]">
                <div className="border-b border-border/50 px-5 py-4">
                  <p className="text-sm font-medium text-foreground">Ahh / Hum / 運営者</p>
                  <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground">GROUP TALK</p>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4d7d4] text-sm font-bold text-[#7a4036]">
                      Ahh
                    </div>
                    <div className="max-w-[85%] rounded-[1.4rem] rounded-tl-md bg-background px-4 py-3 text-sm leading-6 shadow-sm">
                      なんで AhhHumをつくったの？
                    </div>
                  </div>
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[85%] rounded-[1.4rem] rounded-tr-md bg-[#444f5a] px-4 py-3 text-sm leading-6 text-white shadow-sm">
                      ストリートで探して、見つけて、「タッチ」した人だけがその証を残せる。そんな体験をつくりたかったんです。
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d0bf9f] text-xs font-bold text-[#4b3f2d]">
                      運営
                    </div>
                  </div>
                  <div className="relative mx-auto h-44 w-full max-w-[18rem]">
                    <Image
                      src="/ahh-hum-figures.png"
                      alt="街に配置される Ahh と Hum のフィギュア"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="mx-auto max-w-4xl space-y-6">
            {interviewChats.map((item, index) => (
              <article key={item.question} className="rounded-[2rem] border border-border/70 bg-card/50 p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Talk {String(index + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <div className="space-y-4">
                  <div className={`flex items-start gap-3 ${item.asker === "Hum" ? "justify-start" : "justify-start"}`}>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        item.asker === "Ahh" ? "bg-[#f4d7d4] text-[#7a4036]" : "bg-[#d7e4f4] text-[#315070]"
                      }`}
                    >
                      {item.asker}
                    </div>
                    <div className="max-w-[82%] rounded-[1.4rem] rounded-tl-md border border-border/60 bg-background px-4 py-3 text-sm leading-7 text-foreground sm:text-base">
                      {item.question}
                    </div>
                  </div>

                  {item.answers.map((answer, answerIndex) => (
                    <div key={answer} className="flex items-start justify-end gap-3">
                      <div
                        className={`max-w-[82%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 text-white shadow-sm sm:text-base ${
                          answerIndex === item.answers.length - 1 ? "rounded-tr-md" : ""
                        } bg-[linear-gradient(180deg,rgba(68,79,90,0.96),rgba(54,64,73,0.98))]`}
                      >
                        {answer}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d0bf9f] text-xs font-bold text-[#4b3f2d]">
                        運営
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/35">
          <div className="container mx-auto max-w-4xl px-4 py-14 sm:py-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">YOUR NEXT STEP</p>
              <h2 className="text-3xl font-semibold tracking-tight">読んだら、次はキミの番。</h2>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                AhhHum では、ただ見るだけで終わりません。
                次のページで、「探す人 / 残す人 / 広げる人」の3つの入口から、自分に合う参加のしかたを選べます。
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/60 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium">どこから入る？</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「探す人 / 残す人 / 広げる人」の3つのカテゴリで、いまの関わり方を案内しています。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-[1.2rem] border border-border/70 bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground sm:block">
                <span className="font-medium text-foreground">Hum:</span> つぎ、どこから入る？
              </div>
              <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                <Link href="/education">
                  参加のしかたを見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
