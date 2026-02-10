import { useState, useEffect } from "react";
import { useTaskStore, Task } from "@/stores/useTaskStore";
import ScheduleDialog from "@/components/ScheduleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, CheckCircle, Search, ClipboardList } from "lucide-react";
import { format } from "date-fns";

export default function TasksPage() {
    const { tasks, fetchTasks, deleteTask, completeTask, isLoading } = useTaskStore();
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [search, setSearch] = useState("");

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
    const handleDelete = async (id: string) => await deleteTask(id);
    const handleComplete = async (id: string) => await completeTask(id);

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
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task, i) => (
                        <Card
                            key={task.id}
                            className="group relative overflow-hidden rounded-2xl border-border/50 glass-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
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
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-xs text-muted-foreground">
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
        </div>
    );
}
