"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ERROR_MESSAGES, UI_TEXT, SPOT_STATUS } from "@/lib/constants"
import type { Spot } from "@/types/spot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MySubmissionsTab() {
  const [submissions, setSubmissions] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const { toast } = useToast()

  const fetchSubmissions = () => {
    setLoading(true)
    fetch("/api/spots/my-submissions", {
      credentials: "include", // Cookieを含める
    })
      .then(async (res) => {
        const responseText = await res.text()
        
        // デバッグ用: 常にログを出力
        console.log("[MySubmissionsTab] Response:", {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          responseText: responseText.substring(0, 200), // 最初の200文字のみ
        })

        if (!res.ok) {
          let errorData = {}
          try {
            errorData = JSON.parse(responseText)
          } catch (e) {
            // JSONパースに失敗した場合
            console.error("[MySubmissionsTab] JSON parse error:", e)
            errorData = { 
              message: responseText || `HTTP error! status: ${res.status}`,
              rawResponse: responseText 
            }
          }

          const errorMessage = 
            errorData.details || 
            errorData.error || 
            errorData.message || 
            `HTTP error! status: ${res.status} ${res.statusText}`
          
          console.error("[MySubmissionsTab] API Error:", {
            status: res.status,
            statusText: res.statusText,
            errorData,
            responseText: responseText.substring(0, 500),
          })
          
          throw new Error(errorMessage)
        }
        
        try {
          return JSON.parse(responseText)
        } catch (e) {
          console.error("[MySubmissionsTab] Response JSON parse error:", e)
          throw new Error("Invalid JSON response from server")
        }
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.details || data.error)
        }
        setSubmissions(data || [])
      })
      .catch((err) => {
        console.error("Failed to fetch submissions:", err)
        toast({
          title: UI_TEXT.ERROR,
          description: err.message || "投稿の取得に失敗しました",
          variant: "destructive",
        })
        setSubmissions([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter((spot) => {
    if (filter === "all") return true
    return spot.status === filter
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500 text-green-900">
            <CheckCircle className="mr-1 h-3 w-3" />
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            却下
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            承認待ち
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総投稿数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">承認済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">却下</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルタタブ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>投稿一覧</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">すべて ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">承認待ち ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">承認済み ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">却下 ({stats.rejected})</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === "all" ? "投稿がありません" : `${filter === "pending" ? "承認待ち" : filter === "approved" ? "承認済み" : "却下"}の投稿がありません`}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredSubmissions.map((spot) => (
                <div
                  key={spot.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{spot.spotName}</h3>
                        {getStatusBadge(spot.status)}
                      </div>
                      {spot.prefecture && (
                        <p className="text-sm text-muted-foreground">{spot.prefecture}</p>
                      )}
                      {spot.skater && spot.trick && (
                        <p className="text-sm text-muted-foreground">
                          {spot.skater} · {spot.trick}
                        </p>
                      )}
                      {spot.year && <p className="text-sm text-muted-foreground">{spot.year}年</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        投稿日時: {new Date(spot.createdAt).toLocaleString("ja-JP")}
                      </p>
                      {spot.status === "rejected" && spot.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                          <p className="font-semibold text-red-800 dark:text-red-200">却下理由:</p>
                          <p className="text-red-700 dark:text-red-300">{spot.rejectionReason}</p>
                        </div>
                      )}
                      {spot.status === "approved" && spot.approvedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          承認日時: {new Date(spot.approvedAt).toLocaleString("ja-JP")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

