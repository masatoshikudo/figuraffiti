// oEmbed API連携用ユーティリティ

export interface OEmbedData {
  html?: string
  thumbnail_url?: string
  title?: string
  author_name?: string
  provider_name?: string
  type?: string
  url?: string
}

/**
 * oEmbed APIから埋め込みデータを取得
 */
export async function fetchOEmbed(url: string, platform: string): Promise<OEmbedData | null> {
  try {
    let oembedUrl = ''

    // プラットフォームごとのoEmbedエンドポイント
    switch (platform) {
      case 'Instagram':
        // InstagramはoEmbedをサポートしていないため、API経由で取得
        // 実際にはInstagram Basic Display APIが必要だが、簡易版としてURLのみ返す
        // URLを正規化（クエリパラメータを削除）
        let normalizedUrl = url
        try {
          const urlObj = new URL(url)
          normalizedUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
        } catch {
          // URL解析に失敗した場合は元のURLを使用
        }
        return {
          url: normalizedUrl,
          provider_name: 'Instagram',
          type: 'rich',
        }
      
      case 'Threads':
        // ThreadsもoEmbedをサポートしていないため、簡易版としてURLのみ返す
        return {
          url,
          provider_name: 'Threads',
          type: 'rich',
        }
      
      case 'YouTube':
        // YouTube oEmbed API
        const youtubeVideoId = extractYouTubeVideoId(url)
        if (!youtubeVideoId) return null
        oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeVideoId}&format=json`
        break
      
      case 'Twitter':
      case 'X':
        // Twitter oEmbed API
        oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
        break
      
      default:
        return null
    }

    const response = await fetch(oembedUrl)
    if (!response.ok) {
      console.error('oEmbed fetch failed:', response.statusText)
      return null
    }

    const data = await response.json()
    return data as OEmbedData
  } catch (error) {
    console.error('Error fetching oEmbed:', error)
    return null
  }
}

/**
 * YouTube URLから動画IDを抽出
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

