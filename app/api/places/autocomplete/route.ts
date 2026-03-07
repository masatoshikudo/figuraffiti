import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API key is not configured" },
        { status: 500 }
      )
    }

    // Google Places API Autocompleteを呼び出し
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&language=ja&components=country:jp&types=establishment|geocode`
    )

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'OK' && data.predictions) {
      return NextResponse.json(data.predictions)
    } else if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json([])
    } else {
      console.error('Google Places API error:', data.status, data.error_message)
      
      // HTTPリファラー制限が設定されている場合のエラーメッセージを改善
      let errorMessage = data.error_message || `Google Places API error: ${data.status}`
      if (data.error_message && data.error_message.includes('referer restrictions')) {
        errorMessage = 'APIキーにHTTPリファラー制限が設定されています。Google Cloud Consoleで「アプリケーションの制限」を「なし」に変更してください。'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in places autocomplete API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

