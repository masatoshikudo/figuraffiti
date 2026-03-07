"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Shield } from "lucide-react"

export function SettingsTab() {
  // TODO: 設定の保存機能を実装
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [approvalNotifications, setApprovalNotifications] = useState(true)

  return (
    <div className="space-y-4">
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
                承認通知
              </Label>
              <p className="text-sm text-muted-foreground">
                投稿の承認/却下通知を受け取ります
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
              メールアドレスの変更はSupabaseのダッシュボードから行えます
            </p>
          </div>
          <div className="space-y-2">
            <Label>パスワード</Label>
            <p className="text-sm text-muted-foreground">
              パスワードの変更はSupabaseのダッシュボードから行えます
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

