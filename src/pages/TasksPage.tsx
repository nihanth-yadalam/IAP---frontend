import { useState, useEffect } from "react";
import { useTaskStore, Task } from "@/stores/useTaskStore";
import ScheduleDialog from "@/components/ScheduleDialog";
<<<<<<< HEAD
import TaskFeedbackDialog from "@/components/TaskFeedbackDialog";
=======
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<<<<<<< HEAD
import { Plus, Edit, Trash2, CheckCircle, Search, ClipboardList, Sparkles, Loader2, RotateCcw, PartyPopper } from "lucide-react";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { toast } from "sonner";
import { Confetti } from "@/components/Confetti";
import { TaskCardSkeleton } from "@/components/Skeleton";
import { rankTasksForGap } from "@/lib/scheduling";
import GapFillerModal from "@/components/GapFillerModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
=======
import { Plus, Edit, Trash2, CheckCircle, Search, ClipboardList } from "lucide-react";
import { format } from "date-fns";
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851

export default function TasksPage() {
    const { tasks, fetchTasks, deleteTask, completeTask, isLoading } = useTaskStore();
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
<<<<<<< HEAD
    const [taskForFeedback, setTaskForFeedback] = useState<Task | undefined>(undefined);
    const [openFeedback, setOpenFeedback] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);
    const [gapTaskSuggestion, setGapTaskSuggestion] = useState<Task | null>(null);
    const { updateTask } = useTaskStore();
=======
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [search, setSearch] = useState("");
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(t => {
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setOpenSchedule(true);
    };
<<<<<<< HEAD
    
    const handleDelete = async (id: string) => {
        if (confirm("Task deleted. Would you like to re-optimize the free time in your schedule to fill the gap?")) {
            await handleSmartSchedule();
        }
        await deleteTask(id);
    };

    const handleRestore = async (id: string) => {
        await updateTask(id, { status: "pending" });
        toast.success("Task restored to pending.");
    }

    const handleComplete = (task: Task) => {
         setTaskForFeedback(task);
         setOpenFeedback(true);
    };

    const handleFeedbackComplete = async (actualMinutes: number, drainIntensity: number, contextNotes: string[]) => {
        if(!taskForFeedback) return;
        
        const plannedMins = taskForFeedback.estimated_duration_mins || 60;
        const gap = plannedMins - actualMinutes;

        await completeTask(taskForFeedback.id, { actualMinutes, drainIntensity, contextNotes });
        setConfettiActive(true);
        setOpenFeedback(false);
        setTaskForFeedback(undefined);

        if (gap >= 15) {
            const pendingTasks = tasks.filter(t => t.status === "pending" && t.id !== taskForFeedback.id);
            const bestTask = rankTasksForGap(gap, pendingTasks);
            if (bestTask) {
                setGapTaskSuggestion(bestTask);
            } else {
                toast.success('🎊 Task completed! Great work!');
            }
        } else {
            toast.success('🎊 Task completed! Great work!');
        }
    };
=======
    const handleDelete = async (id: string) => await deleteTask(id);
    const handleComplete = async (id: string) => await completeTask(id);
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851

    const categoryColor = (cat: string) => {
        switch (cat) {
            case "exam": return "bg-vibrant-pink/15 text-vibrant-pink font-bold border border-vibrant-pink/20";
            case "assignment": return "bg-vibrant-blue/15 text-vibrant-blue font-bold border border-vibrant-blue/20";
            default: return "bg-vibrant-orange/15 text-vibrant-orange font-bold border border-vibrant-orange/20";
        }
    };

    const priorityDot = (p: string) => {
        switch (p) {
            case "high": return "bg-destructive shadow-sm shadow-destructive/50";
            case "medium": return "bg-vibrant-orange shadow-sm shadow-vibrant-orange/50";
            default: return "bg-vibrant-green shadow-sm shadow-vibrant-green/50";
        }
    };

<<<<<<< HEAD
    const handleSmartSchedule = async () => {
        setIsScheduling(true);
        try {
            const pendingTasks = tasks.filter(t => t.status === "pending" && !t.planned_start);
            if (pendingTasks.length === 0) {
                toast.info("No pending, unscheduled tasks found.");
                return;
            }
            
            // Mock AI scheduling logic: schedule pending tasks starting from tomorrow 9 AM
            let currentDate = setMinutes(setHours(new Date(), 9), 0);
            currentDate.setDate(currentDate.getDate() + 1); // target tomorrow
            
            for (const task of pendingTasks) {
                const start = new Date(currentDate);
                const end = addHours(start, 2); // default 2 hours blocks
                await updateTask(task.id, {
                    planned_start: start.toISOString(),
                    planned_end: end.toISOString()
                });
                // increment for next task + 1 hour gap
                currentDate = addHours(end, 1);
                // reset to 9AM next day if past 5PM
                if (currentDate.getHours() >= 17) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    currentDate.setHours(9, 0, 0, 0);
                }
            }
            toast.success(`Successfully AI scheduled ${pendingTasks.length} tasks!`);
            await fetchTasks();
        } catch (e) {
            toast.error("Failed to run Smart Schedule.");
        } finally {
             setIsScheduling(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* 🎉 Confetti celebration */}
            <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">✅ My Tasks</h1>
                    <p className="text-muted-foreground">Manage your assignments and to-dos.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSmartSchedule}
                        disabled={isScheduling}
                        className="rounded-xl shadow-md transition-all duration-200 bg-vibrant-blue hover:bg-vibrant-blue/90 magic-btn"
                    >
                        {isScheduling ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4 animate-twinkle" />}
                        ✨ Smart Schedule
                    </Button>
                    <Button
                        onClick={() => { setSelectedTask(undefined); setOpenSchedule(true); }}
                        className="rounded-xl shadow-neon transition-all duration-200 hover:-translate-y-0.5 active:scale-95 magic-btn animate-pulse-glow"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Task
                    </Button>
                </div>
=======
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage your assignments and to-dos.</p>
                </div>
                <Button
                    onClick={() => { setSelectedTask(undefined); setOpenSchedule(true); }}
                    className="rounded-xl shadow-neon transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Task
                </Button>
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 rounded-xl bg-secondary/50 border-border/60 focus:bg-card transition-colors"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px] rounded-xl bg-secondary/50 border-border/60">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Task Grid */}
            {filteredTasks.length === 0 ? (
                <div className="py-16 text-center space-y-4 animate-fade-in">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <ClipboardList className="h-10 w-10 text-primary/50" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-foreground/80">
                            {search || filterStatus !== "all" ? "No matching tasks" : "No tasks yet"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {search || filterStatus !== "all"
                                ? "Try adjusting your filters."
                                : "Create your first task to start planning!"}
                        </p>
                    </div>
                    {!search && filterStatus === "all" && (
                        <Button
                            onClick={() => { setSelectedTask(undefined); setOpenSchedule(true); }}
                            className="rounded-xl mt-2"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create Task
                        </Button>
                    )}
                </div>
<<<<<<< HEAD
            ) : isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <TaskCardSkeleton key={i} />
                    ))}
                </div>
