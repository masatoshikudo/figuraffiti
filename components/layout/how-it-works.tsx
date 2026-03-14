import { CheckCircle2, MapPin, Radio } from "lucide-react"
import {
  getSpacingClasses,
  getTypography,
  combineTokens,
  getGridClasses,
  getCardPreset,
} from "@/lib/design/design-tokens"

export function HowItWorks() {
  return (
    <section
      className={combineTokens(
        "container mx-auto",
        getSpacingClasses({ px: "02", py: "09" }),
        "md:py-spacing-10"
      )}
    >
      <div className={combineTokens("mb-16 text-center", getSpacingClasses({ mb: "08" }))}>
        <p className={combineTokens("mb-3 font-medium uppercase tracking-[0.24em] text-brand-strong", getTypography({ size: "xs" }))}>
          How It Works
        </p>
        <h2
          className={combineTokens(
            "tracking-tight",
            getTypography({ size: "3xl", weight: "bold" }),
            "md:text-4xl",
            getSpacingClasses({ mb: "02" })
          )}
        >
          <span className="block md:inline">発見記録は</span>
          <span className="text-primary block md:inline">2ステップ</span>
        </h2>
        <p className={combineTokens("mx-auto max-w-2xl", getTypography({ size: "lg" }), "leading-8 text-muted-foreground")}>
          ログイン不要でマップを見て、気になるサークルを 1 つ選ぶ。現地で見つけたら「タッチ」して、その場で発見を記録します。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            ログイン不要でマップ閲覧
          </span>
          <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            ヒントを頼りに街を歩く
          </span>
          <span className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            見つけたらその場で記録
          </span>
        </div>
      </div>

      <div className={getGridClasses({ cols: 2, gap: "default", responsive: true })}>
        <div
          className={combineTokens(
            "transition-all hover:border-primary/50 hover:shadow-lg",
            getCardPreset("default"),
            "h-full"
          )}
        >
          <div className={combineTokens(getSpacingClasses({ p: "06" }))}>
            <div
              className={combineTokens(
                "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
                getSpacingClasses({ mb: "04" })
              )}
            >
              <MapPin className="h-6 w-6" />
            </div>
            <h3
              className={combineTokens(
                getTypography({ size: "xl", weight: "bold" }),
                getSpacingClasses({ mb: "04" })
              )}
            >
              ① マップで探す
            </h3>
            <ul className={combineTokens("space-y-3 leading-7", getTypography({ size: "sm" }), "text-muted-foreground")}>
              <li>マップ閲覧はログイン不要。まずは気になるサークルを 1 つ選ぶところから始められます。</li>
              <li>曖昧なサークルと短いヒントを手がかりに、行ってみたい場所を選びます。</li>
              <li>正確な場所は表示されないため、スマホだけで完結せず街歩きそのものを楽しめます。</li>
              <li>Last Seen とティッカーが、いま動いている気配を伝えます。</li>
            </ul>
          </div>
        </div>

        <div
          className={combineTokens(
            "transition-all hover:border-primary/50 hover:shadow-lg",
            getCardPreset("default"),
            "h-full"
          )}
        >
          <div className={combineTokens(getSpacingClasses({ p: "06" }))}>
            <div
              className={combineTokens(
                "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
                getSpacingClasses({ mb: "04" })
              )}
            >
              <Radio className="h-6 w-6" />
            </div>
            <h3
              className={combineTokens(
                getTypography({ size: "xl", weight: "bold" }),
                getSpacingClasses({ mb: "04" })
              )}
            >
              ② 現地で記録する
            </h3>
            <ul className={combineTokens("space-y-3 leading-7", getTypography({ size: "sm" }), "text-muted-foreground")}>
              <li>見つけたら NFCタグを読み取り、「タッチ」してその場で発見記録を残します。</li>
              <li>記録が反映されると Last Seen やティッカーにも変化が出て、探索の手応えが残ります。</li>
              <li>今後は発見順やバッジなど、見つけた人だけの演出も順次追加予定です。</li>
            </ul>

            <div
              className={combineTokens(
                "mt-6 flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-3",
                getTypography({ size: "sm" })
              )}
            >
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Phase1 では「探索」と「発見記録」を最優先にしています。</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
