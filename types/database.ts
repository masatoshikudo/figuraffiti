/**
 * データベースの型定義
 */

import type { Database } from "@/lib/database.types"

// Supabaseのデータベーススキーマから生成された型を使用
// ただし、実際のスキーマではtitle, skater, trickはnullを許可しているため、型を調整
// 承認制関連のカラムも追加
export type DbSpot = Omit<Database["public"]["Tables"]["spots"]["Row"], "title" | "skater" | "trick"> & {
  title: string | null
  skater: string | null
  trick: string | null
  address?: string | null // 住所（逆ジオコーディングで取得）
  updated_at?: string | null // 更新日時
  // 承認制関連のフィールド（マイグレーションで追加されたカラム）
  status?: "pending" | "approved" | "rejected" | null
  submitted_by?: string | null
  approved_by?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
}
export type DbSpotMedia = Database["public"]["Tables"]["spot_media"]["Row"]

// Supabaseエラーの型定義
export interface SupabaseError {
  message: string
  code?: string
  hint?: string
  details?: string
}

// Mapboxエラーの型定義
export interface MapboxError {
  error?: {
    message: string
    type?: string
    status?: number | string
    url?: string
  }
  message?: string
  type?: string
  status?: number | string
  url?: string
  tile?: unknown
}

