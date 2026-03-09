import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Landing page for the Google Sign-In OAuth callback.
 *
 * The backend redirects here after a successful (or failed) Google sign-in:
 *   /auth/google/callback?status=success&token=<jwt>
 *   /auth/google/callback?status=error&message=<reason>
 */
export default function GoogleLoginCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const status = searchParams.get('status')
  const token = searchParams.get('token')
  const message = searchParams.get('message')

  useEffect(() => {
    if (status === 'success' && token) {
      loginWithToken(token)
        .then(({ first_login }) => {
          navigate(first_login ? '/wizard' : '/dashboard', { replace: true })
        })
        .catch(() => {
          setError('Failed to load your account. Please try again.')
        })
    } else {
      setError(message ?? 'Google sign-in was unsuccessful. Please try again.')
    }
  }, []) // run once on mount

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Sign-in Failed</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => navigate('/login', { replace: true })} className="rounded-xl">
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
