import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Twitter, Instagram, Github } from "lucide-react"
import { getSpacingClasses, getTypography, combineTokens, getGridClasses } from "@/lib/design/design-tokens"
import { EXTERNAL_URLS } from "@/lib/constants"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className={combineTokens("container mx-auto", getSpacingClasses({ px: "02", py: "08" }), "md:py-spacing-10")}>
        <div className={combineTokens(getGridClasses({ cols: 4, gap: "loose", responsive: true }), "lg:grid-cols-4")}>
          <div className="lg:col-span-2">
            <div className={combineTokens("mb-6 flex items-center", getSpacingClasses({ gap: "01" }))}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <span className={combineTokens(getTypography({ size: "xl", weight: "bold" }), "tracking-tight")}>
                Figuraffiti
              </span>
            </div>
            <h3 className={combineTokens("mb-6 tracking-tight", getTypography({ size: "3xl", weight: "bold" }))}>
              都市の余白に
              <br />
              物語を
            </h3>
            <p className={combineTokens("mb-8 max-w-md text-muted-foreground")}>
              街に隠れた立体グラフィティを探し、発見を記録・共有する。
              <br />
              承認された報告がマップに表示されます。
            </p>
            <div className={combineTokens("flex", getSpacingClasses({ gap: "02" }))}>
              <Button size="lg" className="font-bold" asChild>
                <Link href="/mapping">
                  マップを見る
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
              使い方
            </h4>
            <ul className={combineTokens("space-y-3", getTypography({ size: "sm" }))}>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  探し方
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">
                  ガイドライン
                </Link>
              </li>
              <li>
                <Link href="/mapping" className="text-muted-foreground hover:text-primary transition-colors">
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
              規約
            </h4>
            <ul className={combineTokens("space-y-3", getTypography({ size: "sm" }))}>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={combineTokens(
            "mt-16 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row",
            getSpacingClasses({ gap: "03" }),
          )}
        >
          <p className={combineTokens("text-muted-foreground", getTypography({ size: "xs" }))}>
            © 2025 Skateright. All rights reserved.
          </p>
          <div className={combineTokens("flex", getSpacingClasses({ gap: "02" }))}>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href={EXTERNAL_URLS.THREADS || "#"} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Image
                src="/threads-logo-black.svg"
                alt="Threads"
                width={20}
                height={20}
                className="h-5 w-5"
                loading="lazy"
              />
              <span className="sr-only">Threads</span>
            </Link>
            {/* Discord 連携は無効（外部連携を切断） */}
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
