"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink, Loader2, RefreshCw, X } from "lucide-react"
import type { Spot } from "@/types/spot"
import { LocationPicker } from "@/components/map/location-picker"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface CreatedSpotResult {
  spotId: string
  spotName: string
  spotNumber: number | null
  address?: string | null
  token: string
  nfcUrl: string
}

export function AdminSpotsPanel() {
  const [pendingSpots, setPendingSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCreatingSpot, setIsCreatingSpot] = useState(false)
  const [rejectSpotId, setRejectSpotId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [spotName, setSpotName] = useState("")
  const [context, setContext] = useState("")
  const [selectedLat, setSelectedLat] = useState<number | null>(null)
  const [selectedLng, setSelectedLng] = useState<number | null>(null)
  const [selectedAddress, setSelectedAddress] = useState("")
  const [createdSpot, setCreatedSpot] = useState<CreatedSpotResult | null>(null)
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

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
    setSelectedAddress(address || "")
  }

  const handleCreateSpot = async () => {
    if (selectedLat === null || selectedLng === null) {
      toast({
        title: "位置を確定してください",
        description: "地図の中心を調整するか、現在地を取得してください。",
        variant: "destructive",
      })
      return
    }

    setIsCreatingSpot(true)
    try {
      const response = await fetch("/api/admin/spots/create-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotName,
          context,
          lat: selectedLat,
          lng: selectedLng,
          address: selectedAddress,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "スポットの作成に失敗しました")
      }

      const result: CreatedSpotResult = {
        spotId: data.spotId,
        spotName: data.spotName,
        spotNumber: data.spotNumber ?? null,
        address: data.address ?? selectedAddress,
        token: data.token,
        nfcUrl: data.nfcUrl,
      }

      setCreatedSpot(result)
      setSpotName("")
      setContext("")

      toast({
        title: "スポットとNFC URLを発行しました",
        description: "外部のNFC書き込みアプリへURLを貼り付けてください。",
      })
      fetchPendingSpots()
    } catch (error) {
      toast({
        title: "作成に失敗しました",
        description: error instanceof Error ? error.message : "スポットの作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsCreatingSpot(false)
    }
  }

  const handleCopy = async (value: string, label: string) => {
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea")
      textArea.value = value
      textArea.setAttribute("readonly", "")
      textArea.style.position = "fixed"
      textArea.style.top = "0"
      textArea.style.left = "-9999px"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, value.length)

      const copied = document.execCommand("copy")
      document.body.removeChild(textArea)
      return copied
    }

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else if (!fallbackCopy()) {
        throw new Error("fallback copy failed")
      }

      toast({
        title: `${label}をコピーしました`,
      })
    } catch {
      toast({
        title: "コピーに失敗しました",
        description: "長押しで選択してコピーしてください。",
        variant: "destructive",
      })
    }
  }

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
        <CardHeader>
          <CardTitle>NFC発行用スポット登録</CardTitle>
          <p className="text-sm text-muted-foreground">
            位置を確定してスポットを作成すると、NFC書き込み用URLをその場で生成できます。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mvp-spot-name">スポット名</Label>
            <Input
              id="mvp-spot-name"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              placeholder="例: 川跡の声"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mvp-spot-context">文脈メモ</Label>
            <Textarea
              id="mvp-spot-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="例: かつて川だった場所"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>設置位置</Label>
            <LocationPicker onLocationChange={handleLocationChange} />
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {selectedLat !== null && selectedLng !== null ? (
                <div className="space-y-1">
                  <p>{selectedAddress || "住所未取得"}</p>
                  <p>
                    lat: {selectedLat.toFixed(6)} / lng: {selectedLng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <p>位置を確定すると、ここに座標と住所が表示されます。</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleCreateSpot}
            disabled={isCreatingSpot || selectedLat === null || selectedLng === null}
            className="w-full"
          >
            {isCreatingSpot ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                発行中...
              </>
            ) : (
              "スポットを作成してNFC URLを発行"
            )}
          </Button>

          {createdSpot ? (
            <div className="rounded-xl border p-4 space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">
                  #{createdSpot.spotNumber ?? "?"} {createdSpot.spotName}
                </h3>
                <p className="text-sm text-muted-foreground break-all">
                  Spot ID: {createdSpot.spotId}
                </p>
                {createdSpot.address ? (
                  <p className="text-sm text-muted-foreground">{createdSpot.address}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>NFC token</Label>
                <div className="flex gap-2">
                  <Input value={createdSpot.token} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopy(createdSpot.token, "token")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    コピー
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>NFC書き込み用URL</Label>
                <div className="flex gap-2">
                  <Input value={createdSpot.nfcUrl} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopy(createdSpot.nfcUrl, "URL")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    コピー
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href={createdSpot.nfcUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    URLを開く
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
