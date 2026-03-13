"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SiteHeader } from "@/components/layout/site-header"
import { TabBar } from "@/components/layout/tab-bar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, FileText } from "lucide-react"
import { MySubmissionsTab } from "@/components/profile/my-submissions-tab"
import { SettingsTab } from "@/components/profile/settings-tab"

interface UserPermissions {
  isAdmin: boolean
  isTrusted: boolean
  userId: string | null
  email: string | null
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [permissions, setPermissions] = useState<UserPermissions>({
    isAdmin: false,
    isTrusted: false,
    userId: null,
    email: null,
  })
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      Promise.all([
        fetch("/api/profile/check-admin").then(async (res) => {
          if (!res.ok) {
            throw new Error("権限情報の取得に失敗しました")
          }
          return res.json()
        }),
        fetch("/api/profile/user-profile").then(async (res) => {
          if (!res.ok) {
            throw new Error("プロフィールの取得に失敗しました")
          }
          return res.json()
        }),
      ])
        .then(([permissionData, profileData]) => {
          setPermissions({
            isAdmin: permissionData.isAdmin || false,
            isTrusted: permissionData.isTrusted || false,
            userId: permissionData.userId || user.id,
            email: permissionData.email || user.email || null,
          })
          setDisplayName(profileData.displayName || "")
        })
        .catch((err) => {
          console.error("Failed to fetch profile data:", err)
        })
        .finally(() => {
          setLoadingPermissions(false)
        })
    } else if (!authLoading && !user) {
      setLoadingPermissions(false)
      setShowAuthDialog(true)
    }
  }, [authLoading, user])

  // 認証チェック
  if (authLoading || loadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>認証が必要です</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                プロフィールページにアクセスするにはログインが必要です。
              </p>
              <button
                onClick={() => setShowAuthDialog(true)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                ログイン
              </button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </>
    )
  }

  const userInitials = user.email
    ?.slice(0, 2)
    .toUpperCase()
    .split("")
    .join("") || "U"

  const effectiveDisplayName = displayName || `Explorer_${user.id.slice(-6)}`

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />

      <ScrollArea className="flex-1 pt-24 pb-20">
        <main className="container max-w-6xl mx-auto p-4 space-y-6">
          {/* プロフィール情報セクション */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{effectiveDisplayName}</h1>
                    <Badge variant={permissions.isAdmin ? "default" : "outline"}>
                      {permissions.isAdmin ? "管理者" : "メンバー"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    メール: {user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ユーザーID: {permissions.userId || user.id}
                  </p>
                  {user.created_at && (
                    <p className="text-sm text-muted-foreground">
                      登録日: {new Date(user.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* タブナビゲーション */}
          <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submissions">
                <FileText className="mr-2 h-4 w-4" />
                マイ申請
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                設定
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="space-y-4">
              <MySubmissionsTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab
                initialDisplayName={displayName}
                onDisplayNameSaved={setDisplayName}
              />
            </TabsContent>
          </Tabs>
        </main>
      </ScrollArea>

      <TabBar />
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  )
}

