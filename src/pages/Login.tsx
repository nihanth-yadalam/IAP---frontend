import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'
import { AuthLayout } from '@/components/AuthLayout'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const { first_login } = await login(email, password)
      nav(first_login ? '/wizard' : '/app')
    } catch (e: any) {
      setErr(e?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back. Pick up where you left off."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@uni.edu"
            required
            className="bg-secondary/50 text-slate-900 dark:text-slate-100 placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-secondary/50 text-slate-900 dark:text-slate-100 placeholder:text-muted-foreground"
          />
        </div>
        {err && <div className="text-sm text-destructive font-medium">{err}</div>}
        <Button className="w-full font-semibold shadow-md" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-4 flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <button
        type="button"
        onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login` }}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Google "G" logo */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.5-4.1 7.2-10.2 7.2-17.1z"/>
          <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.6 2.7 10.7l7.8-6z"/>
          <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.6 2.2-7.6 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.8 6C6.7 42.7 14.7 48 24 48z"/>
        </svg>
        Sign in with Google
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
          to="/forgot"
        >
          Forgot password?
        </Link>
        <Link
          className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
          to="/signup"
        >
          Create account
        </Link>
      </div>
    </AuthLayout>
  )
}
