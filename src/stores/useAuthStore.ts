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
    google_linked?: boolean
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    otpPending: boolean
    pendingEmail: string | null
    signupComplete: boolean
    signupEmail: string | null
    login: (login: string, password: string) => Promise<void>
    verifyOtp: (email: string, otp: string) => Promise<void>
    loginWithToken: (token: string) => Promise<{ first_login: boolean }>
    signup: (username: string, email: string, password: string, name: string) => Promise<void>
    confirmEmail: (token: string) => Promise<string>
    resendConfirmation: (email: string) => Promise<void>
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
            otpPending: false,
            pendingEmail: null,
            signupComplete: false,
            signupEmail: null,

            loginWithToken: async (token: string) => {
                setAuthToken(token)
                set({ token, isAuthenticated: true, isLoading: true, error: null })
                try {
                    const me = await api.get('/auth/me')
                    set({ user: me.data, isLoading: false })
                    const onboardingComplete =
                        !!me.data.profile?.onboarding_data &&
                        Object.keys(me.data.profile.onboarding_data).length > 0
                    return { first_login: !onboardingComplete }
                } catch (error: any) {
                    set({ isLoading: false, error: 'Failed to load account', isAuthenticated: false, token: null })
                    setAuthToken(null)
                    throw error
                }
            },

            login: async (loginStr, password) => {
                set({ isLoading: true, error: null, otpPending: false, pendingEmail: null })
                try {
                    const res = await api.post('/auth/login', { login: loginStr, password })
                    if (res.data?.status === 'otp_pending') {
                        set({ isLoading: false, otpPending: true, pendingEmail: res.data.email })
                        return
                    }
                    // Fallback: direct token (shouldn't happen with OTP flow)
                    const token = res.data.access_token
                    setAuthToken(token)
                    set({ token, isAuthenticated: true })
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

            verifyOtp: async (email, otp) => {
                set({ isLoading: true, error: null })
                try {
                    const res = await api.post('/auth/verify-otp', { email, otp })
                    const token = res.data.access_token
                    setAuthToken(token)
                    set({ token, isAuthenticated: true, otpPending: false, pendingEmail: null })
                    const me = await api.get('/auth/me')
                    set({ user: me.data, isLoading: false })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Invalid OTP',
                    })
                    throw error
                }
            },

            signup: async (username, email, password, name) => {
                set({ isLoading: true, error: null, signupComplete: false, signupEmail: null })
                try {
                    await api.post('/auth/signup', { username, email, password, name })
                    set({ isLoading: false, signupComplete: true, signupEmail: email })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Signup failed'
                    })
                    throw error
                }
            },

            confirmEmail: async (token: string) => {
                set({ isLoading: true, error: null })
                try {
                    const res = await api.post('/auth/confirm-email', { token })
                    set({ isLoading: false })
                    return res.data.message
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Email confirmation failed'
                    })
                    throw error
                }
            },

            resendConfirmation: async (email: string) => {
                set({ isLoading: true, error: null })
                try {
                    await api.post('/auth/resend-confirmation', { email })
                    set({ isLoading: false })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error?.response?.data?.detail || 'Failed to resend confirmation'
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
