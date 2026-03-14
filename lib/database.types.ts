// Supabaseデータベースの型定義
// このファイルは後で `supabase gen types typescript` コマンドで自動生成できます

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      co_create_submissions: {
        Row: {
          id: string
          title: string | null
          intent_text: string
          lat: number
          lng: number
          media_url: string
          media_type: string
          media_source: string
          status: string
          submitted_by: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_comment: string | null
          linked_spot_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          intent_text: string
          lat: number
          lng: number
          media_url: string
          media_type?: string
          media_source?: string
          status?: string
          submitted_by: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_comment?: string | null
          linked_spot_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          intent_text?: string
          lat?: number
          lng?: number
          media_url?: string
          media_type?: string
          media_source?: string
          status?: string
          submitted_by?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_comment?: string | null
          linked_spot_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nfc_tags: {
        Row: {
          id: string
          token: string
          spot_id: string
          is_active: boolean
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          spot_id: string
          is_active?: boolean
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          spot_id?: string
          is_active?: boolean
          note?: string | null
          created_at?: string
        }
      }
      spots: {
        Row: {
          id: string
          spot_name: string
          context: string | null
          prefecture: string | null
          lat: number
          lng: number
          display_lat: number | null
          display_lng: number | null
          status: string
          submitted_by: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          expires_at: string | null
          archived_at: string | null
          archive_reason: string | null
          last_seen: string | null
          spot_number: number | null
          visible_after: string | null
          cover_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spot_name?: string
          context?: string | null
          prefecture?: string | null
          lat: number
          lng: number
          display_lat?: number | null
          display_lng?: number | null
          status?: string
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          expires_at?: string | null
          archived_at?: string | null
          archive_reason?: string | null
          last_seen?: string | null
          spot_number?: number | null
          visible_after?: string | null
          cover_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          spot_name?: string
          context?: string | null
          prefecture?: string | null
          lat?: number
          lng?: number
          display_lat?: number | null
          display_lng?: number | null
          status?: string
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          expires_at?: string | null
          archived_at?: string | null
          archive_reason?: string | null
          last_seen?: string | null
          spot_number?: number | null
          visible_after?: string | null
          cover_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_discovery: {
        Args: {
          p_spot_id: string
        }
        Returns: {
          success: boolean
          duplicate: boolean
          message: string
        }[]
      }
      record_discovery_by_token: {
        Args: {
          p_token: string
        }
        Returns: {
          success: boolean
          duplicate: boolean
          message: string
          spot_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

