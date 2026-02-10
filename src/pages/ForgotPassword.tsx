import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Placeholder for backend endpoint
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <p className="text-sm text-zinc-600">We’ll email you a reset link.</p>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button className="w-full">Send reset link</Button>
              <div className="text-sm"><Link className="text-zinc-700 underline" to="/login">Back to login</Link></div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-zinc-700">If an account exists for <b>{email}</b>, a reset link was sent.</div>
              <Link className="text-zinc-700 underline text-sm" to="/login">Back to login</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
