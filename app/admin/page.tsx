"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminShell } from "@/components/admin/admin-shell"

const sections = [
  {
    href: "/admin/spots",
    title: "Spots",
    description: "スポットの承認待ち確認、公開、却下を行います。",
  },
  {
    href: "/admin/discoveries",
    title: "Discoveries",
    description: "発見ログを一覧し、現場の動きを確認します。",
  },
  {
    href: "/admin/content",
    title: "Content",
    description: "Character として見えているコンテンツ単位を確認します。",
  },
  {
    href: "/admin/co-create",
    title: "Co-Create",
    description: "Phase3 の共創導線に向けた運用入口をまとめます。",
  },
]

export default function AdminPage() {
  return (
    <AdminShell
      title="Admin Overview"
      description="親設計に沿って、管理機能をモジュールごとに分けた入口です。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  )
}
