/**
 * Figuraffiti キャラクター（QR/NFCの飛び先）
 */
export interface Character {
  id: string
  slug: string
  name: string
  story: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string | null
}
