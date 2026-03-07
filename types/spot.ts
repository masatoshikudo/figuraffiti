export interface Spot {
  id: string
  title: string | null // 後方互換性のため残す（使用しない）
  skater: string | null // スケーター名（任意）
  trick: string | null // 技名（必須項目）
  spotName: string // スポット名（空文字も許可）
  prefecture?: string // 都道府県（任意）
  address?: string // 住所（逆ジオコーディングで取得、任意）
  lat: number
  lng: number
  year?: number // 年（任意）
  media: {
    type: "cover" | "video" // 'article'は削除
    source: "Instagram" | "YouTube" | "Twitter" | "X" | "Threads" | "TikTok" | "Other"
    url: string
    thumbUrl?: string
  }[]
  credit?: string // 後方互換性のため残す（使用しない）
  note?: string // 後方互換性のため残す（使用しない）
  tags?: string[] // 後方互換性のため残す（使用しない）
  createdAt: string
  updatedAt?: string // 更新日時
  // 承認制関連のフィールド
  status?: "pending" | "approved" | "rejected"
  submittedBy?: string // UUID（投稿者、匿名の場合はnull）
  approvedBy?: string // UUID（承認者）
  approvedAt?: string // 承認日時
  rejectionReason?: string // 却下理由
}

export interface FilterOptions {
  decades: string[]
  sources: string[]
  prefectures: string[]
  tags: string[]
}
