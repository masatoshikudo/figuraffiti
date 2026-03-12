export type CoCreateSubmissionStatus = "pending" | "approved" | "rejected"

export interface CoCreateSubmission {
  id: string
  title: string | null
  intentText: string
  lat: number
  lng: number
  mediaUrl: string
  mediaType: "cover" | "video"
  mediaSource: "Instagram" | "YouTube" | "Twitter" | "X" | "Threads" | "TikTok" | "Other"
  status: CoCreateSubmissionStatus
  submittedBy: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewComment?: string | null
  linkedSpotId?: string | null
  createdAt: string
  updatedAt: string
}
