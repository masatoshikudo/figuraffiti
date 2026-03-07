"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import type { Spot } from "@/types/spot"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ExternalLink, MapPin, User, X, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import { useIsMobile } from "@/hooks/use-mobile"

interface SpotWindowProps {
  spot: Spot
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  showBackButton?: boolean
  onBack?: () => void
}

const HEADER_HEIGHT = 72

export function SpotWindow({
  spot,
  isOpen,
  onToggle,
  onClose,
  showBackButton = false,
  onBack,
}: SpotWindowProps) {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeout = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(timeout)
  }, [])

  const media = useMemo(() => spot.media?.[0], [spot.media])

  const windowClass = combineTokens(
    "spot-window",
    getSpacingClasses({ p: "02" }),
    isVisible ? "spot-window--visible" : "",
    isOpen ? "spot-window--open" : "spot-window--collapsed"
  )

  const bodyClass = combineTokens(
    "spot-window__body flex flex-col",
    isOpen ? "spot-window__body--open" : "spot-window__body--collapsed",
    getSpacingClasses({ px: "04", py: "04", gapY: "04" })
  )

  const headerClass = combineTokens("spot-window__header", getSpacingClasses({ px: "03", py: "03" }))

  const headerStyle: CSSProperties = {
    minHeight: HEADER_HEIGHT,
  }

  return (
    <article className={windowClass} role="dialog" aria-label={`${spot.spotName}のウィンドウ`} aria-expanded={isOpen}>
      <div className={headerClass} style={headerStyle}>
        <div className="flex items-center gap-2">
          {showBackButton && onBack && (
            <button
              type="button"
              className="spot-window__back"
              onClick={(event) => {
                event.stopPropagation()
                onBack()
              }}
              aria-label="リストに戻る"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" className="spot-window__toggle" aria-label="ウィンドウの開閉" onClick={onToggle}>
            <ChevronDown
              className={combineTokens(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          type="button"
          className="spot-window__close"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          aria-label="ウィンドウを閉じる"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className={bodyClass}>
        <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "01" }))}>
          <p className={combineTokens(getTypography({ size: "lg", weight: "bold" }), "text-foreground")}>
            {spot.title || spot.spotName}
          </p>
          <p
            className={combineTokens(
              getTypography({ size: "sm" }),
              "text-muted-foreground flex items-center gap-1"
            )}
          >
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span>
              {spot.spotName}
              {spot.prefecture && ` · ${spot.prefecture}`}
            </span>
          </p>
        </div>

        {media?.thumbUrl && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden">
            <Image
              src={media.thumbUrl || "/placeholder.svg"}
              alt={spot.title || spot.spotName}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 600px, 90vw"
              priority={!isMobile}
            />
          </div>
        )}

        <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "03" }))}>
          {spot.trick && (
            <p className={combineTokens(getTypography({ size: "lg" }), "text-muted-foreground")}>{spot.trick}</p>
          )}

          <div className={combineTokens("flex flex-wrap", getSpacingClasses({ gap: "02" }))}>
            {media?.source && (
              <Badge variant="secondary" className="capitalize">
                {media.source}
              </Badge>
            )}
            {spot.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className={combineTokens("grid", getSpacingClasses({ gap: "03" }))}>
          {spot.skater && (
            <div className={combineTokens("flex items-center text-sm text-foreground", getSpacingClasses({ gap: "02" }))}>
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{spot.skater}</span>
            </div>
          )}

          {spot.year && (
            <div className={combineTokens("flex items-center text-sm", getSpacingClasses({ gap: "02" }))}>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{spot.year}</span>
            </div>
          )}

          {spot.credit && (
            <p className={combineTokens(getTypography({ size: "sm" }), "text-muted-foreground")}>{spot.credit}</p>
          )}
        </div>

        {spot.note && (
          <div className={combineTokens("rounded-xl border border-border bg-muted", getSpacingClasses({ p: "03" }))}>
            <p className={getTypography({ size: "sm" })}>{spot.note}</p>
          </div>
        )}

        {media?.url && (
          <div className={combineTokens("flex flex-wrap", getSpacingClasses({ gap: "02" }))}>
            <Button variant="outline" className="flex-1" asChild>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                メディアを見る
              </a>
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}

