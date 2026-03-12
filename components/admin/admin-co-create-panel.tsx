"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import type { CoCreateSubmission } from "@/types/co-create"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AdminCoCreatePanel() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<CoCreateSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<CoCreateSubmission | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [reviewComment, setReviewComment] = useState("")

  const fetchPendingSubmissions = () => {
    setLoading(true)
    fetch("/api/co-create/pending")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "共創審査キューの取得に失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        toast({
          title: "取得に失敗しました",
          description: error instanceof Error ? error.message : "共創審査キューの取得に失敗しました",
          variant: "destructive",
        })
        setSubmissions([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPendingSubmissions()
  }, [])

  const handleReview = async () => {
    if (!reviewTarget || !reviewAction) return

    if (reviewAction === "reject" && !reviewComment.trim()) {
      toast({
        title: "却下理由が必要です",
        description: "却下する場合はレビューコメントを入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const endpoint =
        reviewAction === "approve" ? "/api/co-create/approve" : "/api/co-create/reject"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: reviewTarget.id,
          reviewComment: reviewComment.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "レビュー処理に失敗しました")
      }

      toast({
        title: reviewAction === "approve" ? "承認しました" : "却下しました",
        description: "共創申請のステータスを更新しました。",
      })

      setReviewTarget(null)
      setReviewAction(null)
      setReviewComment("")
      fetchPendingSubmissions()
    } catch (error) {
      toast({
        title: "処理に失敗しました",
        description: error instanceof Error ? error.message : "レビュー処理に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Co-Create Submissions</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchPendingSubmissions} disabled={loading}>
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
        ) : submissions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">審査待ちの共創申請はありません。</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-xl border p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{submission.title || "無題の申請"}</h3>
                    <p className="text-sm text-muted-foreground">
                      投稿者: {submission.submittedBy.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      座標: {submission.lat.toFixed(5)}, {submission.lng.toFixed(5)}
                    </p>
                  </div>
                  <Badge variant="outline">{submission.status}</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">設置意図</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.intentText}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">参考リンク</p>
                  <a
                    href={submission.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {submission.mediaUrl}
                  </a>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setReviewTarget(submission)
                      setReviewAction("approve")
                      setReviewComment("")
                    }}
                  >
                    承認
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      setReviewTarget(submission)
                      setReviewAction("reject")
                      setReviewComment("")
                    }}
                  >
                    却下
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!reviewTarget && !!reviewAction}
        onOpenChange={(open) => {
          if (!open) {
            setReviewTarget(null)
            setReviewAction(null)
            setReviewComment("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewAction === "approve" ? "申請を承認" : "申請を却下"}</DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "必要に応じてコメントを残せます。"
                : "却下理由を申請者に返すため、コメント入力を必須にしています。"}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            placeholder="レビューコメント"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewTarget(null)
                setReviewAction(null)
                setReviewComment("")
              }}
              disabled={isProcessing}
            >
              キャンセル
            </Button>
            <Button onClick={handleReview} disabled={isProcessing}>
              {isProcessing ? "処理中..." : reviewAction === "approve" ? "承認する" : "却下する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
