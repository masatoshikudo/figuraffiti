"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import type { DiscoveryLog } from "@/types/spot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminDiscoveriesPage() {
  const [discoveries, setDiscoveries] = useState<DiscoveryLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDiscoveries = () => {
    setLoading(true)
    fetch("/api/discoveries?limit=100")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("発見ログの取得に失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setDiscoveries(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error("[AdminDiscoveriesPage] Failed to fetch discoveries:", error)
        setDiscoveries([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDiscoveries()
  }, [])

  return (
    <AdminShell
      title="Admin / Discoveries"
      description="最新の発見ログを確認し、ティッカーの元データを把握します。"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Discoveries</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchDiscoveries} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">読み込み中...</p>
          ) : discoveries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">発見ログはまだありません。</p>
          ) : (
            <div className="space-y-3">
              {discoveries.map((discovery) => (
                <div key={discovery.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{discovery.userName || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        #{discovery.spotNumber ?? "?"} / {discovery.locationName || "Unknown"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(discovery.discoveredAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}
