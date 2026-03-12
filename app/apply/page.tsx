"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/layout/site-header"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LocationPicker } from "@/components/map/location-picker"
import {
  API_CONFIG,
  ERROR_MESSAGES,
  MEDIA_SOURCE,
  MEDIA_TYPE,
  MEDIA_URL_PATTERNS,
  SUCCESS_MESSAGES,
  UI_TEXT,
} from "@/lib/constants"

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [intentText, setIntentText] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true)
    }
  }, [authLoading, user])

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

  const detectSource = (url: string): string => {
    if (MEDIA_URL_PATTERNS.INSTAGRAM.some((pattern) => url.includes(pattern))) return MEDIA_SOURCE.INSTAGRAM
    if (MEDIA_URL_PATTERNS.YOUTUBE.some((pattern) => url.includes(pattern))) return MEDIA_SOURCE.YOUTUBE
    if (MEDIA_URL_PATTERNS.TIKTOK.some((pattern) => url.includes(pattern))) return MEDIA_SOURCE.TIKTOK
    if (MEDIA_URL_PATTERNS.THREADS.some((pattern) => url.includes(pattern))) return MEDIA_SOURCE.THREADS
    if (MEDIA_URL_PATTERNS.X.some((pattern) => url.includes(pattern))) return MEDIA_SOURCE.X
    return MEDIA_SOURCE.OTHER
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowAuthDialog(true)
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.AUTH_REQUIRED,
        variant: "destructive",
      })
      return
    }

    if (lat === null || lng === null) {
      toast({
        title: UI_TEXT.ERROR,
        description: ERROR_MESSAGES.LOCATION_REQUIRED,
        variant: "destructive",
      })
      return
    }

    if (!intentText.trim() || !mediaUrl.trim()) {
      toast({
        title: UI_TEXT.ERROR,
        description: "設置意図と参考リンクを入力してください",
        variant: "destructive",
      })
      return
    }

    const mediaType =
      MEDIA_URL_PATTERNS.YOUTUBE.some((pattern) => mediaUrl.includes(pattern)) ||
      MEDIA_URL_PATTERNS.TIKTOK.some((pattern) => mediaUrl.includes(pattern))
        ? MEDIA_TYPE.VIDEO
        : MEDIA_TYPE.COVER

    setIsSubmitting(true)
    try {
      const response = await fetch(API_CONFIG.CO_CREATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim() || null,
          intentText: intentText.trim(),
          lat,
          lng,
          mediaUrl: mediaUrl.trim(),
          mediaType,
          mediaSource: detectSource(mediaUrl),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "共創申請の送信に失敗しました")
      }

      toast({
        title: SUCCESS_MESSAGES.CO_CREATE_SUBMITTED,
        description: SUCCESS_MESSAGES.CO_CREATE_SUBMITTED_DESCRIPTION,
      })

      router.push("/apply/complete")
    } catch (error) {
      toast({
        title: UI_TEXT.ERROR,
        description: error instanceof Error ? error.message : "共創申請の送信に失敗しました",
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
          <h1 className="text-3xl font-bold">{UI_TEXT.APPLY_PAGE_TITLE}</h1>
          <p className="text-muted-foreground">{UI_TEXT.APPLY_PAGE_DESCRIPTION}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{UI_TEXT.CO_CREATE_FORM}</CardTitle>
            <CardDescription>{UI_TEXT.CO_CREATE_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">仮タイトル（任意）</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="例: 川跡の声"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{UI_TEXT.SELECT_LOCATION}</Label>
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  initialLat={lat || undefined}
                  initialLng={lng || undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intentText">設置意図 *</Label>
                <Textarea
                  id="intentText"
                  placeholder="なぜこの場所に置きたいのか、どんな体験を起こしたいのかを書いてください"
                  value={intentText}
                  onChange={(e) => setIntentText(e.target.value)}
                  rows={5}
                  required
                />
              </div>

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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || lat === null || lng === null || !intentText.trim() || !mediaUrl.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {UI_TEXT.SUBMITTING}
                  </>
                ) : (
                  UI_TEXT.SUBMIT_CO_CREATE
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
