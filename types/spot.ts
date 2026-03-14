export interface Spot {
  id: string
  spotName: string // 場所名（渋谷など）
  context?: string | null // 文脈テキスト（「かつて川だった場所」等）
  prefecture?: string // 都道府県（任意）
  address?: string // 住所（逆ジオコーディングで取得、任意）
  lat: number
  lng: number
  displayLat?: number | null
  displayLng?: number | null
  media: {
    type: "cover" | "video" // 'article'は削除
    source: "Instagram" | "YouTube" | "Twitter" | "X" | "Threads" | "TikTok" | "Other"
    url: string
    thumbUrl?: string
  }[]
  createdAt: string
  updatedAt?: string // 更新日時
  // 承認制関連のフィールド
  status?: "pending" | "approved" | "rejected"
  submittedBy?: string // UUID（投稿者、匿名の場合はnull）
  approvedBy?: string // UUID（承認者）
  approvedAt?: string // 承認日時
  rejectionReason?: string // 却下理由
  expiresAt?: string | null
  archivedAt?: string | null
  archiveReason?: string | null
  // AhhHum Phase1
  lastSeen?: string | null // 最終発見日時（鮮度表示用）
  spotNumber?: number | null // #N の N（ティッカー表示用）
  visibleAfter?: string | null
  characterSlug?: string
}

/** 発見ログ（ティッカー表示用） */
export interface DiscoveryLog {
  id: string
  spotId: string
  userId: string
  discoveredAt: string
  userName?: string // 表示名
  spotNumber?: number
  locationName?: string // 地名（prefecture や address から取得）
}

export type TickerItemType = "discovery" | "spot_release" | "exploration"

export interface TickerItem {
  id: string
  type: TickerItemType
  createdAt: string
  locationName: string
  message: string
}

export interface FilterOptions {
  decades: string[]
  sources: string[]
  prefectures: string[]
  tags: string[]
}
