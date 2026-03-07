/**
 * ユーザープロフィール関連の型定義
 */

export interface UserProfile {
  id: number
  userId: string
  skillLevel: number // 1-10
  levelSetBy: "questionnaire" | "auto_detected" | "manual"
  detectedSkaterName?: string | null
  createdAt: string
  updatedAt: string
}

