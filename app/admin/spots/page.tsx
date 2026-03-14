"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSpotsPanel } from "@/components/admin/admin-spots-panel"

export default function AdminSpotsPage() {
  return (
    <AdminShell
      title="Admin / Spots"
      description="スポット作成、公開待ち確認、履歴入り状況の確認を行います。"
    >
      <AdminSpotsPanel />
    </AdminShell>
  )
}
