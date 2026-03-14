"use client"

import Link from "next/link"
import type { Spot } from "@/types/spot"
import { Button } from "@/components/ui/button"
import { formatLastSeen } from "@/lib/spot/last-seen-utils"
import { Compass, QrCode, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AhhHumSpotDetailProps {
  spot: Spot
  onStartExploration: () => void
  onRecordDiscovery: () => void
  onClose: () => void
  isAuthenticated: boolean
  isStartingExploration?: boolean
}

/**
 * AhhHum Phase1: サークル詳細オーバーレイ
 * #N, 文脈, Last Seen, [NFCで発見を記録する] CTA
 */
export function AhhHumSpotDetail({
  spot,
  onStartExploration,
  onRecordDiscovery,
  onClose,
  isAuthenticated,
  isStartingExploration = false,
}: AhhHumSpotDetailProps) {
  const locationLabel = [spot.prefecture, spot.spotName].filter(Boolean).join(" / ") || "Unknown"
  const contextLabel = spot.context || ""

  return (
    <div
      className={cn(
        "relative rounded-t-2xl bg-card border-t border-l border-r border-border shadow-lg",
        "pb-safe"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            #{spot.spotNumber ?? spot.id.slice(0, 6)} {locationLabel}
          </h3>
          {contextLabel ? (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {contextLabel}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -m-2 rounded-full hover:bg-muted transition-colors"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Last Seen</p>
          <p className="text-lg font-medium">
            {formatLastSeen(spot.lastSeen)}
          </p>
        </div>

        {spot.characterSlug ? (
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/characters/${spot.characterSlug}`}>
              <Sparkles className="h-4 w-4 mr-2" />
              キャラクターを見る
            </Link>
          </Button>
        ) : null}

        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onStartExploration}
            disabled={isStartingExploration}
          >
            <Compass className="h-4 w-4 mr-2" />
            {isStartingExploration
              ? "探索開始中..."
              : isAuthenticated
                ? "このスポットを探す"
                : "ログインして探す"}
          </Button>
          <p className="text-xs text-muted-foreground">
            探索宣言は30分で自動終了し、発見成功時にも終了します。
          </p>
        </div>

        <Button
          className="w-full"
          onClick={onRecordDiscovery}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {isAuthenticated
            ? "NFCで発見を記録する"
            : "ログインして発見を記録"}
        </Button>
      </div>
    </div>
  )
}
