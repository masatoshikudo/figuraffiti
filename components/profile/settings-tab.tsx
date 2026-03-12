"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Mail, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsTab({
  initialDisplayName = "",
  onDisplayNameSaved,
}: {
  initialDisplayName?: string
  onDisplayNameSaved?: (displayName: string) => void
}) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [approvalNotifications, setApprovalNotifications] = useState(true)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setDisplayName(initialDisplayName)
  }, [initialDisplayName])

  const handleSaveDisplayName = async () => {
    setIsSaving(true)

    try {
      const res = await fetch("/api/profile/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "表示名の保存に失敗しました")
      }

      const nextDisplayName = data.displayName || ""
      setDisplayName(nextDisplayName)
      onDisplayNameSaved?.(nextDisplayName)
      toast({
        title: "表示名を保存しました",
        description: "ティッカーや発見ログに反映されます。",
      })
    } catch (error) {
      toast({
        title: "保存に失敗しました",
        description: error instanceof Error ? error.message : "表示名の保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            表示名
          </CardTitle>
          <CardDescription>ティッカーや発見ログに表示される名前です</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="display-name">表示名</Label>
            <Input
              id="display-name"
              maxLength={40}
              placeholder="例: Explorer Shibuya"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              未設定の場合は `Explorer_xxxxx` が自動で使われます。
            </p>
          </div>
          <Button onClick={handleSaveDisplayName} disabled={isSaving}>
            {isSaving ? "保存中..." : "表示名を保存"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>メール通知の設定を変更できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                メール通知
              </Label>
              <p className="text-sm text-muted-foreground">
                すべてのメール通知を有効/無効にします
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                運営通知
              </Label>
              <p className="text-sm text-muted-foreground">
                運営からの更新通知を受け取ります
              </p>
            </div>
            <Switch
              id="approval-notifications"
              checked={approvalNotifications}
              onCheckedChange={setApprovalNotifications}
              disabled={!emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アカウント設定</CardTitle>
          <CardDescription>アカウント情報の管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <p className="text-sm text-muted-foreground">
              認証メールアドレスの変更は今後対応予定です
            </p>
          </div>
          <div className="space-y-2">
            <Label>パスワード</Label>
            <p className="text-sm text-muted-foreground">
              パスワードの変更は認証プロバイダ側で管理されます
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限情報
          </CardTitle>
          <CardDescription>あなたのアカウントの権限情報</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            権限の変更は管理者に連絡してください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

