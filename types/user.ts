/**
 * ユーザープロフィール関連の型定義
 */

export interface UserProfile {
  id: number
  userId: string
  displayName: string | null
  createdAt: string
  updatedAt: string
}

