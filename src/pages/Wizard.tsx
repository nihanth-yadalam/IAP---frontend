import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'

type Chronotype = 'morning' | 'balanced' | 'night'
type WorkStyle = 'deep' | 'mixed' | 'sprint'

export default function WizardPage() {
  const nav = useNavigate()
  const { user, token, refreshMe } = useAuth()

  const [step, setStep] = useState(0)
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [chronotype, setChronotype] = useState<Chronotype>('balanced')
  const [workStyle, setWorkStyle] = useState<WorkStyle>('mixed')
  const [sessionLen, setSessionLen] = useState(60)

  const steps = useMemo(
    () => [
      {
        title: 'Welcome',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              This isn’t just a to-do list. We use your availability + habits to schedule realistically — and adjust when life changes.
            </p>
            <div className="rounded-xl bg-zinc-50 border p-4 text-sm text-zinc-700">
              Next: 2 quick habit questions + your weekly busy slots + (optional) Google Calendar sync.
            </div>
          </div>
        )
      },
      {
        title: 'Quick profile',
        body: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>University</Label>
              <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Amrita Vishwa Vidyapeetham" />
            </div>
            <div className="space-y-2">
              <Label>Major</Label>
              <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="CSE" />
            </div>
          </div>
        )
      },
      {
        title: 'Chronotype',
        body: (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                { k: 'morning', t: 'Morning Lark', d: 'High focus early' },
                { k: 'balanced', t: 'Balanced', d: 'Steady all day' },
                { k: 'night', t: 'Night Owl', d: 'High focus late' }
              ] as const
            ).map((c) => (
              <button
                key={c.k}
                type="button"
                onClick={() => setChronotype(c.k)}
                className={`rounded-2xl border p-4 text-left transition ${chronotype === c.k ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}
              >
                <div className="font-semibold">{c.t}</div>
                <div className={`text-xs ${chronotype === c.k ? 'text-white/80' : 'text-zinc-600'}`}>{c.d}</div>
              </button>
            ))}
          </div>
        )
      },
      {
        title: 'Attention span',
        body: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { k: 'deep', t: 'Deep work', d: '90–180 min blocks' },
                  { k: 'mixed', t: 'Mixed', d: '45–90 min blocks' },
                  { k: 'sprint', t: 'Sprints', d: '25–45 min blocks' }
                ] as const
              ).map((w) => (
                <button
                  key={w.k}
                  type="button"
                  onClick={() => setWorkStyle(w.k)}
                  className={`rounded-2xl border p-4 text-left transition ${workStyle === w.k ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}
                >
                  <div className="font-semibold">{w.t}</div>
                  <div className={`text-xs ${workStyle === w.k ? 'text-white/80' : 'text-zinc-600'}`}>{w.d}</div>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Ideal session length (mins)</Label>
              <Input type="number" min={15} max={180} value={sessionLen} onChange={(e) => setSessionLen(parseInt(e.target.value || '60', 10))} />
            </div>
          </div>
        )
      },
      {
        title: 'Weekly busy slots',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">MVP UI placeholder: in the full build you’ll paint busy slots on a weekly grid.</p>
            <div className="rounded-2xl border border-dashed p-6 text-sm text-zinc-700">
              Busy Slots Grid Component goes here (click & drag to mark “Busy”).
            </div>
          </div>
        )
      },
      {
        title: 'Google Calendar',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">Connect Google Calendar to import events as busy slots.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline">Connect Google Calendar</Button>
              <Button type="button" variant="secondary">Allow write-back (toggle)</Button>
            </div>
            <div className="rounded-xl bg-zinc-50 border p-4 text-sm text-zinc-700">
              After connecting, events will overlay on your calendar immediately.
            </div>
          </div>
        )
      }
    ],
    [chronotype, major, sessionLen, university, user?.name, workStyle]
  )

  async function finish() {
    // TODO: call backend /onboarding/complete
    // Keeping as stub so backend can wire.
    await refreshMe()
    nav('/app')
  }

  const s = steps[step]

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
            <div className="text-xs text-zinc-500">Step {step + 1} of {steps.length}</div>
          </CardHeader>
          <CardContent className="space-y-6">
            {s.body}
            <div className="flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((v) => Math.min(steps.length - 1, v + 1))}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={finish}>Finish</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
