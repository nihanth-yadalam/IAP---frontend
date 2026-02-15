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
