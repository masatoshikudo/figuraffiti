import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get("place_id")
    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    if (!placeId) {
      return NextResponse.json({ error: "place_id parameter is required" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY on the server or NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as a fallback.",
        },
        { status: 500 }
      )
    }

    // Google Places API Place Detailsを呼び出し
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=ja&fields=place_id,formatted_address,geometry,name,address_components`
    console.log('Calling Google Places API Details:', { placeId, apiUrl: apiUrl.replace(apiKey || '', '***') })
    
    const response = await fetch(apiUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Places API HTTP error:', response.status, errorText)
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Google Places API Details response:', { status: data.status, hasResult: !!data.result })

    if (data.status === 'OK' && data.result) {
      return NextResponse.json(data.result)
    } else {
      console.error('Google Places API error:', data.status, data.error_message)
      
      // HTTPリファラー制限が設定されている場合のエラーメッセージを改善
      let errorMessage = data.error_message || `Google Places API error: ${data.status}`
      if (data.error_message && data.error_message.includes('referer restrictions')) {
        errorMessage = 'APIキーにHTTPリファラー制限が設定されています。ローカル開発ではサーバー専用の GOOGLE_PLACES_API_KEY を使うか、Google Cloud Consoleで制限を見直してください。'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in places details API:', error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
    }
}

