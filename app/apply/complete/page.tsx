import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApplyCompletePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container max-w-2xl mx-auto p-4 flex items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>共創申請を受け付けました</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              申請内容は `admin/co-create` の審査キューに入りました。審査結果はプロフィールから確認できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/profile">プロフィールへ</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/discover/mapping">マップへ戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
