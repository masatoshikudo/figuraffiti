'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Map, Menu } from "lucide-react"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
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
  const overlaySurfaceClass = isOverlay
    ? "border-border/90 bg-background/90 backdrop-blur-xl"
    : "border-border/70 bg-background/45 backdrop-blur-sm"
  const overlayLogoClass = isOverlay
    ? "rounded-full border border-border/90 bg-background/92 px-3 py-1.5 text-foreground backdrop-blur-xl"
    : ""
  const navLinks = [
    { href: "/about", label: "世界観" },
    { href: "/education", label: "遊び方" },
    { href: "/guidelines", label: "ガイド" },
  ]

  return (
    <header
      className={cn(
        "z-50 w-full",
        isOverlay ? "fixed left-0 right-0 top-3 pointer-events-none" : "sticky top-0 border-b border-border/60 bg-background/78 backdrop-blur-xl",
      )}
    >
      <div className={cn("mx-auto max-w-screen-2xl", !isOverlay && "px-spacing-02 md:px-spacing-04")}>
        <div className={cn("flex h-16 items-center justify-between md:hidden", isOverlay && "pointer-events-auto px-spacing-02")}>
          <Link
            href="/"
            className={cn(
              combineTokens("flex items-center", getSpacingClasses({ gap: "01" })),
              overlayLogoClass,
            )}
            aria-label="AhhHum トップへ戻る"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border text-brand",
                isOverlay ? "border-brand/45 bg-brand/16" : "border-brand/30 bg-brand/10",
              )}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <span className={combineTokens("block tracking-tight", getTypography({ size: "lg", weight: "bold" }))}>
                AhhHum
              </span>
              <span className={combineTokens("block", getTypography({ size: "xs" }), "text-muted-foreground")}>
                街の気配を探す
              </span>
            </div>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "pointer-events-auto rounded-full text-foreground",
                  isOverlay
                    ? "border-border/90 bg-background/90 backdrop-blur-xl"
                    : "border-border/70 bg-background/60 backdrop-blur-sm",
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-border bg-background/95 sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="tracking-tight">AhhHum</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-4">
                <p className={cn(getTypography({ size: "sm" }), "px-1 leading-6 text-muted-foreground")}>
                  地図のヒントを頼りに歩いて見つけ、現地で発見を記録できます。
                </p>

                <Button size="sm" className="w-full justify-start rounded-full font-bold" asChild>
                  <Link href="/discover/mapping" onClick={() => setMobileMenuOpen(false)}>
                    <Map className="mr-2 h-4 w-4" />
                    マップで探し始める
                  </Link>
                </Button>

                <Separator />

                <nav className="flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-xl px-3 py-2 transition-colors",
                        getTypography({ size: "sm", weight: "medium" }),
                        "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <Separator />

                <div className="px-3">
                  <UserMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className={cn("hidden h-16 items-center justify-between md:flex", isOverlay && "pointer-events-auto px-spacing-03")}>
          <div className={cn("flex items-center gap-2 rounded-[2rem] border px-3 py-1.5 shadow-[0_10px_30px_rgba(28,34,40,0.06)]", overlaySurfaceClass)}>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-full px-2 py-1 transition-colors hover:text-foreground",
                getTypography({ size: "sm", weight: "bold" }),
              )}
              aria-label="AhhHum トップへ戻る"
            >
              <div
                className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border text-brand",
                  isOverlay ? "border-brand/45 bg-brand/16" : "border-brand/30 bg-brand/10",
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="leading-tight">
                <span
                  className={combineTokens(
                    "block tracking-[0.24em] uppercase",
                    getTypography({ size: "xs", weight: "medium" }),
                    isOverlay ? "text-brand-strong" : "text-brand-strong",
                  )}
                >
                  Urban Trace
                </span>
                <span className={combineTokens("block tracking-tight", isOverlay ? "text-lg font-bold" : getTypography({ size: "xl", weight: "bold" }))}>
                  AhhHum
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-border/60" aria-hidden="true" />

            <nav className="flex items-center gap-1 rounded-full px-1 py-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 transition-colors",
                    getTypography({ size: "sm", weight: "medium" }),
                    isOverlay
                      ? "text-foreground/88 hover:bg-accent/90 hover:text-foreground"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <UserMenu />
            <Button size="sm" className="rounded-full font-bold" asChild>
              <Link href="/discover/mapping">
                <Map className="mr-2 h-4 w-4" />
                マップで探し始める
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
