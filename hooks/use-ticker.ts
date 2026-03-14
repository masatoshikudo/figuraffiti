import { useState, useEffect, useCallback } from "react"
import type { TickerItem } from "@/types/spot"
import { API_CONFIG } from "@/lib/constants"

const POLL_INTERVAL_MS = 30_000

interface StartExplorationResult {
  success: boolean
  error?: string
}

interface UseTickerReturn {
  items: TickerItem[]
  isLoading: boolean
  refetch: () => Promise<void>
  startExploration: (spotId: string) => Promise<StartExplorationResult>
}

export function useTicker(): UseTickerReturn {
  const [items, setItems] = useState<TickerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.TICKER_ENDPOINT}?limit=50`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("[useTicker] Fetch error:", err)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    const id = setInterval(fetchItems, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchItems])

  const startExploration = useCallback(
    async (spotId: string): Promise<StartExplorationResult> => {
      try {
        const res = await fetch(API_CONFIG.EXPLORATIONS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId }),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          return {
            success: false,
            error: data.error || "探索宣言の開始に失敗しました",
          }
        }

        await fetchItems()
        return { success: true }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "探索宣言の開始に失敗しました"
        return { success: false, error: msg }
      }
    },
    [fetchItems]
  )

  return {
    items,
    isLoading,
    refetch: fetchItems,
    startExploration,
  }
}
