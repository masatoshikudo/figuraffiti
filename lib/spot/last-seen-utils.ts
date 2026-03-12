import { AHHHUM_CONFIG } from "@/lib/constants"

/**
 * lastSeen から鮮度レベルを算出
 */
export function getFreshnessLevel(lastSeen: string | null | undefined): "high" | "medium" | "low" {
  if (!lastSeen) return "low"
  const then = new Date(lastSeen).getTime()
  const now = Date.now()
  const hoursAgo = (now - then) / (1000 * 60 * 60)
  const daysAgo = hoursAgo / 24

  if (hoursAgo <= AHHHUM_CONFIG.FRESHNESS_HOURS_HIGH) return "high"
  if (daysAgo <= AHHHUM_CONFIG.FRESHNESS_DAYS_MEDIUM) return "medium"
  return "low"
}

/**
 * lastSeen からサークル色を取得
 */
export function getCircleColor(lastSeen: string | null | undefined): string {
  const level = getFreshnessLevel(lastSeen)
  return level === "high"
    ? AHHHUM_CONFIG.CIRCLE_COLORS.HIGH
    : level === "medium"
      ? AHHHUM_CONFIG.CIRCLE_COLORS.MEDIUM
      : AHHHUM_CONFIG.CIRCLE_COLORS.LOW
}

/**
 * Last Seen の相対表示テキスト（日本語）
 */
export function formatLastSeen(lastSeen: string | null | undefined): string {
  if (!lastSeen) return "未記録"
  const then = new Date(lastSeen).getTime()
  const now = Date.now()
  const seconds = Math.floor((now - then) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "Just now"
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return "1 day ago"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}
