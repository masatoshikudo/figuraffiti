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
              投稿ガイドライン
            </h1>
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
              Figuraffitiは、街で見つけた立体グラフィティの「発見」を共有するサービスです
            </p>
          </div>

          {/* 発見報告の目的 */}
          <Card>
            <CardHeader>
              <CardTitle>発見報告の目的</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Figuraffitiは、都市の余白に設置された立体グラフィティ（フィギュア）を探し、発見を記録・共有するためのサービスです。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>「ここで、このキャラを見つけた」という発見を残す</li>
                <li>承認された報告だけがマップに表示される</li>
                <li>QR/NFCからキャラのストーリーや発見ログを閲覧できる</li>
              </ul>
            </CardContent>
          </Card>

          {/* 報告の方法 */}
          <Card>
            <CardHeader>
              <CardTitle>報告の方法</CardTitle>
              <CardDescription>地図で場所を選び、作品名とSNSリンクを送信するだけです</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                詳しくは<Link href="/how-it-works" className="text-primary hover:underline">探し方</Link>ページをご覧ください。
              </p>
              <p className="text-sm text-muted-foreground">
                地図で発見場所を選び、作品名・キャラ名とメディア（Instagram / TikTok / YouTube など）のURLを入力して送信します。承認後、マップに表示されます。
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
                <h3 className="font-semibold mb-2 text-primary">✅ 報告すべきこと</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>実際にその場所で見つけた Figuraffiti であること</li>
                  <li>動画や写真で発見の様子が分かること</li>
                  <li>場所・作品名が正確であること</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-destructive">❌ 報告してはいけないこと</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>捏造や別の場所の写真・動画</li>
                  <li>不適切な内容やスパム</li>
                  <li>重複した報告（同じ場所・同じ内容）</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 承認プロセス */}
          <Card>
            <CardHeader>
              <CardTitle>承認プロセス</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                すべての発見報告は管理者による承認が必要です。承認後、マップに表示され、該当キャラの「発見ログ」にも反映されます。
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">承認:</span>
                  <span className="text-sm text-muted-foreground">
                    報告がマップに追加され、承認通知がメールで送信されます。
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">却下:</span>
                  <span className="text-sm text-muted-foreground">
                    不適切な場合などは却下され、却下理由がメールで通知されます。
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
                  A. 発見報告を送信するにはログインが必要です。承認・却下の通知を受け取るためにも認証してください。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. 動画や写真を直接アップできますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. 現時点では、Instagram・TikTok・YouTube などのURLを貼る形式です。メディアは既存のSNSのURLで共有してください。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Q. 投稿した報告を編集・削除できますか？</h3>
                <p className="text-sm text-muted-foreground">
                  A. アプリからは編集・削除できません。必要な場合は管理者に連絡してください。
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
