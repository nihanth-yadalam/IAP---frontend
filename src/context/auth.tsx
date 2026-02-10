import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '@/lib/api'

type AuthState = {
  token: string | null
  isAuthed: boolean
  user: { id: string; email: string; name: string; onboarding_complete: boolean } | null
  login: (email: string, password: string) => Promise<{ first_login: boolean }>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

const TOKEN_KEY = 'aap_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthState['user']>(null)

  const isAuthed = !!token

  async function refreshMe() {
    if (!token) return
    const me = await AuthAPI.me(token)
    setUser(me)
  }

  useEffect(() => {
    // best effort load user
    refreshMe().catch(() => {
      // token invalid
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      isAuthed,
      user,
      async login(email, password) {
        const res = await AuthAPI.login(email, password)
        localStorage.setItem(TOKEN_KEY, res.access_token)
        setToken(res.access_token)
        await refreshMe()
        return { first_login: res.first_login }
      },
      async signup(name, email, password) {
        await AuthAPI.signup(name, email, password)
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      },
      refreshMe
    }),
    [token, isAuthed, user]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}
