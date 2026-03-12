'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Map, Menu } from "lucide-react"
import { getSpacingClasses, getTypography, getColor, combineTokens } from "@/lib/design/design-tokens"
import { UserMenu } from "@/components/auth/user-menu"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

type SiteHeaderVariant = "page" | "overlay"

export function SiteHeader({ variant = "page" }: { variant?: SiteHeaderVariant }) {
  const isOverlay = variant === "overlay"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        "z-50 w-full",
        isOverlay ? "fixed top-3 left-0 right-0 pointer-events-none" : "sticky top-0",
      )}
    >
      <div className={cn("h-12 max-w-screen-2xl mx-auto", !isOverlay && "px-spacing-02 md:px-spacing-04")}>
        {/* モバイル: ハンバーガーメニュー */}
        <div className={cn("flex h-12 md:hidden items-center justify-between", isOverlay && "pointer-events-auto px-spacing-02")}>
          {/* ロゴ */}
          <div className={combineTokens("flex items-center", getSpacingClasses({ gap: "01" }))}>
            <div className={combineTokens("flex h-8 w-8 items-center justify-center rounded-md", getColor("primary"))}>
              <MapPin className="h-5 w-5" />
            </div>
            <span className={getTypography({ size: "xl", weight: "bold" }) + " tracking-tight"}>
              AhhHum
            </span>
          </div>

          {/* ハンバーガーメニュー */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="pointer-events-auto">
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className={combineTokens("flex h-6 w-6 items-center justify-center rounded-md", getColor("primary"))}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="tracking-tight">
                    AhhHum
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-4">
                {/* ナビゲーション */}
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2 rounded-md transition-colors",
                      getTypography({ size: "sm", weight: "medium" }),
                      "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    探し方
                  </Link>
                  <Link
                    href="/guidelines"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2 rounded-md transition-colors",
                      getTypography({ size: "sm", weight: "medium" }),
                      "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    ガイドライン
                  </Link>
                </nav>

                <Separator />

                {/* マップボタン */}
                <Button size="sm" className="font-bold w-full justify-start" asChild>
                  <Link href="/discover/mapping" onClick={() => setMobileMenuOpen(false)}>
                    <Map className="mr-2 h-4 w-4" />
                    マップを見る
                  </Link>
                </Button>

                <Separator />

                {/* ユーザーメニュー */}
                <div className="px-3">
                  <UserMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* PC: BENTO型レイアウト（全要素を1つのカードにまとめて中央配置） */}
        <div className={cn("hidden md:flex md:h-12 md:items-center md:justify-center", isOverlay && "pointer-events-auto")}>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 transition-all",
              "bg-card border border-border/50 shadow-sm hover:shadow-md",
            )}
          >
            {/* ロゴ */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 transition-colors",
                "hover:text-foreground",
                getTypography({ size: "sm", weight: "bold" }),
              )}
            >
              <div className={combineTokens("flex h-6 w-6 items-center justify-center rounded-md", getColor("primary"))}>
                <MapPin className="h-4 w-4" />
              </div>
              <span className="tracking-tight">
                AhhHum
              </span>
            </Link>

            {/* セパレーター */}
            <div className="h-6 w-px bg-border/50" />

            {/* ナビゲーション */}
            <Link
              href="/how-it-works"
              className={cn(
                "px-2 py-1 rounded transition-colors",
                getTypography({ size: "sm", weight: "medium" }),
                "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              探し方
            </Link>

            <Link
              href="/guidelines"
              className={cn(
                "px-2 py-1 rounded transition-colors",
                getTypography({ size: "sm", weight: "medium" }),
                "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              ガイドライン
            </Link>

            {/* セパレーター */}
            <div className="h-6 w-px bg-border/50" />

            {/* ユーザーメニュー */}
            <UserMenu />

            {/* マップボタン */}
            <Button size="sm" className="font-bold" asChild>
              <Link href="/discover/mapping">
                <Map className="mr-2 h-4 w-4" />
                マップを見る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
