import type { Database } from "@/lib/database.types"
import type { CoCreateSubmission } from "@/types/co-create"

type DbCoCreateSubmission = Database["public"]["Tables"]["co_create_submissions"]["Row"]

export function dbToCoCreateSubmission(dbRow: DbCoCreateSubmission): CoCreateSubmission {
  return {
    id: dbRow.id,
    title: dbRow.title,
    intentText: dbRow.intent_text,
    lat: dbRow.lat,
    lng: dbRow.lng,
    mediaUrl: dbRow.media_url,
    mediaType: dbRow.media_type as CoCreateSubmission["mediaType"],
    mediaSource: dbRow.media_source as CoCreateSubmission["mediaSource"],
    status: dbRow.status as CoCreateSubmission["status"],
    submittedBy: dbRow.submitted_by,
    reviewedBy: dbRow.reviewed_by,
    reviewedAt: dbRow.reviewed_at,
    reviewComment: dbRow.review_comment,
    linkedSpotId: dbRow.linked_spot_id,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  }
}
