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
      spots: {
        Row: {
          id: string
          title: string
          skater: string
          trick: string
          spot_name: string
          prefecture: string | null
          lat: number
          lng: number
          year: number | null
          credit: string | null
          note: string | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          skater: string
          trick: string
          spot_name: string
          prefecture?: string | null
          lat: number
          lng: number
          year?: number | null
          credit?: string | null
          note?: string | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          skater?: string
          trick?: string
          spot_name?: string
          prefecture?: string | null
          lat?: number
          lng?: number
          year?: number | null
          credit?: string | null
          note?: string | null
          tags?: string[] | null
          created_at?: string
        }
      }
      spot_media: {
        Row: {
          id: number
          spot_id: string
          type: 'cover' | 'article' | 'video'
          source: 'Instagram' | 'YouTube' | 'Twitter' | 'X' | 'Threads' | 'TikTok' | 'Other'
          url: string
          thumb_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          spot_id: string
          type: 'cover' | 'article' | 'video'
          source: 'Instagram' | 'YouTube' | 'Twitter' | 'X' | 'Threads' | 'TikTok' | 'Other'
          url: string
          thumb_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          spot_id?: string
          type?: 'cover' | 'article' | 'video'
          source?: 'Instagram' | 'YouTube' | 'TikTok' | 'Other'
          url?: string
          thumb_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

