import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import { upsertUserProfile } from '@/lib/api/user-profile-utils'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const rawAccountName =
      user?.user_metadata?.account_name ?? user?.user_metadata?.display_name
    const accountName =
      typeof rawAccountName === 'string' ? rawAccountName.trim().slice(0, 40) : ''

    if (user?.id && accountName) {
      await upsertUserProfile(user.id, accountName)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url))
}

