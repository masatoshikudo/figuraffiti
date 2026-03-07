import { Share2, CheckCircle2, ExternalLink, MapPin } from "lucide-react"
import Image from "next/image"
import { getSpacingClasses, getTypography, combineTokens, getGridClasses, getCardPreset } from "@/lib/design/design-tokens"

export function HowItWorks() {
  return (
    <section
      className={combineTokens("container mx-auto", getSpacingClasses({ px: "02", py: "09" }), "md:py-spacing-10")}
    >
      <div className={combineTokens("mb-16 text-center", getSpacingClasses({ mb: "08" }))}>
        <h2
          className={combineTokens(
            "tracking-tight",
            getTypography({ size: "3xl", weight: "bold" }),
            "md:text-4xl",
            getSpacingClasses({ mb: "02" }),
          )}
        >
          <span className="inline-block mr-2">🎨</span>
          <span className="block md:inline">発見報告は</span>
          <span className="text-primary block md:inline">2ステップ</span>
        </h2>
        <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>
          街で見つけた Figuraffiti を、SNSのリンクとともに報告します。
          <br />
          承認された報告だけがマップに表示されます。
        </p>
      </div>

      <div className={getGridClasses({ cols: 2, gap: "default", responsive: true })}>
        {/* Phase 1: 準備と記録 */}
        <div
          className={combineTokens(
            "group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg",
            getCardPreset("default"),
            "h-full",
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/black-and-white-skateboard-spot-street-architectur.jpg"
              alt="Street spot"
              fill
              className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white" />
          </div>

          {/* Content */}
          <div className={combineTokens("relative z-10", getSpacingClasses({ p: "06" }))}>
            <div
              className={combineTokens(
                "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary backdrop-blur-sm",
                getSpacingClasses({ mb: "04" }),
              )}
            >
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className={combineTokens(getTypography({ size: "xl", weight: "bold" }), getSpacingClasses({ mb: "04" }))}>
              ① 準備と報告
            </h3>
            
            {/* 外部（SNS） */}
            <div className={combineTokens("mb-4", getSpacingClasses({ mb: "04" }))}>
              <div className={combineTokens("flex items-center gap-2 mb-2", getSpacingClasses({ mb: "02" }))}>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className={combineTokens(getTypography({ size: "sm", weight: "medium" }), "text-muted-foreground")}>
                  外部
                </span>
              </div>
              <ul className={combineTokens("space-y-1.5 ml-6", getSpacingClasses({ gapY: "01" }))}>
                <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                  <span className="text-primary mt-0.5">•</span>
                  <span>発見した様子をSNSに投稿</span>
                </li>
                <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                  <span className="text-primary mt-0.5">•</span>
                  <span>そのリンクをコピー</span>
                </li>
              </ul>
            </div>

            {/* Figuraffiti上 */}
            <div>
              <div className={combineTokens("flex items-center gap-2 mb-2", getSpacingClasses({ mb: "02" }))}>
                <MapPin className="h-4 w-4 text-primary" />
                <span className={combineTokens(getTypography({ size: "sm", weight: "medium" }), "text-foreground")}>
                  Figuraffiti上
                </span>
              </div>
              <ul className={combineTokens("space-y-1.5 ml-6", getSpacingClasses({ gapY: "01" }))}>
                <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                  <span className="text-primary mt-0.5">•</span>
                  <span>地図で発見場所をクリック</span>
                </li>
                <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                  <span className="text-primary mt-0.5">•</span>
                  <span>作品名・キャラ名とSNSリンクを入力</span>
                </li>
                <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                  <span className="text-primary mt-0.5">•</span>
                  <span>発見報告を送信</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phase 2: 承認と掲載 */}
        <div
          className={combineTokens(
            "group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg",
            getCardPreset("default"),
            "h-full",
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/culture-diy-spot.jpg"
              alt="Skate culture"
              fill
              className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white" />
          </div>

          {/* Content */}
          <div className={combineTokens("relative z-10", getSpacingClasses({ p: "06" }))}>
            <div
              className={combineTokens(
                "inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary backdrop-blur-sm",
                getSpacingClasses({ mb: "04" }),
              )}
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className={combineTokens(getTypography({ size: "xl", weight: "bold" }), getSpacingClasses({ mb: "04" }))}>
              ② 承認と掲載
            </h3>
            
            <ul className={combineTokens("space-y-1.5", getSpacingClasses({ gapY: "01" }))}>
              <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                <span className="text-primary mt-0.5">•</span>
                <span>管理者による承認を待つ</span>
              </li>
              <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                <span className="text-primary mt-0.5">•</span>
                <span>承認/却下の通知を受け取る</span>
              </li>
              <li className={combineTokens("flex items-start gap-2", getTypography({ size: "sm" }), "text-muted-foreground")}>
                <span className="text-primary mt-0.5">•</span>
                <span>承認された報告がマップに表示される</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
