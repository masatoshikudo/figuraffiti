import { createClient } from "@/lib/supabase/supabase-server"

/**
 * ユーザーが管理者かどうかを確認
 */
export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) {
    return false
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * ユーザーが信頼ユーザーかどうかを確認
 * Phase1: trusted_users テーブル廃止のため常に false
 */
export async function isTrustedUser(_userId: string | null): Promise<boolean> {
  return false
}

/**
 * 管理者権限を要求する（APIルート用）
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: "認証が必要です" }
  }

  const admin = await isAdmin(user.id)
  if (!admin) {
    return { user: null, error: "管理者権限が必要です" }
  }

  return { user, error: null }
}

/**
 * すべての管理者のメールアドレスを取得
 * 注意: この関数はService Role Keyが必要です。通常のSupabaseクライアントでは使用できません。
 * Edge Functionから呼び出すか、Service Role Keyを使用する必要があります。
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    const supabase = await createClient()
    
    // admin_usersテーブルから管理者のuser_idを取得
    const { data: adminUsers, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.warn("No admin users found or error fetching admin users:", adminError)
      return []
    }

    // 注意: auth.admin.getUserByIdはService Role Keyが必要です
    // 通常のSupabaseクライアントでは使用できないため、Edge Functionを使用することを推奨します
    // ここでは、Edge Functionを呼び出す方法を推奨します
    console.warn("getAdminEmails: Service Role Key required. Use Edge Function instead.")
    return []
  } catch (error) {
    console.error("Error getting admin emails:", error)
    return []
  }
}
