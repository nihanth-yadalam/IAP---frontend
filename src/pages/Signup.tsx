import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'

export default function SignupPage() {
  const nav = useNavigate()
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await signup(name, email, password)
      nav('/login')
    } catch (e: any) {
      setErr(e?.message ?? 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">Your schedule, personalized — and private.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-secondary/50 text-slate-900 dark:text-slate-100 placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Creating...' : 'Create account'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors" to="/login">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
