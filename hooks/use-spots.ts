import { useState, useEffect } from "react"
import type { Spot } from "@/types/spot"
import { API_CONFIG, ERROR_MESSAGES } from "@/lib/constants"
import { handleApiResponse, logApiError, parseApiError } from "@/lib/api/api-utils"

interface UseSpotsReturn {
  spots: Spot[]
  isLoading: boolean
  error: string | null
}

/**
 * スポットデータを取得するカスタムフック
 * エラーハンドリングとローディング状態を管理
 */
export function useSpots(): UseSpotsReturn {
  const [spots, setSpots] = useState<Spot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    console.log("[useSpots] Fetching spots from:", API_CONFIG.SPOTS_ENDPOINT)

    fetch(API_CONFIG.SPOTS_ENDPOINT, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(async (res) => {
        console.log("[useSpots] Response status:", res.status, res.statusText)
        try {
          const data = await handleApiResponse<Spot[]>(res, "Fetch spots")

          console.log("[useSpots] Received data:", {
            isArray: Array.isArray(data),
            count: Array.isArray(data) ? data.length : 0,
            data: Array.isArray(data) ? data.map((s) => ({ id: s.id, status: s.status, spotName: s.spotName })) : data,
          })

          // 正常なデータの場合
          if (Array.isArray(data)) {
            setSpots(data)
            setError(null)
            console.log("[useSpots] Successfully set spots:", data.length)
          } else {
            console.error("[useSpots] Invalid data format:", ERROR_MESSAGES.INVALID_DATA_FORMAT, data)
            setError(ERROR_MESSAGES.INVALID_DATA_FORMAT)
            setSpots([])
          }
        } catch (error) {
          console.error("[useSpots] Error in handleApiResponse:", error)
          const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_SPOTS_FAILED
          setError(errorMessage)
          setSpots([])
        }
      })
      .catch((error) => {
        console.error("[useSpots] Fetch error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error) || ERROR_MESSAGES.FETCH_SPOTS_FAILED
        const apiError = parseApiError(
          { status: 0 } as Response,
          { error: errorMessage }
        )
        logApiError("Error fetching spots", apiError)
        setError(apiError.error)
        setSpots([])
      })
      .finally(() => {
        setIsLoading(false)
        console.log("[useSpots] Loading completed")
      })
  }, [])

  return { spots, isLoading, error }
}

