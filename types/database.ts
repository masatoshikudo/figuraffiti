/**
 * データベースの型定義
 */

import type { Database } from "@/lib/database.types"

export type DbCoCreateSubmission = Database["public"]["Tables"]["co_create_submissions"]["Row"]
export type DbSpot = Database["public"]["Tables"]["spots"]["Row"]
export type DbNfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"]

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

