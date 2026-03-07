// フォームセッション保存用ユーティリティ
// LocalStorageを使用してフォームの状態を保存・復元

const STORAGE_KEY_PREFIX = 'skateright_submit_form_'
const SESSION_EXPIRY_DAYS = 7 // 7日間保持

export interface SavedFormSession {
  formData: {
    lat: number | null
    lng: number | null
    prefecture: string
    spotName: string
    skater: string
    trick: string
    year: string
    credit: string
    videoUrl: string
    isVideoUrlValid: boolean
    mediaType: "cover" | "article" | "video"
    mediaSource: string
    mediaUrl: string
    thumbUrl: string
  }
  currentStep: number
  mode: "sns" | "manual"
  savedAt: string
}

/**
 * フォームセッションを保存
 */
export function saveFormSession(mode: "sns" | "manual", formData: SavedFormSession['formData'], currentStep: number): void {
  if (typeof window === 'undefined') return

  try {
    const session: SavedFormSession = {
      formData,
      currentStep,
      mode,
      savedAt: new Date().toISOString(),
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${mode}`
    localStorage.setItem(storageKey, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save form session:', error)
  }
}

/**
 * フォームセッションを復元
 */
export function loadFormSession(mode: "sns" | "manual"): SavedFormSession | null {
  if (typeof window === 'undefined') return null

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${mode}`
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) return null

    const session: SavedFormSession = JSON.parse(stored)

    // セッションの有効期限チェック
    const savedAt = new Date(session.savedAt)
    const now = new Date()
    const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff > SESSION_EXPIRY_DAYS) {
      // 期限切れのセッションを削除
      clearFormSession(mode)
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to load form session:', error)
    return null
  }
}

/**
 * フォームセッションをクリア
 */
export function clearFormSession(mode: "sns" | "manual"): void {
  if (typeof window === 'undefined') return

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${mode}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear form session:', error)
  }
}

/**
 * すべてのフォームセッションをクリア
 */
export function clearAllFormSessions(): void {
  if (typeof window === 'undefined') return

  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear all form sessions:', error)
  }
}

