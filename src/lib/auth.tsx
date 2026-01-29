import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  notionConnected: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  connectNotion: () => void
  disconnectNotion: () => Promise<void>
  handleNotionCallback: (code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [notionConnected, setNotionConnected] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // 사용자 메타데이터에서 Notion 연결 상태 확인
      if (session?.user?.user_metadata?.notion_connected) {
        setNotionConnected(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user?.user_metadata?.notion_connected) {
        setNotionConnected(true)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error("Auth error:", error);
      throw new Error(error.message || "Auth failed"); // 메시지 보장
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const connectNotion = () => {
    const notionClientId = import.meta.env.VITE_NOTION_CLIENT_ID
    const redirectUri = import.meta.env.VITE_NOTION_REDIRECT_URI
    const authUrl = import.meta.env.VITE_NOTION_AUTH_URL

    const params = new URLSearchParams({
      client_id: notionClientId,
      response_type: 'code',
      owner: 'user',
      redirect_uri: redirectUri,
    })

    window.location.href = `${authUrl}?${params.toString()}`
  }

  const disconnectNotion = async () => {
    if (!user) return

    const { error } = await supabase.auth.updateUser({
      data: { notion_connected: false, notion_token: null }
    })
    
    if (error) throw error
    setNotionConnected(false)
  }

  const handleNotionCallback = async (code: string) => {
    try {
      // 현재 세션 다시 확인
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !currentSession) {
        throw new Error('로그인 세션이 없습니다. 다시 로그인해주세요.')
      }

      // 개발 환경에서는 모킹된 응답 사용
      let tokenData: any
      
      if (import.meta.env.DEV) {
        // 로컬 개발: 더미 토큰 사용 (테스트용)
        console.log('🔍 개발 환경: 모킹된 토큰 사용')
        tokenData = {
          access_token: 'ntn_test_' + Math.random().toString(36).substring(7),
          workspace_id: 'test_workspace_' + Math.random().toString(36).substring(7),
        }
      } else {
        // 프로덕션: Edge Function을 통해 토큰 교환
        const { data, error: functionError } = await supabase.functions.invoke('notion-token', {
          body: { code }
        })

        if (functionError || !data?.access_token) {
          throw new Error(data?.error || 'Notion 인증 실패')
        }
        
        tokenData = data
      }

      // Supabase에 Notion 토큰 저장
      const { error } = await supabase.auth.updateUser({
        data: {
          notion_connected: true,
          notion_token: tokenData.access_token,
          notion_workspace_id: tokenData.workspace_id,
        }
      })

      if (error) throw error
      setNotionConnected(true)
      console.log('✅ Notion 연결 성공!')
    } catch (error) {
      console.error('Notion 연결 오류:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      notionConnected,
      signIn, 
      signUp, 
      signOut, 
      connectNotion,
      disconnectNotion,
      handleNotionCallback 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
