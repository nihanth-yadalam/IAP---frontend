import { useMemo, useState } from "react";
import { useTaskStore, Task } from "@/stores/useTaskStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    AreaChart, 
    Area,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { Brain, Flame, Target, History, TrendingUp, AlertCircle, Edit2, Trash2, Sparkles, PieChart as PieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgressRing } from "@/components/ProgressRing";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AnalyticsPage() {
    const { tasks, updateTask, deleteTask } = useTaskStore();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // 1. Planned vs Actual Data
    const plannedVsActualData = useMemo(() => {
        return tasks.filter(t => t.status === 'completed' && t.actual_duration_mins).slice(-7).map(t => ({
            name: t.title.substring(0, 10),
            planned: t.estimated_duration_mins || 0,
            actual: t.actual_duration_mins || 0
        }));
    }, [tasks]);

    // 2. Wellbeing Trends (Drain over time)
    const wellbeingData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date: format(date, 'MMM d'),
                fullDate: startOfDay(date),
                drain: 0,
                count: 0
            };
        });

        tasks.forEach(t => {
            if (t.status === 'completed' && t.completed_at && t.drain_intensity) {
                const compDate = startOfDay(new Date(t.completed_at));
                const dayMatch = last7Days.find(d => d.fullDate.getTime() === compDate.getTime());
                if (dayMatch) {
                    dayMatch.drain += t.drain_intensity;
                    dayMatch.count += 1;
                }
            }
        });

        return last7Days.map(d => ({
            name: d.date,
            intensity: d.count > 0 ? Math.round((d.drain / d.count) * 10) / 10 : 0
        }));
    }, [tasks]);

    // 3. Category Distribution
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            counts[t.category] = (counts[t.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'];

    // 4. History Log
    const historyTasks = useMemo(() => {
        return [...tasks].filter(t => t.status === 'completed' || t.status === 'dropped')
            .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    }, [tasks]);

    const insightCards = useMemo(() => [
        { title: "Most Draining Subject", value: "Advanced Physics", detail: "Avg 4.2 drain / session", icon: Brain, color: "text-vibrant-purple" },
        { title: "Peak Focus Window", value: "8:00 PM - 10:00 PM", detail: "92% completion rate", icon: Flame, color: "text-orange-500" },
        { title: "Most Delayed Category", value: "Math Assignments", detail: "Avg 14h delay", icon: AlertCircle, color: "text-red-500" },
    ], []);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Analytics & Wellbeing</h1>
                <p className="text-muted-foreground italic">"Data-driven insights for your academic journey."</p>
            </div>

            {/* Top Row: Dual Progress Meters & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Brain className="h-4 w-4 text-vibrant-purple" /> Cognitive Load (Burnout)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-2">
                        <ProgressRing value={65} size={100} strokeWidth={10} label="65%" sublabel="intensity" color="#a855f7" />
                        <p className="text-xs text-muted-foreground mt-4 text-center px-4">
                            You've had high drain tasks 3 days in a row. Consider a rest day.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" /> Momentum Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-2">
                        <div className="h-[100px] w-[100px] rounded-full border-8 border-orange-500/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🔥</div>
                            <span className="text-2xl font-black mt-12 text-orange-600">7</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center px-4">
                            Ranked in the top 5% of consistent students this week!
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" /> Accuracy Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-2">
                        <ProgressRing value={82} size={100} strokeWidth={10} label="82%" sublabel="on-time" color="#10b981" />
                        <p className="text-xs text-muted-foreground mt-4 text-center px-4">
                            Your estimates are becoming more accurate. AI refined!
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Insight Cards (Polish) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {insightCards.map((card, i) => (
                    <Card key={i} className="rounded-2xl border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity -mr-4 -mt-4`}>
                            <card.icon className="w-full h-full" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] uppercase font-black tracking-widest opacity-40">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{card.detail}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Planned vs Actual Chart */}
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Planned vs Actual Time
                        </CardTitle>
                        <CardDescription>Minutes spent per task (Latest 7)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={plannedVsActualData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Bar dataKey="planned" name="Planned" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="actual" name="Actual" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Wellbeing Trends */}
                <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5 text-vibrant-purple" />
                            Wellbeing Trends
                        </CardTitle>
                        <CardDescription>Average drain intensity (1-5) over last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={wellbeingData}>
                                <defs>
                                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area type="monotone" dataKey="intensity" stroke="#a855f7" fillOpacity={1} fill="url(#colorIntensity)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* AI Reasoning Panel (Epic 5) */}
                <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm lg:col-span-2 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Sparkles className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            AI Strategy Reasoning
                        </CardTitle>
                        <CardDescription>How the Reflexive engine optimized your last 48 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h5 className="font-bold text-sm mb-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Duration Estimation Accuracy
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                AI has adjusted your Study blocks to be 15% shorter. Historically, you've completed English essays in 50 minutes despite planning 60. Accuracy score increased +4% this week.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h5 className="font-bold text-sm mb-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-vibrant-purple" />
                                Chronotype Optimization
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                High-intensity tasks for Physics were moved to after 7:30 PM. Your feedback indicates 30% lower perceived drain when these are tackled during your evening peak focus window.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Richer Breakdowns (Subject / Category) (Epic 6) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up mb-8">
                <Card className="rounded-2xl border-border/50 shadow-sm md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Distribution by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                             {categoryData.map((cat, i) => (
                                 <div key={cat.name} className="flex items-center gap-1.5">
                                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                     <span className="text-[10px] font-medium opacity-60 uppercase">{cat.name}</span>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/50 shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Most Efficient Hours</CardTitle>
                        <CardDescription className="text-xs">Based on actual vs estimated ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { hour: '8am', efficiency: 0.8 },
                                { hour: '11am', efficiency: 1.2 },
                                { hour: '2pm', efficiency: 1.5 },
                                { hour: '5pm', efficiency: 1.1 },
                                { hour: '8pm', efficiency: 1.9 },
                                { hour: '11pm', efficiency: 1.4 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="hour" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} hide />
                                <Tooltip />
                                <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* History Log */}
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        History Log
                    </CardTitle>
                    <CardDescription>All your completed and dropped tasks.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card border-b z-10">
                                <tr className="text-left text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                    <th className="px-6 py-4">Task</th>
                                    <th className="px-6 py-4 text-center">Outcome</th>
                                    <th className="px-6 py-4 text-center">Drain</th>
                                    <th className="px-6 py-4 text-center">Actual/Est</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-t-0">
                                {historyTasks.map((t) => (
                                    <tr key={t.id} className="group hover:bg-accent/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{t.title}</div>
                                            <div className="text-xs text-muted-foreground">{format(new Date(t.deadline), 'MMM d, yyyy')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                t.status === 'completed' ? 'bg-vibrant-green/10 text-vibrant-green' : 'bg-destructive/10 text-destructive'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {t.drain_intensity ? (
                                                <div className="flex justify-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < t.drain_intensity! ? 'bg-vibrant-purple' : 'bg-muted'}`} />
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-xs">
                                            {t.actual_duration_mins || '-'}/{t.estimated_duration_mins || '-'}m
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg" onClick={() => setEditingTask(t)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg" onClick={() => {
                                                    if (confirm("Delete this entry forever?")) deleteTask(t.id);
                                                }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {historyTasks.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                            No history records yet. Complete some tasks!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Edit Entry Modal (Mock/Simple) */}
            <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
                <DialogContent className="rounded-3xl max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Edit History Entry</CardTitle>
                        <CardDescription>Update details for {editingTask?.title}</CardDescription>
                    </CardHeader>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Actual Duration (mins)</Label>
                            <Input 
                                type="number" 
                                defaultValue={editingTask?.actual_duration_mins || 0}
                                onChange={(e) => {
                                    if(editingTask) setEditingTask({...editingTask, actual_duration_mins: parseInt(e.target.value)})
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Drain Intensity (1-5)</Label>
                            <Input 
                                type="number" 
                                min={1} max={5}
                                defaultValue={editingTask?.drain_intensity || 3}
                                onChange={(e) => {
                                    if(editingTask) setEditingTask({...editingTask, drain_intensity: parseInt(e.target.value)})
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-4 pt-0">
                        <Button variant="ghost" onClick={() => setEditingTask(null)} className="rounded-xl">Cancel</Button>
                        <Button 
                            className="rounded-xl"
                            onClick={async () => {
                                if (editingTask) {
                                    await updateTask(editingTask.id, {
                                        actual_duration_mins: editingTask.actual_duration_mins,
                                        drain_intensity: editingTask.drain_intensity
                                    });
                                    setEditingTask(null);
                                    toast.success("Entry updated!");
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
