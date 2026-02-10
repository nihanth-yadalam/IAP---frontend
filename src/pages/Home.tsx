import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts'

type Category = 'exam' | 'assignment' | 'extracurricular'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [category, setCategory] = useState<Category>('assignment')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const progressData = useMemo(() => [{ name: 'Done', value: 3 }, { name: 'Remaining', value: 5 }], [])

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">AI Academic Planner</div>
            <div className="font-semibold">Hi, {user?.name ?? 'Student'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Schedule</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule a task</DialogTitle>
                  <DialogDescription>Enter details; AI will estimate time and place it in your calendar.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                    >
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="extracurricular">Extra curricular</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Calculus Unit 3" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      className="min-h-[90px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What needs to be done?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={() => alert('Wire to backend: /tasks')}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-zinc-50 border p-4">
                <div className="text-xs text-zinc-500">Next up</div>
                <div className="font-semibold">DS Lab Report</div>
                <div className="text-sm text-zinc-600">Today • 6:00 PM</div>
              </div>
              <div className="rounded-xl bg-zinc-50 border p-4">
                <div className="text-xs text-zinc-500">Daily progress</div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={progressData} dataKey="value" outerRadius={60} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 border p-4">
                  <div className="text-xs text-zinc-500">Burnout</div>
                  <div className="font-semibold">Medium</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-4">
                  <div className="text-xs text-zinc-500">Streak</div>
                  <div className="font-semibold">4 days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {['Pending', 'Completed', 'Exam', 'Assignment', 'High Priority', 'Overdue'].map((t) => (
                <button key={t} className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-50">{t}</button>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your plan</CardTitle>
                <div className="text-sm text-zinc-600">Week view</div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="calendar">
                <TabsList>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="mt-4">
                  <div className="rounded-2xl border overflow-hidden">
                    <div className="grid grid-cols-7 bg-zinc-100 text-xs font-medium">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                        <div key={d} className="p-2 border-r last:border-r-0">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="min-h-[360px] border-r last:border-r-0 p-2 space-y-2">
                          <div className="rounded-xl bg-black text-white p-2 text-xs">
                            <div className="font-semibold">Study Block</div>
                            <div className="text-white/80">7:00–8:00 PM</div>
                            <div className="text-white/80">Reason: Night Owl</div>
                          </div>
                          <div className="rounded-xl bg-zinc-50 border p-2 text-xs">
                            <div className="font-semibold">Busy Slot</div>
                            <div className="text-zinc-600">Class • 10–12</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-4">
                  <div className="space-y-2">
                    {['Calculus Assignment', 'Club Meeting', 'Exam Revision'].map((t) => (
                      <div key={t} className="rounded-xl border p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t}</div>
                          <div className="text-sm text-zinc-600">Due: Tomorrow 6 PM</div>
                        </div>
                        <div className="text-sm text-zinc-500">Pending</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['To-Do','Doing','Done'].map((col) => (
                      <div key={col} className="rounded-2xl border p-3 bg-white">
                        <div className="font-semibold mb-2">{col}</div>
                        <div className="space-y-2">
                          {['Task A','Task B'].map((t) => (
                            <div key={t} className="rounded-xl border p-2 text-sm bg-zinc-50">{t}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
