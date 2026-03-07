import type { Spot } from "@/types/spot"
import type { DbSpot, DbSpotMedia } from "@/types/database"

/**
 * データベースの形式をアプリケーションの形式に変換
 */
export function dbToSpot(dbSpot: DbSpot, media: DbSpotMedia[]): Spot {
  return {
    id: dbSpot.id,
    title: dbSpot.title || null,
    skater: dbSpot.skater || null,
    trick: dbSpot.trick || null,
    spotName: dbSpot.spot_name || "",
    prefecture: dbSpot.prefecture || undefined,
    address: dbSpot.address || undefined,
    lat: dbSpot.lat,
    lng: dbSpot.lng,
    year: dbSpot.year || undefined,
    media: media.map((m) => ({
      type: m.type === "article" ? "cover" : m.type, // 'article'を'cover'に変換
      source: m.source,
      url: m.url,
      thumbUrl: m.thumb_url || undefined,
    })),
    credit: dbSpot.credit || undefined,
    note: dbSpot.note || undefined,
    tags: dbSpot.tags || undefined,
    createdAt: dbSpot.created_at,
    updatedAt: dbSpot.updated_at || undefined,
    // 承認制関連のフィールド
    status: dbSpot.status || undefined,
    submittedBy: dbSpot.submitted_by || undefined,
    approvedBy: dbSpot.approved_by || undefined,
    approvedAt: dbSpot.approved_at || undefined,
    rejectionReason: dbSpot.rejection_reason || undefined,
  }
}

/**
 * アプリケーションの形式をデータベースの形式に変換
 */
export function spotToDb(spot: Partial<Spot>) {
  const dbData: any = {
    title: spot.title || spot.spotName || "",
    skater: spot.skater || "",
    trick: spot.trick || "",
    spot_name: spot.spotName || "",
    prefecture: spot.prefecture || null,
    lat: spot.lat,
    lng: spot.lng,
    year: spot.year || null,
    credit: spot.credit || null,
    note: spot.note || null,
    tags: spot.tags || null,
    // 承認制関連のフィールド（提供されている場合のみ）
    ...(spot.status && { status: spot.status }),
    ...(spot.submittedBy && { submitted_by: spot.submittedBy }),
    ...(spot.approvedBy && { approved_by: spot.approvedBy }),
    ...(spot.approvedAt && { approved_at: spot.approvedAt }),
    ...(spot.rejectionReason && { rejection_reason: spot.rejectionReason }),
  }

  // addressフィールドを追加（提供されている場合のみ）
  // スキーマキャッシュの問題を回避するため、undefinedの場合は追加しない
  if (spot.address !== undefined && spot.address !== null) {
    dbData.address = spot.address
  } else if (spot.address === null) {
    // nullが明示的に渡された場合はnullを設定
    dbData.address = null
  }
  // undefinedの場合はaddressフィールドを追加しない（スキーマキャッシュエラー回避）

  return dbData
}

/**
 * メディアデータをデータベース形式に変換
 */
export function mediaToDb(media: Spot["media"][number], spotId: string) {
  return {
    spot_id: spotId,
    type: media.type,
    source: media.source,
    url: media.url,
    thumb_url: media.thumbUrl || null,
  }
}

