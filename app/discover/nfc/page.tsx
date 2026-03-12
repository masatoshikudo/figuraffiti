"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useDiscoveries } from "@/hooks/use-discoveries"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, LoaderCircle, QrCode, Radio } from "lucide-react"

type NfcPageStatus =
  | "idle"
  | "loading"
  | "auth_required"
  | "recording"
  | "success"
  | "duplicate"
  | "error"

function DiscoverNfcPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const { recordDiscovery, recordDiscoveryByNumber } = useDiscoveries()
  const { toast } = useToast()

  const token = searchParams.get("t")?.trim() ?? ""
  const spotIdFromUrl = searchParams.get("spotId")?.trim() ?? ""
  const spotNumberFromUrl = searchParams.get("spotNumber")?.trim() ?? ""
  const attemptedTokenRef = useRef<string | null>(null)

  const [status, setStatus] = useState<NfcPageStatus>("idle")
  const [message, setMessage] = useState("NFCタグをかざすか、スポット番号を入力してください。")
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (spotNumberFromUrl) {
      setManualInput(spotNumberFromUrl)
    }
  }, [spotNumberFromUrl])

  useEffect(() => {
    if (!token) {
      setStatus("idle")
      setMessage("NFCタグをかざすか、スポット番号を入力してください。")
      return
    }

    if (loading) {
      setStatus("loading")
      setMessage("認証状態を確認しています...")
      return
    }

    if (!user) {
      setStatus("auth_required")
      setMessage("発見を記録するにはログインが必要です。")
      setAuthDialogOpen(true)
      return
    }

    if (attemptedTokenRef.current === token) return
    attemptedTokenRef.current = token

    const submit = async () => {
      setStatus("recording")
      setMessage("NFCタグから発見を記録しています...")

      try {
        const res = await fetch("/api/discoveries/nfc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.error || "NFCによる発見記録に失敗しました")
        }

        const duplicate = !!data.duplicate
        setStatus(duplicate ? "duplicate" : "success")
        setMessage(
          duplicate
            ? "このスポットは直近5分以内に記録済みです。"
            : "発見を記録しました。マップへ戻ります..."
        )

        toast({
          title: duplicate ? "すでに記録済みです" : "発見を記録しました",
          description: duplicate
            ? "5分以内の重複記録は追加されません。"
            : "Last Seen とティッカーが更新されます。",
        })

        window.setTimeout(() => {
          router.replace("/discover/mapping")
        }, 900)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "NFCによる発見記録に失敗しました"
        setStatus("error")
        setMessage(errorMessage)
        toast({
          title: "記録に失敗しました",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }

    void submit()
  }, [loading, router, toast, token, user])

  const handleManualSubmit = async () => {
    if (!user) {
      setAuthDialogOpen(true)
      toast({
        title: "ログインが必要です",
        description: "発見を記録するにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    if (spotIdFromUrl) {
      setIsSubmitting(true)
      const { success, error } = await recordDiscovery(spotIdFromUrl)
      setIsSubmitting(false)

      if (success) {
        toast({ title: "発見を記録しました" })
        router.push("/discover/mapping")
      } else {
        toast({ title: "記録に失敗しました", description: error, variant: "destructive" })
      }
      return
    }

    const trimmed = manualInput.trim()
    if (!trimmed) {
      toast({ title: "スポット番号を入力してください", variant: "destructive" })
      return
    }

    const num = parseInt(trimmed, 10)
    if (Number.isNaN(num) || num < 1) {
      toast({
        title: "有効なスポット番号を入力してください",
        description: "#N の N を入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const { success, error } = await recordDiscoveryByNumber(num)
    setIsSubmitting(false)

    if (success) {
      toast({ title: "発見を記録しました" })
      router.push("/discover/mapping")
    } else {
      toast({ title: "記録に失敗しました", description: error, variant: "destructive" })
    }
  }

  const hasPrefilledSpot = !!(spotIdFromUrl || spotNumberFromUrl)
  const isNfcMode = !!token

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
        <Link href="/discover/mapping" className="p-2 -m-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold">発見を記録</h1>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {status === "recording" || status === "loading" ? (
              <LoaderCircle className="h-7 w-7 animate-spin" />
            ) : isNfcMode ? (
              <Radio className="h-7 w-7" />
            ) : (
              <QrCode className="h-7 w-7" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">
              {isNfcMode ? "NFCタグを読み取りました" : "NFC / QR で発見を記録"}
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {isNfcMode ? (
            <div className="space-y-3">
              {(status === "auth_required" || status === "error") && (
                <Button
                  className="w-full"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  ログイン / サインアップ
                </Button>
              )}

              {status === "error" && token ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    attemptedTokenRef.current = null
                    setStatus("loading")
                    setMessage("NFCタグを再確認しています...")
                  }}
                >
                  もう一度試す
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {hasPrefilledSpot ? (
                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    このスポットで発見を記録します。
                  </p>
                  <Button
                    className="mt-3 w-full"
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "記録中..." : "このスポットを記録する"}
                  </Button>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  スポット番号を手動入力（#N の N）
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="例: 42"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManualSubmit}
                  disabled={isSubmitting || (!manualInput.trim() && !spotIdFromUrl)}
                >
                  {isSubmitting ? "記録中..." : "記録する"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                ※ NFC対応端末では、タグを読み取ると自動で記録処理が始まります。
              </p>
            </div>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/discover/mapping">マップに戻る</Link>
          </Button>
        </div>
      </main>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        gateMessage="NFCタグから発見を記録するにはログインが必要です。"
      />
    </div>
  )
}

export default function DiscoverNfcPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <DiscoverNfcPageContent />
    </Suspense>
  )
}
