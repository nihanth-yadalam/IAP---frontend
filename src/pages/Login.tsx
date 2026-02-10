import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <p className="text-sm text-zinc-600">Welcome back. Pick up where you left off.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@uni.edu" required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link className="text-zinc-700 underline" to="/forgot">Forgot password?</Link>
            <Link className="text-zinc-700 underline" to="/signup">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
