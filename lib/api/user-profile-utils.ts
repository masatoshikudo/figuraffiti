/**
 * ユーザープロフィール関連のユーティリティ関数
 */

import { createClient } from "@/lib/supabase/supabase-server"
import type { UserProfile } from "@/types/user"
import { USER_SKILL_LEVELS } from "@/lib/constants"

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
      skillLevel: data.skill_level,
      levelSetBy: data.level_set_by,
      detectedSkaterName: data.detected_skater_name,
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
 * @param skillLevel スキルレベル（1-10）
 * @param levelSetBy レベル設定方法
 * @param detectedSkaterName 自動判定の場合のスケーター名（オプション）
 * @returns 作成/更新されたユーザープロフィール
 */
export async function upsertUserProfile(
  userId: string,
  skillLevel: number,
  levelSetBy: "questionnaire" | "auto_detected" | "manual",
  detectedSkaterName?: string | null
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    
    // スキルレベルの範囲チェック
    if (skillLevel < USER_SKILL_LEVELS.MIN || skillLevel > USER_SKILL_LEVELS.MAX) {
      throw new Error(`Skill level must be between ${USER_SKILL_LEVELS.MIN} and ${USER_SKILL_LEVELS.MAX}`)
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          skill_level: skillLevel,
          level_set_by: levelSetBy,
          detected_skater_name: detectedSkaterName || null,
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
      skillLevel: data.skill_level,
      levelSetBy: data.level_set_by,
      detectedSkaterName: data.detected_skater_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("[upsertUserProfile] Unexpected error:", error)
    return null
  }
}


