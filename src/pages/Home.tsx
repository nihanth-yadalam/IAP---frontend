import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
<<<<<<< HEAD
import { useAuthStore } from '@/stores/useAuthStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect } from 'react'
import { AlertCircle, CalendarClock, XCircle, Sparkles, CheckCircle } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { Typewriter } from '@/components/Typewriter'
import { ProgressRing } from '@/components/ProgressRing'
import { CountUp } from '@/components/CountUp'
import ScheduleDialog from '@/components/ScheduleDialog'
import { Task } from '@/stores/useTaskStore'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { rankTasksForGap } from '@/lib/scheduling'
import GapFillerModal from '@/components/GapFillerModal'
import MissedTaskRecoveryModal from '@/components/MissedTaskRecoveryModal'
import TaskFeedbackDialog from '@/components/TaskFeedbackDialog'

type Category = 'exam' | 'assignment' | 'extra'

const COURSE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  math:       { bg: 'rgba(77,150,255,0.15)',  text: '#4d96ff', dot: '🔵' },
  physics:    { bg: 'rgba(45,212,191,0.15)',  text: '#2dd4bf', dot: '🟢' },
  cs:         { bg: 'rgba(199,125,255,0.15)', text: '#c77dff', dot: '🟣' },
  chemistry:  { bg: 'rgba(251,146,60,0.15)',  text: '#fb923c', dot: '🟠' },
  english:    { bg: 'rgba(251,113,133,0.15)', text: '#fb7185', dot: '🔴' },
  default:    { bg: 'rgba(107,203,119,0.15)', text: '#6bcb77', dot: '🟡' },
}

function getCourseColor(title: string) {
  const t = title.toLowerCase()
  if (t.includes('math') || t.includes('calculus') || t.includes('algebra')) return COURSE_COLORS.math
  if (t.includes('physics') || t.includes('lab')) return COURSE_COLORS.physics
  if (t.includes('cs') || t.includes('code') || t.includes('program') || t.includes('ds')) return COURSE_COLORS.cs
  if (t.includes('chem')) return COURSE_COLORS.chemistry
  if (t.includes('english') || t.includes('essay')) return COURSE_COLORS.english
  return COURSE_COLORS.default
}

