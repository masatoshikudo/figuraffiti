import type { Spot } from "@/types/spot"
import type { DbSpot } from "@/types/database"
import { createCharacterSlug } from "@/lib/character/character-utils"

/**
 * データベースの形式をアプリケーションの形式に変換
 * Phase1: spot_media 廃止、cover_url のみ対応
 */
export function dbToSpot(dbSpot: DbSpot): Spot {
  const media: Spot["media"] = []
  if (dbSpot.cover_url) {
    media.push({ type: "cover", source: "Other", url: dbSpot.cover_url })
  }
  const spot: Spot = {
    id: dbSpot.id,
    spotName: dbSpot.spot_name || "",
    context: dbSpot.context ?? undefined,
    prefecture: dbSpot.prefecture || undefined,
    lat: dbSpot.lat,
    lng: dbSpot.lng,
    displayLat: dbSpot.display_lat ?? undefined,
    displayLng: dbSpot.display_lng ?? undefined,
    media,
    createdAt: dbSpot.created_at,
    updatedAt: dbSpot.updated_at || undefined,
    status: dbSpot.status || undefined,
    submittedBy: dbSpot.submitted_by || undefined,
    approvedBy: dbSpot.approved_by || undefined,
    approvedAt: dbSpot.approved_at || undefined,
    rejectionReason: dbSpot.rejection_reason || undefined,
    expiresAt: dbSpot.expires_at ?? undefined,
    archivedAt: dbSpot.archived_at ?? undefined,
    archiveReason: dbSpot.archive_reason ?? undefined,
    lastSeen: dbSpot.last_seen ?? undefined,
    spotNumber: dbSpot.spot_number ?? undefined,
    visibleAfter: dbSpot.visible_after ?? undefined,
  }

  spot.characterSlug = createCharacterSlug(spot)
  return spot
}

/**
 * アプリケーションの形式をデータベースの形式に変換
 */
export function spotToDb(spot: Partial<Spot>) {
  const dbData: Record<string, unknown> = {
    spot_name: spot.spotName || "",
    context: spot.context ?? null,
    prefecture: spot.prefecture || null,
    lat: spot.lat,
    lng: spot.lng,
    display_lat: spot.displayLat ?? null,
    display_lng: spot.displayLng ?? null,
    visible_after: spot.visibleAfter ?? null,
    ...(spot.status && { status: spot.status }),
    ...(spot.submittedBy && { submitted_by: spot.submittedBy }),
    ...(spot.approvedBy && { approved_by: spot.approvedBy }),
    ...(spot.approvedAt && { approved_at: spot.approvedAt }),
    ...(spot.rejectionReason && { rejection_reason: spot.rejectionReason }),
    ...(spot.expiresAt !== undefined && { expires_at: spot.expiresAt }),
    ...(spot.archivedAt !== undefined && { archived_at: spot.archivedAt }),
    ...(spot.archiveReason !== undefined && { archive_reason: spot.archiveReason }),
  }

  // Phase1: cover_url は media[0].url から設定
  if (spot.media?.[0]?.url) {
    dbData.cover_url = spot.media[0].url
  }

  return dbData
}

/**
 * メディアから cover_url を取得（Phase1: spot_media 廃止のため参照用）
 */
export function getCoverUrlFromMedia(media: Spot["media"]): string | null {
  return media?.[0]?.url ?? null
}

