"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSpotsPanel } from "@/components/admin/admin-spots-panel"

export default function AdminSpotsPage() {
  return (
    <AdminShell
      title="Admin / Spots"
      description="スポットの承認待ち確認と公開可否の判断を行います。"
    >
      <AdminSpotsPanel />
    </AdminShell>
  )
}
