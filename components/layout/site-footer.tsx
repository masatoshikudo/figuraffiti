import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Compass, Mail, Map, MapPin, ShieldCheck } from "lucide-react"
import { getSpacingClasses, getTypography, combineTokens, getGridClasses } from "@/lib/design/design-tokens"
import { EXTERNAL_URLS } from "@/lib/constants"

export function SiteFooter() {
  return (
    <footer
      className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(68,79,90,0.94),rgba(54,64,73,0.97))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md [--border:rgba(255,255,255,0.14)] [--card:rgba(255,255,255,0.04)] [--foreground:#f5f7f8] [--muted-foreground:#c6d0d8] [--brand:#d0bf9f] [--brand-strong:#f1e5cf]"
    >
      <div className={combineTokens("container mx-auto", getSpacingClasses({ px: "02", py: "08" }), "md:py-spacing-10")}>
        <div className={combineTokens(getGridClasses({ cols: 4, gap: "loose", responsive: true }), "lg:grid-cols-4")}>
          <div className="lg:col-span-2">
            <div className={combineTokens("mb-6 flex items-center", getSpacingClasses({ gap: "01" }))}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className={combineTokens(getTypography({ size: "xs", weight: "medium" }), "uppercase tracking-[0.24em] text-brand-strong")}>
                  Urban Trace
                </p>
                <span className={combineTokens(getTypography({ size: "xl", weight: "bold" }), "tracking-tight")}>AhhHum</span>
              </div>
            </div>
            <h3 className={combineTokens("mb-6 tracking-tight text-balance", getTypography({ size: "3xl", weight: "bold" }))}>
              AhhHumを見つけて、
              <br />
              「タッチ」しよう。
            </h3>
            <p className={combineTokens("mb-8 max-w-md leading-7 text-muted-foreground")}>
              マップでスポットの手がかりを確認し、現地で AhhHum を見つけたら発見を記録できます。
              <br />
              対応端末で AhhHum の NFC タグにタッチして、発見を記録できます。
            </p>
            <div className={combineTokens("flex flex-wrap", getSpacingClasses({ gap: "02" }))}>
              <Button className="rounded-full px-6 font-bold" asChild>
                <Link href="/discover/mapping">
                  <Map className="h-4 w-4" />
                  マップで手がかりを見る
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h4
              className={combineTokens(
                "mb-4 uppercase tracking-wider text-muted-foreground",
                getTypography({ size: "sm", weight: "bold" }),
              )}
            >
              はじめての方へ
            </h4>
            <ul className={combineTokens("space-y-3", getTypography({ size: "sm" }))}>
              <li>
                <Link href="/education" className="text-muted-foreground transition-colors hover:text-brand">
                  参加方法を見る
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground transition-colors hover:text-brand">
                  発見記録の流れ
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground transition-colors hover:text-brand">
                  ガイドライン
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-brand">
                  運営者の考え
                </Link>
              </li>
              <li>
                <Link href="/discover/mapping" className="text-muted-foreground transition-colors hover:text-brand">
                  マップを見る
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={combineTokens(
                "mb-4 uppercase tracking-wider text-muted-foreground",
                getTypography({ size: "sm", weight: "bold" }),
              )}
            >
              安心して使う
            </h4>
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/12 bg-white/6 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-brand" />
                  <p className={combineTokens(getTypography({ size: "sm" }), "leading-6 text-muted-foreground")}>
                    公共の場所を歩いて探し、現地で見つけたときだけ NFC で発見を記録する体験です。私有地への立ち入りや危険行為、捏造された記録は行わないでください。
                  </p>
                </div>
              </div>
              <ul className={combineTokens("space-y-3", getTypography({ size: "sm" }))}>
                <li>
                  <Link href="/terms" className="text-muted-foreground transition-colors hover:text-brand">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-brand">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="text-muted-foreground transition-colors hover:text-brand">
                  安全のルール
                  </Link>
                </li>
              </ul>
              <a
                href={EXTERNAL_URLS.CONTACT_FORM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
              >
                <Mail className="h-4 w-4" />
                お問い合わせ
              </a>
            </div>
          </div>
        </div>

        <div
          className={combineTokens(
            "mt-16 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row",
            getSpacingClasses({ gap: "03" }),
          )}
        >
          <p className={combineTokens("text-muted-foreground", getTypography({ size: "xs" }))}>
            © 2025 AhhHum. All rights reserved.
          </p>
          <div className={combineTokens("flex items-center", getSpacingClasses({ gap: "02" }))}>
            <Compass className="h-4 w-4 text-brand" />
            <p className={combineTokens("text-muted-foreground", getTypography({ size: "xs" }))}>
              公共の場所で探し、現地で見つけた発見だけを記録する遊びとして設計しています。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
