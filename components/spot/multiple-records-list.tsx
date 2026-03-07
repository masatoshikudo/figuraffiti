"use client"

import { useEffect, useState, type CSSProperties } from "react"
import type { Spot } from "@/types/spot"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ExternalLink, MapPin, User, X } from "lucide-react"
import Image from "next/image"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import { useIsMobile } from "@/hooks/use-mobile"
import { selectRepresentativeRecord } from "@/lib/spot/spot-utils"

interface MultipleRecordsListProps {
  spots: Spot[]
  onSelectSpot: (spot: Spot) => void
  onClose?: () => void
}

const HEADER_HEIGHT = 72

export function MultipleRecordsList({ spots, onSelectSpot, onClose }: MultipleRecordsListProps) {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  // 代表記録を選定
  const representativeRecord = selectRepresentativeRecord(spots)

  useEffect(() => {
    const timeout = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(timeout)
  }, [])

  const handleToggle = () => setIsOpen((prev) => !prev)

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
    <article className={windowClass} role="dialog" aria-label={`この場所の記録 (${spots.length}件)`} aria-expanded={isOpen}>
      <div className={headerClass} style={headerStyle}>
        <div className="flex items-center gap-2">
          <button type="button" className="spot-window__toggle" aria-label="ウィンドウの開閉" onClick={handleToggle}>
            <ChevronDown
              className={combineTokens(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
          <div className={combineTokens("flex items-center gap-2", getSpacingClasses({ gap: "02" }))}>
            <MapPin className="h-4 w-4 text-primary" />
            <span className={combineTokens(getTypography({ size: "sm", weight: "medium" }))}>
              この場所の記録 ({spots.length}件)
            </span>
          </div>
        </div>

        {onClose && (
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
        )}
      </div>

      <div className={bodyClass}>
        <div className={combineTokens("space-y-2 max-h-[60vh] overflow-y-auto", getSpacingClasses({ gapY: "02" }))}>
          {spots.map((spot) => {
            const media = spot.media?.[0]
            return (
              <div
                key={spot.id}
                className={combineTokens(
                  "cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent/50",
                  getSpacingClasses({ p: "04" })
                )}
                onClick={() => onSelectSpot(spot)}
              >
                <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "02" }))}>
                  {/* 技名とバッジ */}
                  <div className="flex items-center gap-2">
                    {spot.trick && (
                      <p className={combineTokens(getTypography({ size: "lg", weight: "bold" }), "text-foreground")}>
                        {spot.trick}
                      </p>
                    )}
                    {/* 代表スポットバッジ（一覧の先頭） */}
                    {representativeRecord && representativeRecord.id === spot.id && (
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        ⭐ 代表
                      </Badge>
                    )}
                  </div>

                  {/* サムネイル */}
                  {media?.thumbUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={media.thumbUrl || "/placeholder.svg"}
                        alt={spot.trick || spot.spotName}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 300px, 90vw"
                      />
                    </div>
                  )}

                  {/* メタ情報 */}
                  <div className={combineTokens("flex flex-wrap items-center gap-3", getSpacingClasses({ gap: "03" }))}>
                    {spot.year && (
                      <div className={combineTokens("flex items-center gap-1 text-sm", getSpacingClasses({ gap: "01" }))}>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{spot.year}年</span>
                      </div>
                    )}
                    {spot.skater && (
                      <div className={combineTokens("flex items-center gap-1 text-sm", getSpacingClasses({ gap: "01" }))}>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{spot.skater}</span>
                      </div>
                    )}
                  </div>

                  {/* ソースバッジ */}
                  {media?.source && (
                    <div>
                      <Badge variant="secondary" className="capitalize">
                        {media.source}
                      </Badge>
                    </div>
                  )}

                  {/* メディアリンク */}
                  {media?.url && (
                    <Button variant="outline" size="sm" className="w-full" asChild onClick={(e) => e.stopPropagation()}>
                      <a href={media.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        メディアを見る
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}

