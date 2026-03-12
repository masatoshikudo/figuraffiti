/**
 * ユーザープロフィール関連のユーティリティ関数
 */

import { createClient } from "@/lib/supabase/supabase-server"
import type { UserProfile } from "@/types/user"

/**
 * ユーザープロフィールを取得
 * @param userId ユーザーID
 * @returns ユーザープロフィール（存在しない場合はnull）
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // レコードが見つからない場合
        return null
      }
      console.error("[getUserProfile] Error:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("[getUserProfile] Unexpected error:", error)
    return null
  }
}

/**
 * ユーザープロフィールを作成または更新
 * @param userId ユーザーID
 * @param displayName 表示名
 * @returns 作成/更新されたユーザープロフィール
 */
export async function upsertUserProfile(
  userId: string,
  displayName: string | null
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          display_name: displayName,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single()

    if (error) {
      console.error("[upsertUserProfile] Error:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("[upsertUserProfile] Unexpected error:", error)
    return null
  }
}


