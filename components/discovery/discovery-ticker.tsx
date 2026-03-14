"use client"

import { useEffect, useRef, useState } from "react"
import type { TickerItem } from "@/types/spot"
import { cn } from "@/lib/utils"

interface DiscoveryTickerProps {
  items: TickerItem[]
  isLoading?: boolean
  className?: string
}

/**
 * グローバル・ティッカー: 直近の世界の動きを一行で流す
 */
export function DiscoveryTicker({
  items,
  isLoading = false,
  className,
}: DiscoveryTickerProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const tickerItems =
    items.length > 0
      ? items
      : [{ id: "loading", type: "discovery" as const, createdAt: "", locationName: "", message: "ティッカーを読み込み中..." }]

  useEffect(() => {
    const element = trackRef.current
    if (!element) return

    const updateWidth = () => {
      setTrackWidth(element.scrollWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [tickerItems])

  if (items.length === 0 && !isLoading) {
    return (
      <div
        className={cn(
          "h-10 px-4 flex items-center border-t border-border",
          "bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
          "text-base text-muted-foreground",
          className
        )}
      >
        まだ新しい動きはありません。
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-10 px-4 flex items-center border-t border-border overflow-hidden",
        "bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
        "text-base text-muted-foreground",
        className
      )}
      aria-live="polite"
    >
      <div
        className="ticker-marquee"
        style={
          trackWidth > 0
            ? ({
                ["--ticker-track-width" as string]: `${trackWidth}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {[0, 1].map((loopIndex) => (
          <div
            key={loopIndex}
            ref={loopIndex === 0 ? trackRef : undefined}
            className="ticker-track flex items-center gap-6 whitespace-nowrap pr-6"
            aria-hidden={loopIndex === 1}
          >
            {tickerItems.map((item) => (
              <span key={`${loopIndex}-${item.id}`} className="inline-flex items-center gap-6">
                <span className="font-medium text-foreground">{item.message}</span>
                <span className="text-muted-foreground/60">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        .ticker-marquee {
          display: flex;
          width: max-content;
          animation: ticker-marquee 42s linear infinite;
          will-change: transform;
        }

        .ticker-track {
          flex-shrink: 0;
        }

        @keyframes ticker-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-1 * var(--ticker-track-width, 0px)));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
