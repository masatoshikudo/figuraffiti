import { NextRequest, NextResponse } from "next/server"

/**
 * Instagram oEmbed API
 * 
 * InstagramのoEmbed APIを呼び出して埋め込みHTMLを取得します
 * 
 * 注意: Instagram oEmbed APIはアクセストークンが必要な場合があります
 * この実装では、まずアクセストークンなしで試し、必要に応じて環境変数から取得します
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  // Instagram URLの形式をチェック
  const instagramPattern = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i
  if (!instagramPattern.test(url)) {
    return NextResponse.json({ error: "Invalid Instagram URL" }, { status: 400 })
  }

  try {
    // Instagram oEmbed APIを呼び出し
    // 注意: このAPIはアクセストークンが必要な場合があります
    // 環境変数にINSTAGRAM_ACCESS_TOKENが設定されている場合は使用します
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    let oembedUrl: string

    if (accessToken) {
      // Facebook Graph APIを使用（アクセストークンが必要）
      oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}`
    } else {
      // 公開oEmbed APIを試す（アクセストークン不要だが制限あり）
      // 注意: このAPIは非推奨の可能性があります
      oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`
    }

    const response = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Figuraffiti/1.0)",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Instagram oEmbed API error:", response.status, errorText)
      
      // アクセストークンが必要な場合のエラーメッセージ
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            error: "Instagram oEmbed API requires authentication",
            details: "Please set INSTAGRAM_ACCESS_TOKEN environment variable"
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: "Failed to fetch Instagram oEmbed", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Instagram oEmbed:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

