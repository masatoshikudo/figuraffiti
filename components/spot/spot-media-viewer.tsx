"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Image from "next/image"
import type { Spot } from "@/types/spot"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import { InstagramEmbed } from "@/components/spot/instagram-embed"
import { EXTERNAL_URLS, TIMING_CONFIG } from "@/lib/constants"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type MediaTab = "all" | "cover" | "article" | "video" | "instagram"

interface SpotMediaViewerProps {
  spot: Spot
}

export function SpotMediaViewer({ spot }: SpotMediaViewerProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // メディアをタブごとに分類
  const mediaByTab = useMemo(() => {
    const all = spot.media
    const cover = spot.media.filter((m) => m.type === "cover")
    const article = spot.media.filter((m) => m.type === "article")
    const video = spot.media.filter((m) => m.type === "video")
    const instagram = spot.media.filter((m) => m.source === "Instagram")

    return { all, cover, article, video, instagram }
  }, [spot.media])

  // タブが空かどうかをチェック
  const hasMedia = {
    all: mediaByTab.all.length > 0,
    cover: mediaByTab.cover.length > 0,
    article: mediaByTab.article.length > 0,
    video: mediaByTab.video.length > 0,
    instagram: mediaByTab.instagram.length > 0,
  }

  // デフォルトタブを決定（最初にメディアがあるタブ）
  const defaultTab = hasMedia.all
    ? "all"
    : hasMedia.cover
      ? "cover"
      : hasMedia.article
        ? "article"
        : hasMedia.video
          ? "video"
          : "instagram"

  const handleMediaClick = (index: number, tabMedia: typeof spot.media) => {
    // 全メディア配列でのインデックスを計算
    const globalIndex = spot.media.findIndex((m) => m === tabMedia[index])
    setSelectedMediaIndex(globalIndex >= 0 ? globalIndex : 0)
    setIsDialogOpen(true)
  }

  const renderMediaGrid = (media: typeof spot.media) => {
    if (media.length === 0) {
      return (
        <div className="py-12 text-center text-sm text-muted-foreground">
          メディアがありません
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((item, index) => {
          const globalIndex = spot.media.indexOf(item)

          // Instagramの場合は特別な表示（サムネイル取得コンポーネントを使用）
          if (item.source === "Instagram") {
            return (
              <InstagramThumbnail
                key={index}
                url={item.url}
                onClick={() => handleMediaClick(index, media)}
              />
            )
          }

          // 画像または動画のサムネイル
          if (item.thumbUrl) {
            return (
              <button
                key={index}
                onClick={() => handleMediaClick(index, media)}
                className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity group"
              >
                <Image
                  src={item.thumbUrl}
                  alt={`${spot.spotName} - ${item.type}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-black ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-white text-xs font-medium capitalize">
                    {item.source} - {item.type === "cover" ? "表紙" : item.type === "article" ? "記事" : "動画"}
                  </span>
                </div>
              </button>
            )
          }

          // サムネイルがない場合
          return (
            <button
              key={index}
              onClick={() => handleMediaClick(index, media)}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <div className="text-center p-4">
                <ExternalLink className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground capitalize">
                  {item.source}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.type === "cover" ? "表紙" : item.type === "article" ? "記事" : "動画"}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" disabled={!hasMedia.all}>
            すべて ({mediaByTab.all.length})
          </TabsTrigger>
          <TabsTrigger value="cover" disabled={!hasMedia.cover}>
            カバー ({mediaByTab.cover.length})
          </TabsTrigger>
          <TabsTrigger value="article" disabled={!hasMedia.article}>
            記事 ({mediaByTab.article.length})
          </TabsTrigger>
          <TabsTrigger value="video" disabled={!hasMedia.video}>
            動画 ({mediaByTab.video.length})
          </TabsTrigger>
          <TabsTrigger value="instagram" disabled={!hasMedia.instagram}>
            Instagram ({mediaByTab.instagram.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderMediaGrid(mediaByTab.all)}
        </TabsContent>

        <TabsContent value="cover" className="mt-4">
          {renderMediaGrid(mediaByTab.cover)}
        </TabsContent>

        <TabsContent value="article" className="mt-4">
          {renderMediaGrid(mediaByTab.article)}
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          {renderMediaGrid(mediaByTab.video)}
        </TabsContent>

        <TabsContent value="instagram" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaByTab.instagram.map((item, index) => (
              <div key={index} className="w-full">
                <InstagramEmbedWithSkeleton url={item.url} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* メディア拡大表示用のDialog */}
      {selectedMediaIndex !== null && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl w-full p-0">
            <DialogTitle className="sr-only">
              {spot.spotName} - メディアビューアー
            </DialogTitle>
            <MediaCarouselDialog
              media={spot.media}
              initialIndex={selectedMediaIndex}
              spotName={spot.spotName}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Instagramサムネイル表示コンポーネント
function InstagramThumbnail({ url, onClick }: { url: string; onClick: () => void }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Instagram URLからサムネイルURLを取得
    const fetchThumbnail = async () => {
      try {
        // まずoEmbed APIを試す
        try {
          const oembedResponse = await fetch(`/api/instagram/oembed?url=${encodeURIComponent(url)}`)
          if (oembedResponse.ok) {
            const data = await oembedResponse.json()
            if (data.thumbnail_url) {
              setThumbnailUrl(data.thumbnail_url)
              setIsLoading(false)
              return
            }
          }
        } catch (e) {
          // oEmbed APIが失敗した場合は次の方法を試す
        }

        // Instagram URLのパターンを抽出
        const match = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
        if (match) {
          const postId = match[1]
          // InstagramのサムネイルURLパターン（非公式だが動作する場合がある）
          // 注意: CORSの問題で直接取得できない可能性があるため、プロキシ経由または別の方法を検討
          const thumbnailUrl = `${EXTERNAL_URLS.INSTAGRAM_MEDIA}/${postId}/media/?size=l`
          
          // 画像が存在するか確認（CORSの問題で失敗する可能性がある）
          try {
            const response = await fetch(thumbnailUrl, { method: 'HEAD', mode: 'no-cors' })
            // no-corsモードではレスポンスを確認できないため、URLを設定して試す
            setThumbnailUrl(thumbnailUrl)
          } catch (e) {
            // 失敗した場合はデフォルト表示
          }
        }
      } catch (error) {
        console.error("Error fetching Instagram thumbnail:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThumbnail()
  }, [url])

  if (isLoading) {
    return (
      <button
        onClick={onClick}
        className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity animate-pulse"
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
        </div>
      </button>
    )
  }

  if (thumbnailUrl) {
    return (
      <button
        onClick={onClick}
        className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity group"
      >
        <Image
          src={thumbnailUrl}
          alt="Instagram post"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <span className="text-white text-xs font-medium">Instagram</span>
        </div>
      </button>
    )
  }

  // サムネイルが取得できない場合はデフォルト表示
  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-4xl">📷</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
        <span className="text-white text-xs font-medium">Instagram</span>
      </div>
    </button>
  )
}

// Instagram埋め込み用のスケルトンローディング付きコンポーネント
function InstagramEmbedWithSkeleton({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoading(true)
    
    // Instagram埋め込みが読み込まれるまで待機
    const checkLoaded = () => {
      if (!containerRef.current) {
        setTimeout(checkLoaded, TIMING_CONFIG.MEDIA_LOAD_CHECK_INTERVAL)
        return
      }
      
      const container = containerRef.current.querySelector('[data-instgrm-permalink]')
      if (container) {
        const iframe = container.querySelector("iframe")
        if (iframe && iframe.src) {
          setIsLoading(false)
          return
        }
      }
      
      setTimeout(checkLoaded, TIMING_CONFIG.MEDIA_LOAD_CHECK_INTERVAL)
    }

    // スクリプトが読み込まれるまで待機
    if (window.instgrm) {
      setTimeout(checkLoaded, TIMING_CONFIG.MEDIA_LOAD_TIMEOUT)
    } else {
      const interval = setInterval(() => {
        if (window.instgrm) {
          clearInterval(interval)
          setTimeout(checkLoaded, TIMING_CONFIG.MEDIA_LOAD_TIMEOUT)
        }
      }, TIMING_CONFIG.MEDIA_LOAD_CHECK_INTERVAL)
      
      // 5秒後にタイムアウト
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setIsLoading(false)
      }, 5000)
      
      // クリーンアップ
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [url])

  return (
    <div className="relative" ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted rounded-lg animate-pulse flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-muted-foreground/20 mx-auto mb-2" />
            <div className="h-4 w-24 bg-muted-foreground/20 rounded mx-auto mb-1" />
            <div className="h-4 w-16 bg-muted-foreground/20 rounded mx-auto" />
          </div>
        </div>
      )}
      <InstagramEmbed url={url} className="w-full" />
    </div>
  )
}

// メディア拡大表示用のカルーセルDialog
function MediaCarouselDialog({
  media,
  initialIndex,
  spotName,
}: {
  media: Spot["media"]
  initialIndex: number
  spotName: string
}) {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return
    api.scrollTo(initialIndex)
  }, [api, initialIndex])

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {media.map((item, index) => (
            <CarouselItem key={index} className="basis-full">
              <div className="relative w-full aspect-video bg-muted flex items-center justify-center p-4">
                {item.source === "Instagram" ? (
                  <div className="w-full max-w-md">
                    <InstagramEmbed url={item.url} className="w-full" />
                  </div>
                ) : item.thumbUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.thumbUrl}
                      alt={`${spotName} - ${item.type}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <ExternalLink className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2 capitalize">
                      {item.source} - {item.type === "cover" ? "表紙" : item.type === "article" ? "記事" : "動画"}
                    </p>
                    <Button asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        外部リンクで開く
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {media.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    </div>
  )
}

