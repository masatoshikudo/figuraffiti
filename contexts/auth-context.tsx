'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/supabase-client'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, accountName: string) => Promise<{ error: Error | null; data?: unknown }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 環境変数が設定されている場合のみSupabaseクライアントを作成
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  let supabase: ReturnType<typeof createClient> | null = null
  try {
    if (supabaseUrl && supabaseAnonKey) {
      supabase = createClient()
    }
  } catch (error) {
    // 環境変数が設定されていない場合はnullのまま
    console.warn('Supabase client creation failed:', error)
  }

  useEffect(() => {
    // Supabaseクライアントが利用可能な場合のみ認証処理を実行
    if (!supabase) {
      setLoading(false)
      return
    }

    // 初期セッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, accountName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured'), data: null }
    }
    try {
      const trimmedAccountName = accountName.trim()

      // メール確認後のリダイレクト先を設定
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : undefined
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            account_name: trimmedAccountName,
            display_name: trimmedAccountName,
          },
        },
      })

      if (!error && data?.user?.id && data.session) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: data.user.id,
              display_name: trimmedAccountName,
            },
            {
              onConflict: 'user_id',
            }
          )

        if (profileError) {
          return { error: profileError as Error, data }
        }
      }
      
      // デバッグ用: レスポンスをログに出力
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Sign up response:', { data, error, redirectTo })
      }
      
      return { error, data }
    } catch (error) {
      console.error('[Auth] Sign up error:', error)
      return { error: error as Error, data: null }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

