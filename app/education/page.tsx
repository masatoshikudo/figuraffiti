import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Radio,
  Footprints,
  QrCode,
  Sparkles,
  MapPin,
  Instagram,
  CircleDot,
  Eye,
  Trophy,
  Hash,
  LayoutGrid,
  Shuffle,
} from "lucide-react"
import { getSpacingClasses, getTypography, combineTokens, getCardPreset } from "@/lib/design/design-tokens"

const phases = [
  {
    number: 1,
    nameJa: "噂の探知",
    nameEn: "Discovery",
    icon: Radio,
    purpose: "「どこかに何かがある」という期待感を煽り、街へ向かわせる。",
    steps: [
      { icon: Instagram, text: "SNSで新着通知。正確な場所は明かさず、キャラクター視点の風景だけを投稿。" },
      { icon: MapPin, text: "マップ上に「半径50m〜100mの曖昧なサークル（出現エリア）」が表示。正確なピンはない。" },
      { icon: CircleDot, text: "サークルをタップすると、キャラのシルエットと断片的なヒントが表示。推理が始まる。" },
      { icon: Trophy, text: "未発見なら「#1 未発見（FTFチャンス！）」と表示。一番乗りの競争心を煽る。" },
    ],
  },
  {
    number: 2,
    nameJa: "現地での探索",
    nameEn: "Hunt",
    icon: Footprints,
    purpose: "「見つけた！」というアハ体験（カタルシス）を生み出す。",
    steps: [
      { icon: MapPin, text: "サークルエリアに到着。ナビはそこまで。" },
      { icon: Eye, text: "スマホから目を離し、都市の余白を観察。配電盤の裏、ガードレールの隙間、看板の影。" },
      { icon: Sparkles, text: "街の痕跡を発見。自力で見つけた瞬間が最大の報酬。" },
    ],
  },
  {
    number: 3,
    nameJa: "発見と刻印",
    nameEn: "Tagging",
    icon: QrCode,
    purpose: "発見の証をデジタル空間に刻み込み、自己顕示欲と所有欲を満たす。",
    steps: [
      { icon: QrCode, text: "フィギュアに付いたQRコードをスマホで読み取る。" },
      { icon: Trophy, text: "FTFなら「First to Find 達成！」のバッジ。2番目以降は「あなたは #42 番目の発見者です」とシリアル表示。" },
      { icon: Hash, text: "キャラページにデジタルタグ（ストリートネームや一言）と発見時の写真・動画を残す。" },
      { icon: LayoutGrid, text: "キャラページは訪れた人たちのタグで埋まる「デジタル上の壁」になり、熱量が可視化される。" },
    ],
  },
  {
    number: 4,
    nameJa: "共鳴と次なる謎",
    nameEn: "Unlock",
    icon: Sparkles,
    purpose: "1つの発見で終わらせず、次なる探索への動機付けを行う。",
    steps: [
      { icon: LayoutGrid, text: "マイページで、集めたキャラ（シリアルナンバー・FTFバッジ付き）のコレクションを眺める。" },
      { icon: Shuffle, text: "特定のキャラを複数発見すると「共鳴」が発生。新たな「シークレットサークル」がマップに出現。" },
      { icon: Radio, text: "「このシークレットを見つけたい」「SNSで自慢したい」という欲求で、再びフェーズ1へ。" },
    ],
  },
] as const

export default function EducationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section
          className={combineTokens(
            "border-b border-border bg-muted/30",
            getSpacingClasses({ px: "02", py: "10" }),
            "md:py-spacing-12",
          )}
        >
          <div className="container mx-auto max-w-3xl text-center">
            <h1
              className={combineTokens(
                "tracking-tight",
                getTypography({ size: "3xl", weight: "bold" }),
                "md:text-4xl lg:text-5xl",
                getSpacingClasses({ mb: "03" }),
              )}
            >
              究極の都市探索体験
            </h1>
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground", getSpacingClasses({ mb: "06" }))}>
              AhhHum は「情報収集 → 推理と探索 → 達成とマーキング → 次なる謎」のゲームループで、街を舞台にした謎解きとデジタルタギングを体験できます。
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">4つのフェーズ：</span>
              <span>噂の探知</span>
              <span>→</span>
              <span>現地での探索</span>
              <span>→</span>
              <span>発見と刻印</span>
              <span>→</span>
              <span>共鳴と次なる謎</span>
            </div>
          </div>
        </section>

        {/* Phases */}
        <section
          className={combineTokens("container mx-auto", getSpacingClasses({ px: "02", py: "10" }), "md:py-spacing-12")}
        >
          <div className="mx-auto max-w-3xl space-y-16">
            {phases.map((phase) => {
              const Icon = phase.icon
              return (
                <article
                  key={phase.number}
                  className={combineTokens("scroll-mt-24", getCardPreset("default"), getSpacingClasses({ p: "06" }), "md:p-8")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className={combineTokens(getTypography({ size: "xs" }), "text-muted-foreground")}>
                        フェーズ {phase.number}
                      </span>
                      <h2 className={combineTokens(getTypography({ size: "2xl", weight: "bold" }))}>
                        {phase.nameJa}
                        <span className={combineTokens("ml-2 font-normal", getTypography({ size: "base" }), "text-muted-foreground")}>
                          （{phase.nameEn}）
                        </span>
                      </h2>
                    </div>
                  </div>
                  <p className={combineTokens(getTypography({ size: "sm" }), "text-muted-foreground", getSpacingClasses({ mb: "05" }))}>
                    <strong className="text-foreground">目的：</strong>
                    {phase.purpose}
                  </p>
                  <ul className="space-y-3">
                    {phase.steps.map((step, i) => {
                      const StepIcon = step.icon
                      return (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <StepIcon className="h-4 w-4" />
                          </span>
                          <span className={combineTokens(getTypography({ size: "sm" }), "text-muted-foreground pt-0.5")}>
                            {step.text}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        {/* Conclusion + CTA */}
        <section
          className={combineTokens(
            "border-t border-border bg-muted/30",
            getSpacingClasses({ px: "02", py: "10" }),
            "md:py-spacing-12",
          )}
        >
          <div className="container mx-auto max-w-2xl text-center space-y-6">
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
              AhhHum は「運営が用意したコンテンツを消費する」のではなく、
              <strong className="text-foreground">自らの足と目で都市を解読し、自らの痕跡をデジタル空間に刻み込む</strong>
              ストリートカルチャーに根ざした体験を目指しています。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/discover/mapping">マップで探す</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">発見記録の流れ</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/guidelines">ガイドライン</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
