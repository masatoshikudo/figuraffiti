import { useState, useEffect, useCallback } from "react"
import type { DiscoveryLog } from "@/types/spot"
import { API_CONFIG } from "@/lib/constants"

const POLL_INTERVAL_MS = 15_000 // 15秒ごとにティッカーを更新

interface UseDiscoveriesReturn {
  discoveries: DiscoveryLog[]
  isLoading: boolean
  recordDiscovery: (spotId: string) => Promise<{ success: boolean; error?: string }>
  recordDiscoveryByNumber: (spotNumber: number) => Promise<{ success: boolean; error?: string }>
  refetch: () => Promise<void>
}

/**
 * 発見ログを取得・記録するカスタムフック
 */
export function useDiscoveries(): UseDiscoveriesReturn {
  const [discoveries, setDiscoveries] = useState<DiscoveryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDiscoveries = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.DISCOVERIES_ENDPOINT}?limit=50`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDiscoveries(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("[useDiscoveries] Fetch error:", err)
      setDiscoveries([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDiscoveries()
    const id = setInterval(fetchDiscoveries, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchDiscoveries])

  const recordDiscovery = useCallback(
    async (spotId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch(API_CONFIG.DISCOVERIES_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          return { success: false, error: data.error || "記録に失敗しました" }
        }
        await fetchDiscoveries()
        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "記録に失敗しました"
        return { success: false, error: msg }
      }
    },
    [fetchDiscoveries]
  )

  const recordDiscoveryByNumber = useCallback(
    async (spotNumber: number): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch(API_CONFIG.DISCOVERIES_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotNumber }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          return { success: false, error: data.error || "記録に失敗しました" }
        }
        await fetchDiscoveries()
        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "記録に失敗しました"
        return { success: false, error: msg }
      }
    },
    [fetchDiscoveries]
  )

  return {
    discoveries,
    isLoading,
    recordDiscovery,
    recordDiscoveryByNumber,
    refetch: fetchDiscoveries,
  }
}
