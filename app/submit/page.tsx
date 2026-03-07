"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "@/components/map/location-picker"
import { useToast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/layout/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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
} from "@/lib/constants"

export default function SubmitPage() {
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [trickName, setTrickName] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true)
    }
  }, [user, authLoading])

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

    // バリデーション
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
          status: SPOT_STATUS.PENDING,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || ERROR_MESSAGES.SUBMIT_FAILED)
      }

      toast({
        title: SUCCESS_MESSAGES.SPOT_SUBMITTED,
        description: SUCCESS_MESSAGES.SPOT_SUBMITTED_DESCRIPTION,
      })

      // フォームをリセット
      setTrickName("")
      setMediaUrl("")
      setLat(null)
      setLng(null)
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      <main className="flex-1 container max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{UI_TEXT.SUBMIT_PAGE_TITLE}</h1>
          <p className="text-muted-foreground">
            {UI_TEXT.SUBMIT_PAGE_DESCRIPTION}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{UI_TEXT.RECORD_FORM}</CardTitle>
            <CardDescription>{UI_TEXT.MINIMAL_INFO_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 地図 */}
              <div className="space-y-2">
                <Label>{UI_TEXT.SELECT_LOCATION}</Label>
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  initialLat={lat || undefined}
                  initialLng={lng || undefined}
                />
              </div>

              {/* メディアURL */}
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">{UI_TEXT.MEDIA_URL} *</Label>
                <Input
                  id="mediaUrl"
                  type="url"
                  placeholder={UI_TEXT.MEDIA_URL_PLACEHOLDER}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  required
                />
              </div>

              {/* 技名 */}
              <div className="space-y-2">
                <Label htmlFor="trickName">{UI_TEXT.TRICK_NAME}</Label>
                <Input
                  id="trickName"
                  type="text"
                  placeholder={UI_TEXT.TRICK_NAME_PLACEHOLDER}
                  value={trickName}
                  onChange={(e) => setTrickName(e.target.value)}
                />
              </div>

              {/* 送信ボタン */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !lat || !lng || !mediaUrl.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {UI_TEXT.SUBMITTING}
                  </>
                ) : (
                  UI_TEXT.SUBMIT_RECORD
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