export default function HomePage() {
  const { user, logout } = useAuthStore()
=======
import { useAuth } from '@/context/auth'
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts'

type Category = 'exam' | 'assignment' | 'extracurricular'

export default function HomePage() {
  const { user, logout } = useAuth()
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
  const [category, setCategory] = useState<Category>('assignment')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
<<<<<<< HEAD
  
  const [openSchedule, setOpenSchedule] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined)

  // Advanced Flow States
  const [showGapFiller, setShowGapFiller] = useState(false)
  const [gapMinutes, setGapMinutes] = useState(0)
  const [suggestedTask, setSuggestedTask] = useState<Task | null>(null)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryTask, setRecoveryTask] = useState<Task | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)

  const { tasks, fetchTasks, updateTask } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const overdueTasks = tasks.filter(t => t.status === 'pending' && new Date(t.deadline) < new Date())

  const handleReschedule = async (taskId: string, type: 'tomorrow' | 'slot' = 'tomorrow') => {
    if (type === 'slot') {
      const t = tasks.find(x => x.id === taskId);
      setSelectedTask(t);
      setOpenSchedule(true);
      setShowRecovery(false);
      return;
    }
    const tomorrow = addDays(new Date(), 1)
    await updateTask(taskId, { deadline: tomorrow.toISOString(), planned_start: null, planned_end: null })
    setShowRecovery(false);
    toast.success("Task moved to tomorrow.");
  }

  const handleDrop = async (taskId: string) => {
    await updateTask(taskId, { status: 'dropped' })
    setShowRecovery(false);
    toast.info("Task dropped.");
  }

  const handleCompleteSuccess = async (actualMinutes: number, drainIntensity: number, contextNotes: string[]) => {
    if (!taskToComplete) return;
    
    const plannedMins = taskToComplete.estimated_duration_mins || 60;
    const gap = plannedMins - actualMinutes;

    await useTaskStore.getState().completeTask(taskToComplete.id, { actualMinutes, drainIntensity, contextNotes });
    
    if (gap >= 15) {
      const pending = tasks.filter(t => t.status === 'pending' && t.id !== taskToComplete.id);
      const suggestion = rankTasksForGap(gap, pending);
      if (suggestion) {
        setGapMinutes(gap);
        setSuggestedTask(suggestion);
        setShowGapFiller(true);
      } else {
        toast.success("Awesome work! You finished early!");
      }
    } else {
      toast.success("Task completed!");
    }
  }

  const handleAcceptGapTask = async (task: Task) => {
    await updateTask(task.id, { planned_start: new Date().toISOString() });
    setShowGapFiller(false);
    toast.success(`"${task.title}" pulled forward!`);
  }

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks])
  const pendingCount   = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks])
  const totalCount     = completedCount + pendingCount
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const burnoutLevel = useMemo(() => {
    const high = tasks.filter(t => t.status === 'pending' && t.priority === 'high').length
    if (high > 5) return { label: 'High', emoji: '🔥', color: 'text-red-500' }
    if (high > 2) return { label: 'Medium', emoji: '⚡', color: 'text-orange-400' }
    return { label: 'Low', emoji: '🍃', color: 'text-emerald-500' }
  }, [tasks])

  const streak = useMemo(() => {
    const completedToday = tasks.filter(t => {
      if (t.status !== 'completed' || !t.planned_end) return false
      return new Date(t.planned_end).toDateString() === new Date().toDateString()
    }).length
    return completedToday > 0 ? completedToday + 3 : 3
  }, [tasks])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* ── Critical Drain Alert Banner ── */}
      {burnoutLevel.label === 'High' && (
        <div className="bg-destructive/15 border border-destructive/30 rounded-2xl p-4 flex items-center justify-between animate-bounce-subtle shadow-lg shadow-destructive/10">
          <div className="flex items-center gap-3">
             <div className="bg-destructive/20 p-2 rounded-xl">
                <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
             </div>
             <div>
                <h4 className="font-bold text-destructive">Critical Drain Warning!</h4>
                <p className="text-xs text-destructive/80">Your cognitive load is dangerously high. AI recommends rescheduling non-urgent deep work.</p>
             </div>
          </div>
          <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => toast.info("AI is looking for better slots...", { description: "Coming soon: Automatic load balancing." })}>
             Fix my schedule
          </Button>
        </div>
      )}

      {/* ── Header & Stats Bar ── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 animate-slide-up shadow-2xl shadow-primary/5 border border-white/10 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-vibrant-cyan/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <p className="text-xs text-primary/70 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> AI Academic Planner
              </p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                <span className="opacity-80 font-medium">{greeting}, </span>
                <Typewriter
                  texts={[
                    user?.name ?? 'Student',
                    'let\'s crush it today! 🚀',
                    'your AI is ready ✨',
                    'focus mode on. 💪',
                  ]}
                  className="gradient-text"
                />
              </h1>
              <p className="text-muted-foreground text-sm mt-3 max-w-md">
                {pendingCount > 0
                  ? `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} on your plate — focus on the ${burnoutLevel.label === 'High' ? 'urgent' : 'next'} one.`
                  : '🎉 All caught up! Enjoy your free time or get ahead!'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="magic-btn h-12 px-6 rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/95 transition-all active:scale-95">
                    <Sparkles className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Quick Schedule</DialogTitle>
                    <DialogDescription>AI will find the best slot based on your energy levels.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Course / Category</Label>
                      <select
                        className="h-11 w-full rounded-xl border border-border bg-muted/50 px-3 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                      >
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="extra">Extracurricular</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Task Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Study for Midterm" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Units 4-6 review" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <Button className="w-full h-11 rounded-xl mt-2 bg-primary hover:bg-primary/90" onClick={() => toast.success("Task added to your plan!")}>Create Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-white/5 hover:bg-white/5" onClick={logout} title="Logout">
                 <XCircle className="h-5 w-5 opacity-40 hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>

          {/* Integrated Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-white/5">
            {[
              { label: 'Tasks',   value: totalCount,     suffix: '',  emoji: '📋', color: 'text-blue-400' },
              { label: 'Done',    value: completedCount, suffix: '',  emoji: '✅', color: 'text-emerald-400' },
              { label: 'Pending', value: pendingCount,   suffix: '',  emoji: '⌛', color: 'text-orange-400' },
              { label: 'Streak',  value: streak,         suffix: 'd', emoji: '🔥', color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-2 px-4 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-2">
                  <span className="text-lg group-hover:scale-110 transition-transform">{s.emoji}</span>
                  <span className={`text-xl font-bold ${s.color}`}>
                     <CountUp to={s.value} suffix={s.suffix} duration={1000} />
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black opacity-30 group-hover:opacity-60 transition-opacity">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column ── */}
        {/* ── Sidebar Column (Insights & Profile) ── */}
        <section className="lg:col-span-4 space-y-6">
          {/* Action Required (Urgent Notification) */}
          {overdueTasks.length > 0 && (
            <div className="border border-destructive/20 bg-destructive/5 rounded-3xl p-5 animate-scale-in">
                <div className="flex items-center gap-2 text-destructive font-black text-sm uppercase tracking-tighter mb-4">
                  <AlertCircle className="w-4 h-4" /> Action Required
                </div>
                <div className="space-y-3">
                    {overdueTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                          <p className="font-bold text-sm truncate mb-2">{task.title}</p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => { setRecoveryTask(task); setShowRecovery(true); }} 
                            className="w-full h-8 text-[10px] rounded-xl bg-destructive hover:bg-destructive/90 text-white border-none"
                          >
                            Resolve Conflict
                          </Button>
                      </div>
                    ))}
                </div>
            </div>
          )}

          {/* Combined Insights Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-8 animate-slide-up">
            {/* Daily Focus */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-30 mb-6">Daily Progress</p>
              <ProgressRing
                value={progressPct}
                size={140}
                strokeWidth={10}
                label={`${progressPct}%`}
                sublabel="focused"
              />
              <div className="flex gap-8 mt-6">
                <div className="text-center">
                   <div className="text-xl font-black text-emerald-400">{completedCount}</div>
                   <div className="text-[9px] uppercase tracking-tighter opacity-50">Done</div>
                </div>
                <div className="text-center">
                   <div className="text-xl font-black text-orange-400">{pendingCount}</div>
                   <div className="text-[9px] uppercase tracking-tighter opacity-50">To-Do</div>
                </div>
              </div>
            </div>

            <Separator className="opacity-10" />

            {/* AI Personality & Stats */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-vibrant-purple/10 flex items-center justify-center text-xl animate-float">🦉</div>
                    <div>
                      <div className="text-xs font-bold">The Night Owl</div>
                      <div className="text-[10px] opacity-40 italic">Focus peaks @ 8PM</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-400">{burnoutLevel.emoji} {burnoutLevel.label}</div>
                    <div className="text-[10px] opacity-40">Burnout risk</div>
                  </div>
               </div>
               
               <p className="text-[11px] leading-relaxed text-muted-foreground bg-muted/20 p-3 rounded-xl border border-white/5 italic">
                  "I've updated your schedule to prioritize high-deep-work tasks after dinner tonight."
               </p>
            </div>

            <Separator className="opacity-10" />

            {/* Quick Context / Filters */}
            <div className="space-y-3">
               <p className="text-[10px] uppercase tracking-widest font-black opacity-30">Quick Tags</p>
               <div className="flex flex-wrap gap-2">
                  {['Math', 'Exams', 'Code', 'Deep Work', 'Urgent'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* ── Right Column ── */}
        {/* ── Main Canvas (Your Plan) ── */}
        <section className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-6 border border-white/5 animate-slide-up h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" /> Your Plan
              </h3>
              <div className="text-[10px] uppercase font-bold tracking-widest opacity-30">Week view</div>
            </div>
            
            <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="rounded-xl">
=======

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
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="mt-4">
                  <div className="rounded-2xl border overflow-hidden">
<<<<<<< HEAD
                    <div className="grid grid-cols-7 bg-gradient-to-r from-primary/10 to-vibrant-cyan/10 text-xs font-bold">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                        <div key={d} className="p-2 border-r last:border-r-0 text-center text-muted-foreground">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const cc = Object.values(COURSE_COLORS)[i % 5]
                        return (
                          <div key={i} className="min-h-[300px] border-r last:border-r-0 p-2 space-y-2">
                            <div className="rounded-xl p-2 text-xs text-white font-semibold" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                              <div>Study Block</div>
                              <div className="opacity-80">7:00–8:00 PM</div>
                            </div>
                            <div className="rounded-xl border p-2 text-xs" style={{ background: cc.bg, color: cc.text, borderColor: cc.text + '30' }}>
                              <div className="font-bold">Busy Slot</div>
                              <div className="opacity-80">Class 10–12</div>
                            </div>
                          </div>
                        )
                      })}
