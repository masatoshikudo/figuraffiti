"use client"

import type { DiscoveryLog } from "@/types/spot"
import { cn } from "@/lib/utils"

interface DiscoveryTickerProps {
  discoveries: DiscoveryLog[]
  isLoading?: boolean
  className?: string
}

/**
 * グローバル・ティッカー: 発見ログを一行で流す
 * 表示形式: "User_X just found #N in [地名]."
 */
export function DiscoveryTicker({
  discoveries,
  isLoading = false,
  className,
}: DiscoveryTickerProps) {

  if (discoveries.length === 0 && !isLoading) {
    return (
      <div
        className={cn(
          "h-10 px-4 flex items-center border-t border-border",
          "bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
          "text-sm text-muted-foreground",
          className
        )}
      >
        No discoveries yet. Be the first.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-10 px-4 flex items-center border-t border-border overflow-x-auto overflow-y-hidden",
        "bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
        "text-sm text-muted-foreground",
        "scroll-smooth",
        className
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-6 whitespace-nowrap">
        {discoveries.map((d) => (
          <span key={d.id} className="inline">
            <span className="font-medium text-foreground">{d.userName}</span>
            {" just found "}
            {d.spotNumber != null ? (
              <>
                <span className="font-medium">#{d.spotNumber}</span>
                {" in "}
              </>
            ) : null}
            <span>{d.locationName}</span>
            .
          </span>
        ))}
      </div>
    </div>
  )
}
