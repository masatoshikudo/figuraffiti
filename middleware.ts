import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthCallbackRoute = pathname.startsWith('/auth/callback')
  const isPrivateAccessRoute = pathname === '/private-access'

  // 環境変数が設定されていない場合は、そのままリクエストを通過させる
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを更新
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // API と認証コールバックは既存ルートの認可ロジックに委ねる
  if (isApiRoute || isAuthCallbackRoute) {
    return supabaseResponse
  }

  const redirectToPrivateAccess = () => {
    const redirectUrl = request.nextUrl.clone()
    const nextPath = `${pathname}${search}`
    redirectUrl.pathname = '/private-access'
    redirectUrl.search = nextPath && nextPath !== '/private-access' ? `?next=${encodeURIComponent(nextPath)}` : ''
    return NextResponse.redirect(redirectUrl)
  }

  if (!user) {
    if (isPrivateAccessRoute) {
      return supabaseResponse
    }

    return redirectToPrivateAccess()
  }

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = Boolean(adminRecord)

  if (isPrivateAccessRoute) {
    if (isAdmin) {
      const next = request.nextUrl.searchParams.get('next')
      const redirectTarget =
        next && next.startsWith('/') && !next.startsWith('//') && next !== '/private-access' ? next : '/'
      return NextResponse.redirect(new URL(redirectTarget, request.url))
    }

    return supabaseResponse
  }

  if (!isAdmin) {
    return redirectToPrivateAccess()
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスに一致:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder内のファイル
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