=======
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
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-4">
                  <div className="space-y-2">
<<<<<<< HEAD
                    {tasks.slice(0, 5).map((t, i) => {
                      const cc = getCourseColor(t.title)
                      return (
                        <div key={t.id}
                          className="glass-card rounded-xl p-3 flex items-center justify-between animate-slide-up hover:-translate-y-0.5 transition-transform"
                          style={{ animationDelay: `${i * 60}ms` }}>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span style={{ color: cc.text }}>{cc.dot}</span>
                              {t.title}
                              {new Date(t.deadline) < new Date() && t.status === 'pending' && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive text-destructive-foreground uppercase tracking-widest">
                                      Overdue
                                  </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Due: {format(new Date(t.deadline), 'MMM d, h:mm a')}
                            </div>
                            {/* Priority gradient bar */}
                            <div className={`priority-bar priority-bar-${t.priority}`} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                              style={{ background: t.status === 'completed' ? '#6bcb7722' : '#ffd93d22', color: t.status === 'completed' ? '#6bcb77' : '#ffd93d' }}>
                              {t.status === 'completed' ? '✅ Done' : '⏳ Pending'}
                            </span>
                            {t.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg hover:bg-emerald-500/20 text-emerald-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskToComplete(t);
                                  setShowFeedback(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {tasks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No tasks yet — add one to get started!</p>
                    )}
=======
                    {['Calculus Assignment', 'Club Meeting', 'Exam Revision'].map((t) => (
                      <div key={t} className="rounded-xl border p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t}</div>
                          <div className="text-sm text-zinc-600">Due: Tomorrow 6 PM</div>
                        </div>
                        <div className="text-sm text-zinc-500">Pending</div>
                      </div>
                    ))}
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<<<<<<< HEAD
                    {[
                      { col: 'To-Do',  tasks: tasks.filter(t => t.status === 'pending'),   color: '#ffd93d', bg: 'rgba(255,217,61,0.08)'  },
                      { col: 'Doing',  tasks: tasks.filter(t => t.status === 'in_progress' as any), color: '#4d96ff', bg: 'rgba(77,150,255,0.08)' },
                      { col: 'Done',   tasks: tasks.filter(t => t.status === 'completed'), color: '#6bcb77', bg: 'rgba(107,203,119,0.08)' },
                    ].map(({ col, tasks: colTasks, color, bg }) => (
                      <div key={col} className="rounded-2xl border p-3 glass-card" style={{ borderColor: color + '30' }}>
                        <div className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color }}>
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                          {col} <span className="ml-auto text-xs font-bold opacity-60">{colTasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colTasks.slice(0, 3).map((t, i) => (
                            <div key={t.id} className="rounded-xl p-2 text-xs font-medium animate-fade-in"
                              style={{ background: bg, animationDelay: `${i * 50}ms` }}>
                              {t.title}
                              <div className={`priority-bar priority-bar-${t.priority} mt-1`} />
                            </div>
                          ))}
                          {colTasks.length === 0 && <div className="text-xs text-muted-foreground text-center py-3">Empty</div>}
=======
                    {['To-Do','Doing','Done'].map((col) => (
                      <div key={col} className="rounded-2xl border p-3 bg-white">
                        <div className="font-semibold mb-2">{col}</div>
                        <div className="space-y-2">
                          {['Task A','Task B'].map((t) => (
                            <div key={t} className="rounded-xl border p-2 text-sm bg-zinc-50">{t}</div>
                          ))}
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
<<<<<<< HEAD
          </div>
        </section>
      </div>

      <ScheduleDialog
          open={openSchedule}
          onOpenChange={(open) => {
              setOpenSchedule(open);
              if (!open) setSelectedTask(undefined);
          }}
          taskToEdit={selectedTask}
      />

      <GapFillerModal 
        open={showGapFiller}
        onOpenChange={setShowGapFiller}
        gapMinutes={gapMinutes}
        suggestedTask={suggestedTask}
        onAccept={handleAcceptGapTask}
      />

      <MissedTaskRecoveryModal 
        open={showRecovery}
        onOpenChange={setShowRecovery}
        task={recoveryTask}
        onReschedule={handleReschedule}
        onDrop={handleDrop}
      />

      <TaskFeedbackDialog 
        open={showFeedback}
        onOpenChange={setShowFeedback}
        task={taskToComplete || undefined}
        onComplete={handleCompleteSuccess}
      />
=======
            </CardContent>
          </Card>
        </section>
      </main>
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
    </div>
  )
}
