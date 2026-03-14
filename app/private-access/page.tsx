'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

type AccessState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ready'; isAdmin: boolean; email: string | null; userId: string | null; error?: string }

export default function PrivateAccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, signOut } = useAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [accessState, setAccessState] = useState<AccessState>({ status: 'idle' })

  const nextPath = useMemo(() => {
    const next = searchParams.get('next')
    if (!next || !next.startsWith('/') || next.startsWith('//') || next === '/private-access') {
      return '/'
    }

    return next
  }, [searchParams])

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      setAccessState({ status: 'idle' })
      return
    }

    let cancelled = false

    const checkAccess = async () => {
      setAccessState({ status: 'checking' })

      try {
        const response = await fetch('/api/profile/check-admin', {
          cache: 'no-store',
        })

        const data = await response.json()

        if (cancelled) {
          return
        }

        const nextState: AccessState = {
          status: 'ready',
          isAdmin: Boolean(data.isAdmin),
          email: data.email ?? user.email ?? null,
          userId: data.userId ?? user.id,
          error: typeof data.error === 'string' ? data.error : undefined,
        }

        setAccessState(nextState)

        if (nextState.isAdmin) {
          router.replace(nextPath)
          router.refresh()
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        setAccessState({
          status: 'ready',
          isAdmin: false,
          email: user.email ?? null,
          userId: user.id,
          error: error instanceof Error ? error.message : '権限情報の取得に失敗しました',
        })
      }
    }

    void checkAccess()

    return () => {
      cancelled = true
    }
  }, [loading, nextPath, router, user])

  const renderBody = () => {
    if (loading || accessState.status === 'checking') {
      return <p className="text-sm text-muted-foreground">権限を確認しています...</p>
    }

    if (!user) {
      return (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            このサイトは現在、管理者アカウントのみ閲覧できる限定公開状態です。ログイン後、管理者として登録済みのアカウントだけが中へ入れます。
          </p>
          <Button className="w-full" onClick={() => setAuthDialogOpen(true)}>
            ログインまたはアカウント作成
          </Button>
        </div>
      )
    }

    if (accessState.status === 'ready' && accessState.isAdmin) {
      return <p className="text-sm text-muted-foreground">管理者権限を確認しました。移動しています...</p>
    }

    const email = accessState.status === 'ready' ? accessState.email : user.email ?? null
    const userId = accessState.status === 'ready' ? accessState.userId : user.id

    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          ログイン済みですが、このアカウントはまだ `admin_users` に登録されていません。Supabase で管理者登録すると、すぐにサイトへ入れるようになります。
        </p>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
          <p>メール: {email ?? '取得できませんでした'}</p>
          <p className="mt-2 break-all">user_id: {userId ?? '取得できませんでした'}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background p-4">
          <p className="text-sm font-medium">登録 SQL</p>
          <pre className="mt-2 overflow-x-auto text-xs leading-6 text-muted-foreground">
{`INSERT INTO admin_users (user_id)
VALUES ('${userId ?? 'YOUR_SUPABASE_USER_ID'}')
ON CONFLICT (user_id) DO NOTHING;`}
          </pre>
        </div>
        {accessState.status === 'ready' && accessState.error ? (
          <p className="text-sm text-destructive">{accessState.error}</p>
        ) : null}
        <Button variant="outline" className="w-full" onClick={() => void signOut()}>
          別のアカウントでログインし直す
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>管理者限定アクセス</CardTitle>
            <CardDescription>
              AhhHum は現在、限定公開です。管理者登録されたアカウントのみ閲覧できます。
            </CardDescription>
          </CardHeader>
          <CardContent>{renderBody()}</CardContent>
        </Card>
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} gateMessage="管理者アカウントでログインしてください" />
    </>
  )
}
