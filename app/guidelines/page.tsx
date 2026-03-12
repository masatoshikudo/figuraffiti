import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import Link from "next/link"

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container max-w-3xl mx-auto p-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className={combineTokens(getTypography({ size: "4xl", weight: "bold" }))}>
              探索・発見記録ガイドライン
            </h1>
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
              AhhHum は、街で痕跡を探し、発見を記録する都市探索サービスです
            </p>
          </div>

          {/* 発見記録の目的 */}
          <Card>
            <CardHeader>
              <CardTitle>発見記録の目的</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                AhhHum は、都市の余白に潜む痕跡を探し、現地で発見した事実を記録するためのサービスです。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>「ここで見つけた」という発見の証跡を残す</li>
                <li>Last Seen やティッカーに世界の動きを反映する</li>
                <li>QR/NFC を通じて発見とデジタル体験を接続する</li>
              </ul>
            </CardContent>
          </Card>

          {/* 記録の方法 */}
          <Card>
            <CardHeader>
              <CardTitle>記録の方法</CardTitle>
              <CardDescription>マップで探し、現地で NFC / QR を使って記録します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                詳しくは<Link href="/how-it-works" className="text-primary hover:underline">探し方</Link>ページをご覧ください。
              </p>
              <p className="text-sm text-muted-foreground">
                曖昧なサークルを手がかりに現地まで行き、スポット番号入力または NFC / QR 読み取りで発見を記録します。
              </p>
            </CardContent>
          </Card>

          {/* 報告のルール */}
          <Card>
            <CardHeader>
              <CardTitle>報告のルール</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-primary">✅ 守るべきこと</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>実際にその場所で見つけた痕跡だけを記録すること</li>
                  <li>私有地・危険な場所・法令違反となる行為を避けること</li>
                  <li>スポット番号や記録内容を正確に扱うこと</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-destructive">❌ してはいけないこと</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>捏造された記録や別場所でのなりすまし</li>
                  <li>危険行為、迷惑行為、私有地への無断立ち入り</li>
                  <li>スパム的な連続記録や不正な重複送信</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 運用方針 */}
          <Card>
            <CardHeader>
              <CardTitle>運用方針</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
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
          <Card>
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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