=======
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task, i) => (
                        <Card
                            key={task.id}
<<<<<<< HEAD
                            className={`group relative overflow-hidden rounded-2xl border border-border/50 glass-card hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 hover:-translate-y-1.5 animate-slide-up glow-card ${
                                task.status === 'completed'
                                    ? 'border-vibrant-green/30 bg-gradient-to-br from-vibrant-green/5 to-transparent'
                                    : task.status === 'dropped'
                                    ? 'opacity-50'
                                    : ''
                            }`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Shimmer streak on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)', backgroundSize: '200% 100%' }} />

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1.5 min-w-0">
                                        <CardTitle className={`text-base font-semibold truncate ${ task.status === 'completed' ? 'line-through text-muted-foreground' : '' }`}>
                                            {task.status === 'completed' && <span className="not-italic mr-1">✅</span>}
                                            {task.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${categoryColor(task.category)}`}>
                                                {task.category === 'exam' ? '📝 ' : task.category === 'assignment' ? '📘 ' : '🎯 '}{task.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className={`h-2 w-2 rounded-full animate-twinkle ${priorityDot(task.priority)}`} style={{ animationDelay: `${i * 0.3}s` }} />
                                                {task.priority === 'high' ? '🔥 ' : task.priority === 'medium' ? '⚡ ' : '🌿 '}{task.priority}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Completed badge */}
                                    {task.status === 'completed' && (
                                        <span className="shrink-0 text-lg animate-bounce-in" title="Completed!">🏆</span>
                                    )}
=======
                            className="group relative overflow-hidden rounded-2xl border-border/50 bg-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1.5 min-w-0">
                                        <CardTitle className="text-base font-semibold truncate">{task.title}</CardTitle>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${categoryColor(task.category)}`}>
                                                {task.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(task.priority)}`} />
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-xs text-muted-foreground">
<<<<<<< HEAD
                                    📅 Due {format(new Date(task.deadline), "MMM d, yyyy · h:mm a")}
                                </p>
                                {/* Priority gradient bar */}
                                <div className={`priority-bar priority-bar-${task.priority}`} />
                                {task.planned_start && (
                                    <p className="text-xs text-vibrant-blue mt-1 font-medium">
                                        🕐 Scheduled: {format(new Date(task.planned_start), "MMM d, h:mm a")}
                                    </p>
                                )}
                                {/* Actions */}
                                <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                    {task.status !== "completed" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-110 transition-transform" onClick={() => handleComplete(task)} title="Mark Complete">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                    )}
                                    {task.status === "completed" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:scale-110 transition-transform" onClick={() => handleRestore(task.id)} title="Restore to Pending">
                                            <RotateCcw className="h-4 w-4 text-orange-600" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:scale-110 transition-transform" onClick={() => handleEdit(task)} title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-transform" onClick={() => handleDelete(task.id)} title="Delete">
=======
                                    Due {format(new Date(task.deadline), "MMM d, yyyy · h:mm a")}
                                </p>
                                {/* Actions */}
                                <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                    {task.status !== "completed" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30" onClick={() => handleComplete(task.id)} title="Complete">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(task)} title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleDelete(task.id)} title="Delete">
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ScheduleDialog
                open={openSchedule}
                onOpenChange={(open) => {
                    setOpenSchedule(open);
                    if (!open) setSelectedTask(undefined);
                }}
                taskToEdit={selectedTask}
            />
<<<<<<< HEAD

            <TaskFeedbackDialog
               open={openFeedback}
               onOpenChange={(open) => {
                   setOpenFeedback(open);
                   if (!open) setTaskForFeedback(undefined);
               }}
               task={taskForFeedback}
               onComplete={handleFeedbackComplete}
            />

            <GapFillerModal 
                open={!!gapTaskSuggestion}
                onOpenChange={(open) => !open && setGapTaskSuggestion(null)}
                gapMinutes={30} // default for simplicity in this view
                suggestedTask={gapTaskSuggestion}
                onAccept={async (task) => {
                    await updateTask(task.id, { planned_start: new Date().toISOString() });
                    setGapTaskSuggestion(null);
                    toast.success("Task pulled forward!");
                }}
            />
=======
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
        </div>
    );
}
