"use client"

import { useState, useEffect, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, MapPin, ChevronDown } from "lucide-react"
import { getSpacingClasses, getTypography, combineTokens } from "@/lib/design/design-tokens"
import { useAuth } from "@/contexts/auth-context"
import { AuthDialog } from "@/components/auth/auth-dialog"
import {
  API_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_TEXT,
  SPOT_STATUS,
  MEDIA_TYPE,
  MEDIA_SOURCE,
  MEDIA_URL_PATTERNS,
  EXTERNAL_URLS,
} from "@/lib/constants"

interface SubmitFormBottomSheetProps {
  isOpen: boolean
  lat: number | null
  lng: number | null
  address?: string
  onClose: () => void
  onSuccess: () => void
}

const HEADER_HEIGHT = 72

export function SubmitFormBottomSheet({
  isOpen,
  lat,
  lng,
  address,
  onClose,
  onSuccess,
}: SubmitFormBottomSheetProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [trickName, setTrickName] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<string>("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsCollapsed(false)
      const timeout = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(timeout)
    } else {
      setIsVisible(false)
      setIsCollapsed(false)
    }
  }, [isOpen])

  // 住所の解決（逆ジオコーディング）
  useEffect(() => {
    if (!isOpen || !lat || !lng) return

    const resolveAddress = async () => {
      if (address) {
        setResolvedAddress(address)
        return
      }

      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token) {
          setResolvedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          return
        }

        const response = await fetch(
          `${EXTERNAL_URLS.MAPBOX_API_GEOCODING}/${lng},${lat}.json?access_token=${token}&language=ja`
        )
        const data = await response.json()

        if (data.features && data.features.length > 0) {
          setResolvedAddress(data.features[0].place_name)
        } else {
          setResolvedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
      } catch (error) {
        console.error("Error fetching address:", error)
        setResolvedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    }

    resolveAddress()
  }, [isOpen, lat, lng, address])

  // フォームをリセット
  useEffect(() => {
    if (!isOpen) {
      setTrickName("")
      setMediaUrl("")
      setResolvedAddress("")
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 認証チェック
    if (!user) {
      setShowAuthDialog(true)
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.AUTH_REQUIRED,
        variant: "destructive",
      })
      return
    }

    if (!lat || !lng) {
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.LOCATION_REQUIRED,
        variant: "destructive",
      })
      return
    }

    if (!mediaUrl.trim()) {
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.MEDIA_URL_REQUIRED,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // メディアURLからソースを自動判定
      const detectSource = (url: string): string => {
        if (MEDIA_URL_PATTERNS.INSTAGRAM.some(pattern => url.includes(pattern))) return MEDIA_SOURCE.INSTAGRAM
        if (MEDIA_URL_PATTERNS.YOUTUBE.some(pattern => url.includes(pattern))) return MEDIA_SOURCE.YOUTUBE
        if (MEDIA_URL_PATTERNS.TIKTOK.some(pattern => url.includes(pattern))) return MEDIA_SOURCE.TIKTOK
        if (MEDIA_URL_PATTERNS.THREADS.some(pattern => url.includes(pattern))) return MEDIA_SOURCE.THREADS
        if (MEDIA_URL_PATTERNS.X.some(pattern => url.includes(pattern))) return MEDIA_SOURCE.X
        return MEDIA_SOURCE.OTHER
      }

      const mediaType = (MEDIA_URL_PATTERNS.YOUTUBE.some(p => mediaUrl.includes(p)) || MEDIA_URL_PATTERNS.TIKTOK.some(p => mediaUrl.includes(p))) ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.COVER
      const mediaSource = detectSource(mediaUrl)

      const response = await fetch(API_CONFIG.SPOTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotName: "", // 空文字（後で追加可能）
          lat,
          lng,
          trick: trickName.trim() || null, // 空文字の場合はnull
          skater: "", // 空文字（後で追加可能）
          year: null,
          media: [
            {
              type: mediaType,
              source: mediaSource,
              url: mediaUrl.trim(),
            },
          ],
          status: SPOT_STATUS.PENDING, // 承認待ち
        }),
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          // JSONパースに失敗した場合（HTMLエラーページなど）
          const text = await response.text()
          console.error("[SubmitForm] Non-JSON error response:", {
            status: response.status,
            statusText: response.statusText,
            text: text.substring(0, 500), // 最初の500文字のみ
          })
          throw new Error(`サーバーエラーが発生しました (${response.status})`)
        }

        // 詳細なエラー情報をログに出力
        console.error("[SubmitForm] API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details,
          code: errorData.code,
          hint: errorData.hint,
        })

        // エラーメッセージを構築
        let errorMessage = errorData.error || ERROR_MESSAGES.SUBMIT_FAILED
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
        if (errorData.hint) {
          errorMessage += ` (${errorData.hint})`
        }

        throw new Error(errorMessage)
      }

      toast({
        title: SUCCESS_MESSAGES.SPOT_SUBMITTED,
        description: SUCCESS_MESSAGES.SPOT_SUBMITTED_DESCRIPTION,
      })

      // フォームをリセット
      setTrickName("")
      setMediaUrl("")
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: UI_TEXT.ERROR,
        description: error instanceof Error ? error.message : ERROR_MESSAGES.SUBMIT_FAILED,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const windowClass = combineTokens(
    "spot-window",
    getSpacingClasses({ p: "02" }),
    isVisible ? "spot-window--visible" : "",
    isCollapsed ? "spot-window--collapsed" : "spot-window--open"
  )

  const bodyClass = combineTokens(
    "spot-window__body flex flex-col",
    isCollapsed ? "spot-window__body--collapsed" : "spot-window__body--open",
    getSpacingClasses({ px: "04", py: "04", gapY: "04" })
  )

  const headerClass = combineTokens("spot-window__header", getSpacingClasses({ px: "03", py: "03" }))

  const headerStyle: CSSProperties = {
    minHeight: HEADER_HEIGHT,
  }

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <article className={windowClass} role="dialog" aria-label={UI_TEXT.SUBMIT_PAGE_TITLE} aria-expanded={!isCollapsed}>
      <div className={headerClass} style={headerStyle}>
        <div className="flex items-center gap-2">
          <button type="button" className="spot-window__toggle" aria-label="ウィンドウの開閉" onClick={handleToggle}>
            <ChevronDown
              className={combineTokens(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isCollapsed ? "-rotate-180" : "rotate-0"
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          type="button"
          className="spot-window__close"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          aria-label="ウィンドウを閉じる"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className={bodyClass}>
        <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "01" }))}>
          <p className={combineTokens(getTypography({ size: "lg", weight: "bold" }), "text-foreground")}>
            記録を残す
          </p>
          <p
            className={combineTokens(
              getTypography({ size: "sm" }),
              "text-muted-foreground flex items-center gap-1"
            )}
          >
            <MapPin className="h-3 w-3" aria-hidden="true" />
            <span>{resolvedAddress || "読み込み中..."}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "04" }))}>
          {/* メディアURL */}
          <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "02" }))}>
            <Label htmlFor="mediaUrl" className={getTypography({ size: "sm", weight: "medium" })}>
              {UI_TEXT.MEDIA_URL} *
            </Label>
            <Input
              id="mediaUrl"
              type="url"
              placeholder={UI_TEXT.MEDIA_URL_PLACEHOLDER}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              required
              disabled={isSubmitting}
              className={getTypography({ size: "base" })}
            />
          </div>

          {/* 技名 */}
          <div className={combineTokens("flex flex-col", getSpacingClasses({ gapY: "02" }))}>
            <Label htmlFor="trickName" className={getTypography({ size: "sm", weight: "medium" })}>
              {UI_TEXT.TRICK_NAME}
            </Label>
            <Input
              id="trickName"
              type="text"
              placeholder={UI_TEXT.TRICK_NAME_PLACEHOLDER}
              value={trickName}
              onChange={(e) => setTrickName(e.target.value)}
              disabled={isSubmitting}
              className={getTypography({ size: "base" })}
            />
          </div>

          {/* ボタン */}
          <div className={combineTokens("flex", getSpacingClasses({ gap: "03" }))}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !mediaUrl.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                "記録を送信"
              )}
            </Button>
          </div>
        </form>
      </div>
    </article>
    </>
  )
}

