import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { HowItWorks } from "@/components/layout/how-it-works"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HowItWorks />
        <div className={combineTokens("container mx-auto text-center", getSpacingClasses({ px: "02", py: "08" }))}>
          <div className="space-y-4">
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
              投稿のルールやFAQについては、<Link href="/guidelines" className="text-primary hover:underline">ガイドライン</Link>をご覧ください。
            </p>
            <div className={combineTokens("flex justify-center gap-4", getSpacingClasses({ gap: "02" }))}>
              <Button size="lg" asChild>
                <Link href="/mapping">マップで探す</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/guidelines">ガイドライン</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

