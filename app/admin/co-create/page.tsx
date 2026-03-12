"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminCoCreatePanel } from "@/components/admin/admin-co-create-panel"

export default function AdminCoCreatePage() {
  return (
    <AdminShell
      title="Admin / Co-Create"
      description="共創申請を `spots` から切り離した専用審査キューです。"
    >
      <AdminCoCreatePanel />
    </AdminShell>
  )
}
