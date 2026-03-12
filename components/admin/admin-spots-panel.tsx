"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, RefreshCw, X } from "lucide-react"
import type { Spot } from "@/types/spot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function AdminSpotsPanel() {
  const [pendingSpots, setPendingSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectSpotId, setRejectSpotId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  const fetchPendingSpots = () => {
    setLoading(true)
    fetch("/api/spots/pending")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "承認待ちスポットの取得に失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setPendingSpots(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        toast({
          title: "取得に失敗しました",
          description: error instanceof Error ? error.message : "承認待ちスポットの取得に失敗しました",
          variant: "destructive",
        })
        setPendingSpots([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPendingSpots()
  }, [])

  const handleApprove = async (spotId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/spots/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "スポットの承認に失敗しました")
      }

      toast({
        title: "承認しました",
        description: "スポットを公開状態にしました。",
      })
      fetchPendingSpots()
    } catch (error) {
      toast({
        title: "承認に失敗しました",
        description: error instanceof Error ? error.message : "スポットの承認に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectSpotId || !rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/spots/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: rejectSpotId,
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "スポットの却下に失敗しました")
      }

      toast({
        title: "却下しました",
        description: "スポットを却下しました。",
      })
      setRejectSpotId(null)
      setRejectionReason("")
      fetchPendingSpots()
    } catch (error) {
      toast({
        title: "却下に失敗しました",
        description: error instanceof Error ? error.message : "スポットの却下に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Spots</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchPendingSpots} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              読み込み中...
            </div>
          ) : pendingSpots.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">承認待ちのスポットはありません。</p>
          ) : (
            <div className="space-y-4">
              {pendingSpots.map((spot) => (
                <div key={spot.id} className="rounded-xl border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{spot.spotName || "スポット名なし"}</h3>
                      <p className="text-sm text-muted-foreground">
                        #{spot.spotNumber ?? "?"} / {[spot.prefecture, spot.address].filter(Boolean).join(" / ")}
                      </p>
                      {spot.context ? (
                        <p className="text-sm text-muted-foreground">{spot.context}</p>
                      ) : null}
                    </div>
                    <Badge variant="outline">pending</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(spot.id)} disabled={isProcessing} className="flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      承認
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setRejectSpotId(spot.id)
                        setRejectionReason("")
                      }}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      却下
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectSpotId} onOpenChange={(open) => !open && setRejectSpotId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>却下理由を入力</DialogTitle>
            <DialogDescription>
              この理由は申請者への通知文面に使われます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">却下理由</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="例: 位置情報が不明確です"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectSpotId(null)} disabled={isProcessing}>
              キャンセル
            </Button>
            <Button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
              {isProcessing ? "処理中..." : "却下する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
