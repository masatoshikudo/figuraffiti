"use client"

import { useEffect, useRef } from "react"

interface InstagramEmbedProps {
  url: string
  className?: string
}

/**
 * Instagram埋め込みコンポーネント
 * 
 * Instagramの公式埋め込みコードを使用して投稿を埋め込み表示します
 * アクセストークン不要で、不特定多数のユーザーが登録したURLでも動作します
 */
export function InstagramEmbed({ url, className }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  // Instagram URLを正規化（クエリパラメータを削除）
  const normalizedUrl = (() => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    } catch {
      return url
    }
  })()

  useEffect(() => {
    if (!containerRef.current) return

    // Instagramの埋め込みスクリプトを読み込む
    const loadInstagramScript = () => {
      if (scriptLoadedRef.current) {
        // スクリプトが既に読み込まれている場合は処理を再実行
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
        return
      }

      const scriptId = "instagram-embed-script"
      
      // 既にスクリプトが読み込まれているかチェック
      if (document.getElementById(scriptId)) {
        scriptLoadedRef.current = true
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
        return
      }

      // スクリプトを読み込む
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "https://www.instagram.com/embed.js"
      script.async = true
      script.defer = true
      
      script.onload = () => {
        scriptLoadedRef.current = true
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
      }

      document.body.appendChild(script)
    }

    // コンテナに埋め込みコードを設定
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <blockquote 
          class="instagram-media" 
          data-instgrm-permalink="${normalizedUrl}" 
          data-instgrm-version="14"
          style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0; padding:0; width:100%; max-width:100%;"
        >
          <div style="padding:16px;">
            <a href="${normalizedUrl}" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
              <div style="display: flex; flex-direction: row; align-items: center;">
                <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                </div>
              </div>
              <div style="padding: 19% 0;"></div>
              <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1">
                  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                      <g>
                        <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.385 C532.154,33.385 525,40.539 525,49.385 C525,58.23 532.154,65.385 541,65.385 C549.846,65.385 557,58.23 557,49.385 C557,40.539 549.846,33.385 541,33.385 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.099,74.378 C549.981,74.521 548.121,74.552 541,74.552 C533.879,74.552 532.019,74.521 528.901,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.102 516.448,50 C516.448,42.898 516.479,41.057 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.901,25.623 C532.057,25.479 533.898,25.448 541,25.448 C548.102,25.448 549.943,25.479 553.099,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.057 565.552,42.898 565.552,50 C565.552,57.102 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,31.84 569.425,29.76 C568.659,27.634 567.633,25.998 566.228,24.594 C564.823,23.189 563.187,22.161 561.06,21.397 C558.979,20.653 556.382,20.147 553.189,20 C549.901,19.852 548.092,19.817 541,19.817 C533.908,19.817 532.099,19.852 528.811,20 C525.618,20.147 523.021,20.653 520.94,21.397 C518.814,22.161 517.177,23.189 515.772,24.594 C514.367,25.998 513.342,27.634 512.574,29.76 C511.834,31.84 511.326,34.438 511.181,37.631 C511.035,40.969 511,42.78 511,50 C511,57.22 511.035,59.03 511.181,62.369 C511.326,65.562 511.834,68.16 512.574,70.24 C513.342,72.366 514.367,74.002 515.772,75.406 C517.177,76.811 518.814,77.839 520.94,78.603 C523.021,79.347 525.618,79.853 528.811,80 C532.099,80.148 533.908,80.183 541,80.183 C548.092,80.183 549.901,80.148 553.189,80 C556.382,79.853 558.979,79.347 561.06,78.603 C563.187,77.839 564.823,76.811 566.228,75.406 C567.633,74.002 568.659,72.366 569.425,70.24 C570.167,68.16 570.674,65.562 570.82,62.369 C570.966,59.03 571,57.22 571,50 C571,42.78 570.966,40.969 570.82,37.631"></path>
                      </g>
                    </g>
                  </svg>
                </div>
              </div>
              <p style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">
                <a href="${normalizedUrl}" style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Instagramで投稿を見る</a>
              </p>
            </a>
          </div>
        </blockquote>
      `
    }

    // スクリプトを読み込む
    loadInstagramScript()

    // クリーンアップ関数
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [normalizedUrl])

  return (
    <div
      ref={containerRef}
      className={className || ""}
      style={{ display: "flex", justifyContent: "center", width: "100%" }}
    />
  )
}

// TypeScript用の型定義
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

