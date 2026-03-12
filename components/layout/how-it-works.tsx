import { CheckCircle2, MapPin, QrCode } from "lucide-react"
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
        <h2
          className={combineTokens(
            "tracking-tight",
            getTypography({ size: "3xl", weight: "bold" }),
            "md:text-4xl",
            getSpacingClasses({ mb: "02" })
          )}
        >
          <span className="inline-block mr-2">🗺️</span>
          <span className="block md:inline">発見記録は</span>
          <span className="text-primary block md:inline">2ステップ</span>
        </h2>
        <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
          AhhHum では、まずマップで痕跡を探し、
          <br />
          現地で NFC / QR を通じて発見を記録します。
        </p>
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
            <ul className={combineTokens("space-y-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
              <li>曖昧なサークルとヒントを手がかりに、街の中の痕跡を探します。</li>
              <li>正確な場所は表示されず、自分の足と目で探索する体験が中心です。</li>
              <li>Last Seen とティッカーが、今も世界が動いていることを伝えます。</li>
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
              <QrCode className="h-6 w-6" />
            </div>
            <h3
              className={combineTokens(
                getTypography({ size: "xl", weight: "bold" }),
                getSpacingClasses({ mb: "04" })
              )}
            >
              ② 現地で記録する
            </h3>
            <ul className={combineTokens("space-y-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
              <li>NFC / QR を読み取ると、その場で発見記録が作成されます。</li>
              <li>成功すると Last Seen が更新され、ティッカーにも反映されます。</li>
              <li>今後は発見順、FTF、デジタルタグなどの演出がここに加わります。</li>
            </ul>

            <div
              className={combineTokens(
                "mt-6 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3",
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
