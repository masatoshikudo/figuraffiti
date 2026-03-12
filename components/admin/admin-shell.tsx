"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/spots", label: "Spots" },
  { href: "/admin/discoveries", label: "Discoveries" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/co-create", label: "Co-Create" },
]

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setCheckingAdmin(false)
      setShowAuthDialog(true)
      return
    }

    fetch("/api/profile/check-admin")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("管理者権限の確認に失敗しました")
        }
        return res.json()
      })
      .then((data) => {
        setIsAdmin(Boolean(data.isAdmin))
      })
      .catch((error) => {
        console.error("[AdminShell] Failed to check admin:", error)
        setIsAdmin(false)
      })
      .finally(() => {
        setCheckingAdmin(false)
      })
  }, [authLoading, user])

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>ログインが必要です</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                管理画面を使用するにはログインしてください。
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>管理者権限が必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              この画面は管理者のみ利用できます。権限付与後に再度アクセスしてください。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {children}
      </main>
    </div>
  )
}
