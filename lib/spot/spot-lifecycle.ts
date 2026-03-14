import type { Spot } from "@/types/spot"

export type SpotLifecycleState =
  | "pending_release"
  | "live"
  | "archived"
  | "expired"

export function isSpotArchived(spot: Pick<Spot, "archivedAt">) {
  return Boolean(spot.archivedAt)
}

export function isSpotExpired(
  spot: Pick<Spot, "expiresAt">,
  now: Date = new Date()
) {
  if (!spot.expiresAt) return false

  const expiresAt = new Date(spot.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) return false

  return expiresAt.getTime() <= now.getTime()
}

export function isSpotReleased(
  spot: Pick<Spot, "visibleAfter">,
  now: Date = new Date()
) {
  if (!spot.visibleAfter) return true

  const visibleAt = new Date(spot.visibleAfter)
  if (Number.isNaN(visibleAt.getTime())) return true

  return visibleAt.getTime() <= now.getTime()
}

export function isSpotPubliclyVisible(
  spot: Pick<Spot, "visibleAfter" | "archivedAt" | "expiresAt">,
  now: Date = new Date()
) {
  return (
    !isSpotArchived(spot) &&
    !isSpotExpired(spot, now) &&
    isSpotReleased(spot, now)
  )
}

export function getSpotLifecycleState(
  spot: Pick<Spot, "visibleAfter" | "archivedAt" | "expiresAt">,
  now: Date = new Date()
): SpotLifecycleState {
  if (isSpotArchived(spot)) return "archived"
  if (isSpotExpired(spot, now)) return "expired"
  if (!isSpotReleased(spot, now)) return "pending_release"
  return "live"
}
