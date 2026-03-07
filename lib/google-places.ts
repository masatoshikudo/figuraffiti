// Google Places API連携用ユーティリティ

export interface GooglePlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export interface GooglePlaceDetails {
  place_id: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  name: string
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

/**
 * Google Places API Autocompleteで検索候補を取得（Next.js APIルート経由）
 * 注意: APIキーにHTTPリファラー制限が設定されている場合、サーバー側から呼び出すことができません
 * その場合は、APIキーの制限を「なし」または「IPアドレス制限」に変更してください
 */
export async function searchPlaces(
  query: string,
  apiKey?: string // クライアント側では使用しない（APIルートで処理）
): Promise<GooglePlacePrediction[]> {
  if (!query.trim()) {
    return []
  }

  try {
    // Next.js APIルート経由で呼び出し（CORSエラーを回避）
    const response = await fetch(
      `/api/places/autocomplete?query=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch places: ${response.status}`)
    }

    const predictions = await response.json()
    return predictions
  } catch (error) {
    console.error('Error fetching places:', error)
    throw error
  }
}

/**
 * Google Places API Place Detailsで場所の詳細情報を取得（Next.js APIルート経由）
 * 注意: APIキーにHTTPリファラー制限が設定されている場合、サーバー側から呼び出すことができません
 * その場合は、APIキーの制限を「なし」または「IPアドレス制限」に変更してください
 */
export async function getPlaceDetails(
  placeId: string,
  apiKey?: string // クライアント側では使用しない（APIルートで処理）
): Promise<GooglePlaceDetails | null> {
  if (!placeId) {
    throw new Error("place_id is required")
  }

  try {
    // Next.js APIルート経由で呼び出し（CORSエラーを回避）
    const response = await fetch(
      `/api/places/details?place_id=${encodeURIComponent(placeId)}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Failed to fetch place details: ${response.status}`
      console.error('Error fetching place details:', errorMessage)
      throw new Error(errorMessage)
    }

    const placeDetails = await response.json()
    return placeDetails
  } catch (error) {
    console.error('Error fetching place details:', error)
    // エラーを再スローして、呼び出し元で適切に処理できるようにする
    throw error
  }
}

