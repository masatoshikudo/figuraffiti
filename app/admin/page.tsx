"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Spot } from "@/types/spot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Badge } from "@/components/ui/badge"
import {
  API_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_TEXT,
  HTTP_STATUS,
} from "@/lib/constants"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [pendingSpots, setPendingSpots] = useState<Spot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectSpotId, setRejectSpotId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { toast } = useToast()

  const fetchPendingSpots = () => {
    setLoading(true)
    fetch(API_CONFIG.SPOTS_PENDING_ENDPOINT)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          if (res.status === HTTP_STATUS.FORBIDDEN) {
            throw new Error(ERROR_MESSAGES.ADMIN_REQUIRED)
          }
          throw new Error(errorData.details || errorData.error || `HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.details || data.error)
        }
        setPendingSpots(data)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch pending spots:", err)
        setError(err.message || ERROR_MESSAGES.FETCH_PENDING_SPOTS_FAILED)
        setPendingSpots([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setShowAuthDialog(true)
      } else {
        fetchPendingSpots()
      }
    }
  }, [user, authLoading])

  const handleApprove = async (spotId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(API_CONFIG.SPOTS_APPROVE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spotId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || ERROR_MESSAGES.APPROVE_FAILED)
      }

      toast({
        title: SUCCESS_MESSAGES.SPOT_APPROVED,
        description: SUCCESS_MESSAGES.SPOT_APPROVED_DESCRIPTION,
      })

      // リストを更新
      fetchPendingSpots()
    } catch (error) {
      toast({
        title: UI_TEXT.ERROR,
        description: error instanceof Error ? error.message : ERROR_MESSAGES.APPROVE_FAILED,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectSpotId || !rejectionReason.trim()) {
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.REJECTION_REASON_REQUIRED,
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(API_CONFIG.SPOTS_REJECT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId: rejectSpotId,
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || ERROR_MESSAGES.REJECT_FAILED)
      }

      toast({
        title: SUCCESS_MESSAGES.SPOT_REJECTED,
        description: SUCCESS_MESSAGES.SPOT_REJECTED_DESCRIPTION,
      })

      // ダイアログを閉じてリストを更新
      setRejectSpotId(null)
      setRejectionReason("")
      fetchPendingSpots()
    } catch (error) {
      toast({
        title: UI_TEXT.ERROR,
        description: error instanceof Error ? error.message : ERROR_MESSAGES.REJECT_FAILED,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card>
            <CardHeader>
              <CardTitle>ログインが必要です</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                管理画面を使用するにはログインしてください
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 container max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{UI_TEXT.ADMIN_PAGE_TITLE}</h1>
            <p className="text-muted-foreground mt-2">
              承認待ちの記録を確認し、承認または却下してください
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{UI_TEXT.ERROR}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
                {error.includes(ERROR_MESSAGES.ADMIN_REQUIRED) && (
                  <div className="mt-4 bg-muted p-4 rounded">
                    <p className="text-sm font-semibold mb-2">{UI_TEXT.ADMIN_ADD_INSTRUCTIONS}</p>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>{UI_TEXT.ADMIN_ADD_STEP1}</li>
                      <li>{UI_TEXT.ADMIN_ADD_STEP2}</li>
                      <li>{UI_TEXT.ADMIN_ADD_STEP3}</li>
                    </ol>
                    <pre className="mt-3 p-3 bg-background rounded text-xs overflow-x-auto">
                      {UI_TEXT.ADMIN_ADD_SQL_EXAMPLE}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ローディング */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p className="text-muted-foreground">{UI_TEXT.LOADING}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 承認待ちリスト */}
          {!loading && !error && (
            <>
              {pendingSpots.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      {UI_TEXT.NO_PENDING_SPOTS}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingSpots.map((spot) => (
                    <Card key={spot.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {spot.spotName || "スポット名なし"}
                            </CardTitle>
                            <div className="mt-2 space-y-1">
                              {spot.trick && (
                                <p className="text-sm">
                                  <span className="font-medium">技:</span> {spot.trick}
                                </p>
                              )}
                              {spot.skater && (
                                <p className="text-sm">
                                  <span className="font-medium">スケーター:</span> {spot.skater}
                                </p>
                              )}
                              {spot.year && (
                                <p className="text-sm">
                                  <span className="font-medium">年:</span> {spot.year}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">場所:</span> {spot.prefecture}
                                {spot.address && ` - ${spot.address}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            {UI_TEXT.STATUS_PENDING}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {spot.media && spot.media.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">メディア:</p>
                            <div className="space-y-2">
                              {spot.media.map((media, index) => (
                                <a
                                  key={index}
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline block"
                                >
                                  {media.type} - {media.source || "Unknown"}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(spot.id)}
                            disabled={isProcessing}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            承認
                          </Button>
                          <Button
                            onClick={() => {
                              setRejectSpotId(spot.id)
                              setRejectionReason("")
                            }}
                            disabled={isProcessing}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            却下
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 却下理由入力ダイアログ */}
      <Dialog open={!!rejectSpotId} onOpenChange={(open) => !open && setRejectSpotId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>却下理由を入力</DialogTitle>
            <DialogDescription>
              記録を却下する理由を入力してください。この理由は投稿者に通知されます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">却下理由</Label>
              <Textarea
                id="rejectionReason"
                placeholder="例: 不適切な内容が含まれています"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectSpotId(null)
                setRejectionReason("")
              }}
              disabled={isProcessing}
            >
              キャンセル
            </Button>
            <Button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                "却下"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
