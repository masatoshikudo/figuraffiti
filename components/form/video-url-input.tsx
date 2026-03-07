"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { detectSocialPlatform, type SocialPlatform } from "@/lib/url-utils"
import { fetchOEmbed } from "@/lib/oembed"
import { Instagram, Youtube, Twitter, Link as LinkIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface VideoUrlInputProps {
  value: string
  onChange: (url: string) => void
  onValidationChange?: (isValid: boolean) => void
  inputRef?: React.RefObject<HTMLInputElement>
}

export function VideoUrlInput({ value, onChange, onValidationChange, inputRef: externalInputRef }: VideoUrlInputProps) {
  const [parsedUrl, setParsedUrl] = useState<{ platform: SocialPlatform; isValid: boolean } | null>(null)
  const [previewData, setPreviewData] = useState<{
    html?: string
    thumbnail_url?: string
    title?: string
    author_name?: string
    url?: string
  } | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef || internalInputRef
  const onValidationChangeRef = useRef(onValidationChange)

  // コールバック参照を最新の状態に保つ
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange
  }, [onValidationChange])

  // URLが変更されたときに判定とプレビューを更新
  useEffect(() => {
    if (!value.trim()) {
      setParsedUrl(null)
      setPreviewData(null)
      onValidationChangeRef.current?.(false)
      return
    }

    const parsed = detectSocialPlatform(value)
    setParsedUrl(parsed)
    onValidationChangeRef.current?.(parsed.isValid)

    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('URL解析結果:', {
        original: value,
        parsed: parsed,
        normalizedUrl: parsed.url,
      })
    }

    // 有効なURLの場合、プレビューを取得
    if (parsed.isValid && parsed.platform !== 'Other') {
      setIsLoadingPreview(true)
      fetchOEmbed(parsed.url, parsed.platform)
        .then((data) => {
          // デバッグログ（開発環境のみ）
          if (process.env.NODE_ENV === 'development') {
            console.log('oEmbed取得結果:', {
              inputUrl: parsed.url,
              oEmbedUrl: data?.url,
              fullData: data,
            })
          }
          setPreviewData(data)
        })
        .catch((error) => {
          console.error('Error fetching preview:', error)
          setPreviewData(null)
        })
        .finally(() => {
          setIsLoadingPreview(false)
        })
    } else {
      setPreviewData(null)
      setIsLoadingPreview(false)
    }
  }, [value]) // onValidationChangeを依存配列から削除

  // ペーストイベントの処理
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText && detectSocialPlatform(pastedText).isValid) {
      onChange(pastedText)
    }
  }

  // プラットフォームアイコンの取得
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="h-4 w-4" />
      case 'YouTube':
        return <Youtube className="h-4 w-4" />
      case 'Twitter':
      case 'X':
        return <Twitter className="h-4 w-4" />
      case 'Threads':
        return (
          <Image
            src="/threads-logo-black.svg"
            alt="Threads"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        )
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  // プラットフォーム名の表示
  const getPlatformName = (platform: SocialPlatform) => {
    switch (platform) {
      case 'Instagram':
        return 'Instagram'
      case 'YouTube':
        return 'YouTube'
      case 'Twitter':
        return 'Twitter'
      case 'X':
        return 'X'
      case 'Threads':
        return 'Threads'
      default:
        return 'その他'
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="videoUrl">動画のリンク *</Label>
        <div className="relative">
          <Input
            id="videoUrl"
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Instagram、YouTube、Twitter/X、Threadsのリンクを貼り付けてね"
            className={`pr-10 ${parsedUrl && !parsedUrl.isValid ? 'border-destructive' : ''}`}
          />
          {parsedUrl && parsedUrl.isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
              {getPlatformIcon(parsedUrl.platform)}
            </div>
          )}
        </div>
        {parsedUrl && parsedUrl.isValid && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {getPlatformIcon(parsedUrl.platform)}
            <span>{getPlatformName(parsedUrl.platform)}のリンクを検出しました</span>
          </p>
        )}
        {parsedUrl && !parsedUrl.isValid && value.trim() && (
          <p className="text-xs text-destructive mt-1">
            有効な動画URLを入力してください（Instagram、YouTube、Twitter/X、Threads）
          </p>
        )}
        {!value.trim() && (
          <p className="text-xs text-muted-foreground mt-1">
            💡 SNSアプリで「リンクをコピー」して貼り付けてね
          </p>
        )}
      </div>

      {/* プレビュー表示 */}
      {isLoadingPreview && (
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {previewData && !isLoadingPreview && (
        <div className="border rounded-lg p-4 bg-muted/50">
          {previewData.html ? (
            <div>
              {/* HTMLプレビューの場合、リンクを上書きして正しいURLを使用 */}
              <div
                dangerouslySetInnerHTML={{ __html: previewData.html }}
                className="video-preview"
                onClick={(e) => {
                  // HTML内のリンクをクリックした場合、正しいURLにリダイレクト
                  const target = e.target as HTMLElement
                  const link = target.closest('a')
                  if (link && parsedUrl && parsedUrl.url) {
                    e.preventDefault()
                    window.open(parsedUrl.url, '_blank', 'noopener,noreferrer')
                  }
                }}
              />
              {/* HTMLプレビューの場合でも、正しいURLのリンクを表示 */}
              {parsedUrl && parsedUrl.isValid && parsedUrl.url && (
                <a
                  href={parsedUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 block"
                  onClick={(e) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('リンククリック:', {
                        href: e.currentTarget.href,
                        parsedUrl: parsedUrl.url,
                      })
                    }
                  }}
                >
                  元の投稿を見る →
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {previewData.thumbnail_url && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={previewData.thumbnail_url}
                    alt={previewData.title || 'プレビュー'}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 768px"
                    loading="lazy"
                  />
                </div>
              )}
              {previewData.title && (
                <h4 className="font-semibold text-sm">{previewData.title}</h4>
              )}
              {previewData.author_name && (
                <p className="text-xs text-muted-foreground">
                  {previewData.author_name}
                </p>
              )}
              {parsedUrl && parsedUrl.isValid && parsedUrl.url && (
                <a
                  href={parsedUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => {
                    // デバッグログ（開発環境のみ）
                    if (process.env.NODE_ENV === 'development') {
                      console.log('リンククリック:', {
                        href: e.currentTarget.href,
                        parsedUrl: parsedUrl.url,
                        previewDataUrl: previewData?.url,
                      })
                    }
                  }}
                >
                  元の投稿を見る →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

