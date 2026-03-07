// SNS URLの判定とパース用ユーティリティ

export type SocialPlatform = 'Instagram' | 'YouTube' | 'Twitter' | 'X' | 'Threads' | 'Other'

export interface ParsedUrl {
  platform: SocialPlatform
  url: string
  isValid: boolean
}

/**
 * URLから重複を検出して最初の有効なURLを抽出
 */
function extractFirstValidUrl(url: string): string {
  // URLが重複している場合（同じURLが2回以上繰り返されている）
  // 例: https://example.com/pathhttps://example.com/path
  // または: https://example.com/path?param=valuehttps://example.com/path?param=value
  
  // https://またはhttp://で始まるURLパターンを検出
  const urlPattern = /https?:\/\/[^\s]+/g
  const matches = url.match(urlPattern)
  
  if (matches && matches.length > 1) {
    // 最初のURLを返す
    // デバッグ用ログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('重複URLを検出:', { original: url, extracted: matches[0] })
    }
    return matches[0]
  }
  
  return url
}

/**
 * Instagram URLを正規化（クエリパラメータを削除して基本URLのみを保持）
 */
function normalizeInstagramUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // パスとクエリパラメータを分離
    const pathname = urlObj.pathname
    // 基本URL + パスのみを返す（クエリパラメータを削除）
    return `${urlObj.protocol}//${urlObj.host}${pathname}`
  } catch {
    // URL解析に失敗した場合は元のURLを返す
    return url
  }
}

/**
 * URLからSNSプラットフォームを判定
 */
export function detectSocialPlatform(url: string): ParsedUrl {
  if (!url || typeof url !== 'string') {
    return { platform: 'Other', url, isValid: false }
  }

  // URLの正規化（空白を削除、重複を検出）
  let normalizedUrl = url.trim()
  
  // 重複したURLを検出して最初の有効なURLのみを抽出
  normalizedUrl = extractFirstValidUrl(normalizedUrl)

  // Threads URLパターン（Instagramの前にチェック）
  // https://www.threads.net/@username/post/123456 または threads.net/@username/post/123456
  const threadsPattern = /(?:https?:\/\/)?(?:www\.)?threads\.net\/@[\w.]+\/post\/([A-Za-z0-9_-]+)/i
  if (threadsPattern.test(normalizedUrl)) {
    return {
      platform: 'Threads',
      url: normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`,
      isValid: true,
    }
  }

  // Instagram URLパターン
  // https://www.instagram.com/p/ABC123/ または instagram.com/p/ABC123/
  const instagramPattern = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i
  if (instagramPattern.test(normalizedUrl)) {
    // URLを正規化（http/httpsを追加）
    let cleanUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`
    // Instagram URLを正規化（クエリパラメータを削除）
    cleanUrl = normalizeInstagramUrl(cleanUrl)
    return {
      platform: 'Instagram',
      url: cleanUrl,
      isValid: true,
    }
  }

  // YouTube URLパターン
  // https://www.youtube.com/watch?v=ABC123 または youtu.be/ABC123
  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
  if (youtubePattern.test(normalizedUrl)) {
    return {
      platform: 'YouTube',
      url: normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`,
      isValid: true,
    }
  }

  // Twitter/X URLパターン
  // https://twitter.com/username/status/123456 または x.com/username/status/123456
  const twitterPattern = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i
  if (twitterPattern.test(normalizedUrl)) {
    return {
      platform: normalizedUrl.includes('x.com') ? 'X' : 'Twitter',
      url: normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`,
      isValid: true,
    }
  }

  // URL形式のチェック（http://またはhttps://で始まる）
  const urlPattern = /^https?:\/\/.+/
  if (urlPattern.test(normalizedUrl)) {
    return {
      platform: 'Other',
      url: normalizedUrl,
      isValid: true,
    }
  }

  return { platform: 'Other', url: normalizedUrl, isValid: false }
}

/**
 * URLが有効な動画URLかチェック
 */
export function isValidVideoUrl(url: string): boolean {
  const parsed = detectSocialPlatform(url)
  return parsed.isValid && parsed.platform !== 'Other'
}

