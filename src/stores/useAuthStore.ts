import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAuthToken } from '@/lib/api'

interface User {
    id: string
    email: string
    username: string
    name?: string | null
    avatar_url?: string
    chronotype?: "morning" | "balanced" | "night"
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (login: string, password: string) => Promise<void>
    signup: (username: string, email: string, password: string, name: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<void>
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (loginStr, password) => {
                set({ isLoading: true, error: null })
                try {
                    const res = await api.post('/auth/login', { login: loginStr, password })
                    const token = res.data.access_token
                    setAuthToken(token)
                    set({ token, isAuthenticated: true })

                    // Fetch user details
                    const me = await api.get('/auth/me')
                    set({ user: me.data, isLoading: false })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Login failed',
                        isAuthenticated: false,
                        token: null
                    })
                    throw error
                }
            },

            signup: async (username, email, password, name) => {
                set({ isLoading: true, error: null })
                try {
                    // Register
                    await api.post('/auth/signup', { username, email, password, name })
                    // Auto login after signup
                    await get().login(username, password) // or email
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Signup failed'
                    })
                    throw error
                }
            },

            logout: () => {
                setAuthToken(null)
                set({ user: null, token: null, isAuthenticated: false })
                localStorage.removeItem('schedora-auth-storage') // Clearing persistence if needed, though zustand handles it
            },

            checkAuth: async () => {
                const { token } = get()
                if (token) {
                    setAuthToken(token)
                    try {
                        const me = await api.get('/auth/me')
                        set({ user: me.data, isAuthenticated: true })
                    } catch {
                        get().logout()
                    }
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'schedora-auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
)
