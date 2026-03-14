import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { HowItWorks } from "@/components/layout/how-it-works"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import { Map } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="overlay" />
      <main className="flex-1 pt-24">
        <HowItWorks />
        <div className={combineTokens("container mx-auto text-center", getSpacingClasses({ px: "02", py: "08" }))}>
          <div className="space-y-4">
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
              発見記録のルールや安全面の確認は、<Link href="/guidelines" className="text-primary hover:underline">ガイドライン</Link>からすぐに確認できます。
            </p>
            <div className={combineTokens("flex justify-center gap-4", getSpacingClasses({ gap: "02" }))}>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/discover/mapping">
                  <Map className="h-4 w-4" />
                  マップで手がかりを見る
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="/guidelines">安全に楽しむポイント</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

