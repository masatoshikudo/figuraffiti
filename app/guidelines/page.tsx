import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import Link from "next/link"
import { Compass, LifeBuoy, ShieldAlert } from "lucide-react"

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="container mx-auto flex-1 max-w-4xl px-4 pb-16 pt-24">
        <div className="space-y-8 sm:space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">Guidelines</p>
            <h1 className={combineTokens("tracking-tight", getTypography({ size: "4xl", weight: "bold" }))}>
              探索・発見記録ガイドライン
            </h1>
            <p className={combineTokens("mx-auto max-w-2xl leading-8", getTypography({ size: "lg" }), "text-muted-foreground")}>
              AhhHum は、街で痕跡を探し、現地で見つけたことを記録するサービスです。
              はじめる前に、守るべきポイントだけ先に確認できます。
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/discover/mapping" className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
                マップを見る
              </Link>
              <Link href="/how-it-works" className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                発見記録の流れ
              </Link>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[2rem] border border-border/70 bg-card/65 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">やってよいこと</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                公共の場所で、周囲に配慮しながら歩いて探し、実際に見つけた内容だけを記録すること。
              </p>
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-card/65 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">避けること</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                私有地への立ち入り、危険行為、迷惑行為、捏造された記録やなりすましは行わないでください。
              </p>
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-card/65 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">迷ったとき</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                判断に迷う場所では無理をせず中止し、必要なら運営へお問い合わせください。
              </p>
            </div>
          </section>

          {/* 発見記録の目的 */}
          <Card className="rounded-[2rem] border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>発見記録の目的</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7 text-muted-foreground">
                AhhHum は、都市の余白に潜む痕跡を探し、現地で発見した事実を記録するためのサービスです。
              </p>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>「ここで見つけた」という発見の証跡を残す</li>
                <li>Last Seen やティッカーに世界の動きを反映する</li>
                <li>QR/NFC を通じて発見とデジタル体験を接続する</li>
              </ul>
            </CardContent>
          </Card>

          {/* 記録の方法 */}
          <Card className="rounded-[2rem] border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>記録の方法</CardTitle>
              <CardDescription>マップで探し、現地で NFC / QR を使って記録します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7 text-muted-foreground">
                詳しくは<Link href="/how-it-works" className="text-primary hover:underline">探し方</Link>ページをご覧ください。
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                曖昧なサークルを手がかりに現地まで行き、スポット番号入力または NFC / QR 読み取りで発見を記録します。
              </p>
            </CardContent>
          </Card>

          {/* 報告のルール */}
          <Card className="rounded-[2rem] border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>報告のルール</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-primary/15 bg-primary/6 p-5">
                  <h3 className="mb-3 font-semibold text-primary">守るべきこと</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                    <li>実際にその場所で見つけた痕跡だけを記録すること</li>
                    <li>私有地・危険な場所・法令違反となる行為を避けること</li>
                    <li>スポット番号や記録内容を正確に扱うこと</li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-destructive/15 bg-destructive/5 p-5">
                  <h3 className="mb-3 font-semibold text-destructive">してはいけないこと</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                    <li>捏造された記録や別場所でのなりすまし</li>
                    <li>危険行為、迷惑行為、私有地への無断立ち入り</li>
                    <li>スパム的な連続記録や不正な重複送信</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 運用方針 */}
          <Card className="rounded-[2rem] border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>運用方針</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-7 text-muted-foreground">
                Phase1 の中心は「探索」と「発見記録」です。共創申請や高度な投稿機能は、後続フェーズで段階的に追加されます。
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">探索:</span>
                  <span className="text-sm text-muted-foreground">
                    曖昧なサークル、Last Seen、ティッカーを使って都市の中を探します。
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">記録:</span>
                  <span className="text-sm text-muted-foreground">
                    NFC / QR またはスポット番号入力で発見を記録します。
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* よくある質問 */}
          <Card className="rounded-[2rem] border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>よくある質問</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Q. ログインは必要ですか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. マップ閲覧は未ログインでも可能ですが、発見を記録するにはログインが必要です。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. 動画や写真を直接アップできますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. Phase1 では発見記録が中心で、メディア投稿は最小構成です。将来フェーズで強化予定です。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. 記録した内容を編集・削除できますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. 現時点ではアプリからの編集・削除には対応していません。必要な場合は運営に連絡してください。
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="rounded-[2rem] border border-border/70 bg-card/60 p-6 text-center sm:p-8">
            <p className="text-lg font-medium">準備ができたら、まずはマップを開いて近くの気配から探してみてください。</p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/discover/mapping" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                マップで探し始める
              </Link>
              <Link href="/how-it-works" className="rounded-full border border-border/80 bg-background/50 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card">
                発見記録の流れを見る
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
