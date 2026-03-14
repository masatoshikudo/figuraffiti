"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, LoaderCircle, Radio, Sparkles } from "lucide-react"

type NfcPageStatus =
  | "idle"
  | "loading"
  | "auth_required"
  | "recording"
  | "success"
  | "error"

function DiscoverNfcPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const { toast } = useToast()

  const token = searchParams.get("t")?.trim() ?? ""
  const attemptedTokenRef = useRef<string | null>(null)

  const [status, setStatus] = useState<NfcPageStatus>("idle")
  const [message, setMessage] = useState("AhhHumを見つけたら、NFCタグにスマホをかざしてください。")
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("idle")
      setMessage("AhhHumを見つけたら、NFCタグにスマホをかざしてください。")
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

        setStatus("success")
        setMessage("発見を記録しました。マップへ戻ります...")

        toast({
          title: "発見しました！",
          description: "記録が完了し、ティッカーが更新されます。",
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
            ) : status === "success" ? (
              <Sparkles className="h-7 w-7" />
            ) : isNfcMode ? (
              <Radio className="h-7 w-7" />
            ) : (
              <Radio className="h-7 w-7" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">
              {status === "success"
                ? "発見しました！"
                : isNfcMode
                  ? "NFCタグを読み取りました"
                  : "NFCで発見を記録"}
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
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p>
                対応端末では、AhhHumにスマホをかざすと自動でこのページが開き、記録処理が始まります。
              </p>
              <p className="mt-2">
                NFCタグは一度記録に成功すると無効化されるため、同じタグを再利用することはできません。
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
