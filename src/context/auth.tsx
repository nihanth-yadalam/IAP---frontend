import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '@/lib/api'

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
    setAuthToken(token)
    try {
      const res = await api.get('/auth/me')
      const u = res.data
      setUser({
        id: u.id,
        email: u.email,
        name: u.name || u.username || '',
        onboarding_complete: !!u.profile?.onboarding_data && Object.keys(u.profile.onboarding_data).length > 0,
      })
    } catch {
      // token invalid
      localStorage.removeItem(TOKEN_KEY)
      setAuthToken(null)
      setToken(null)
      setUser(null)
    }
  }

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      isAuthed,
      user,
      async login(email, password) {
        const res = await api.post('/auth/login', { login: email, password })
        const accessToken = res.data.access_token
        localStorage.setItem(TOKEN_KEY, accessToken)
        setAuthToken(accessToken)
        setToken(accessToken)

        // Fetch user profile to check onboarding
        const me = await api.get('/auth/me')
        const u = me.data
        const onboardingComplete = !!u.profile?.onboarding_data && Object.keys(u.profile.onboarding_data).length > 0
        setUser({
          id: u.id,
          email: u.email,
          name: u.name || u.username || '',
          onboarding_complete: onboardingComplete,
        })

        return { first_login: !onboardingComplete }
      },
      async signup(name, email, password) {
        await api.post('/auth/signup', { username: name, email, password })
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
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
