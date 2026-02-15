import { useEffect, useState, useCallback } from "react";
import { useTaskStore, Task } from "@/stores/useTaskStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, Clock, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import ScheduleDialog from "@/components/ScheduleDialog";

type Column = {
    id: Task["status"];
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
};

const columns: Column[] = [
    { id: "pending", title: "To Do", color: "text-vibrant-orange", bgColor: "bg-vibrant-orange/10", borderColor: "border-vibrant-orange/30" },
    { id: "completed", title: "Done", color: "text-vibrant-green", bgColor: "bg-vibrant-green/10", borderColor: "border-vibrant-green/30" },
    { id: "dropped", title: "Dropped", color: "text-muted-foreground", bgColor: "bg-muted/30", borderColor: "border-muted-foreground/20" },
];

const priorityColors: Record<string, string> = {
    high: "bg-vibrant-pink/15 text-vibrant-pink border-vibrant-pink/30",
    medium: "bg-vibrant-orange/15 text-vibrant-orange border-vibrant-orange/30",
    low: "bg-vibrant-green/15 text-vibrant-green border-vibrant-green/30",
};

const categoryEmoji: Record<string, string> = {
    exam: "📝",
    assignment: "📋",
    extra: "🎭",
};

export default function KanbanPage() {
    const { tasks, fetchTasks, updateTask, isLoading } = useTaskStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const tasksByStatus = useCallback((status: Task["status"]) => {
        return tasks
            .filter(t => t.status === status)
            .sort((a, b) => {
                // Sort by priority (high first), then deadline
                const pOrder = { high: 0, medium: 1, low: 2 };
                const pDiff = pOrder[a.priority] - pOrder[b.priority];
                if (pDiff !== 0) return pDiff;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });
    }, [tasks]);

    function handleDragStart(e: React.DragEvent, taskId: string) {
        setDraggedTask(taskId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", taskId);
    }

    function handleDragOver(e: React.DragEvent, columnId: string) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(columnId);
    }

    function handleDragLeave() {
        setDragOverColumn(null);
    }

    async function handleDrop(e: React.DragEvent, targetStatus: Task["status"]) {
        e.preventDefault();
        setDragOverColumn(null);
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === targetStatus) {
            setDraggedTask(null);
            return;
        }

        try {
            await updateTask(taskId, { status: targetStatus });
        } catch {
            // error handled in store
        }
        setDraggedTask(null);
    }

    function handleDragEnd() {
        setDraggedTask(null);
        setDragOverColumn(null);
    }

    function openEdit(task: Task) {
        setEditingTask(task);
        setDialogOpen(true);
    }

    function openNew() {
        setEditingTask(undefined);
        setDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
                    <p className="text-sm text-muted-foreground mt-1">Drag tasks between columns to update their status.</p>
                </div>
                <Button onClick={openNew} className="rounded-xl shadow-sm hover:shadow-neon transition-all">
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Task
                </Button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {columns.map(col => {
                    const colTasks = tasksByStatus(col.id);
                    const isDragOver = dragOverColumn === col.id;

                    return (
                        <div
                            key={col.id}
                            className={`flex flex-col rounded-2xl border-2 transition-all duration-200 ${isDragOver ? `${col.borderColor} bg-accent/30 scale-[1.01]` : "border-border/50 bg-card/50"
                                }`}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${col.bgColor}`}>
                                <div className="flex items-center gap-2">
                                    <h2 className={`text-sm font-bold uppercase tracking-wider ${col.color}`}>{col.title}</h2>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 rounded-full font-bold">
                                        {colTasks.length}
                                    </Badge>
                                </div>
                                {col.id === "pending" && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={openNew}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Column Body */}
                            <ScrollArea className="flex-1 p-3 min-h-[300px] max-h-[calc(100vh-280px)]">
                                <div className="space-y-2.5">
                                    {colTasks.length === 0 ? (
                                        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-border/40 text-sm text-muted-foreground/60">
                                            {col.id === "pending" ? "No tasks — add one!" : `No ${col.title.toLowerCase()} tasks`}
                                        </div>
                                    ) : (
                                        colTasks.map(task => {
                                            const overdue = task.status === "pending" && isPast(new Date(task.deadline));
                                            const isDragging = draggedTask === task.id;

                                            return (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => openEdit(task)}
                                                    className={`group relative rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isDragging ? "opacity-40 scale-95" : "opacity-100"
                                                        } ${overdue ? "border-destructive/40 bg-destructive/5" : "border-border/50 bg-card hover:border-primary/30"}`}
                                                >
                                                    {/* Drag handle */}
                                                    <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>

                                                    {/* Task content */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-base">{categoryEmoji[task.category] || "📌"}</span>
                                                            <p className="font-medium text-sm leading-tight pr-5">{task.title}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${priorityColors[task.priority]}`}>
                                                                {task.priority}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(task.deadline), "MMM d, h:mm a")}
                                                            </span>
                                                        </div>

                                                        {overdue && (
                                                            <div className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Overdue
                                                            </div>
                                                        )}

                                                        {task.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    );
                })}
            </div>

            {/* Schedule Dialog */}
            <ScheduleDialog open={dialogOpen} onOpenChange={setDialogOpen} taskToEdit={editingTask} />
        </div>
    );
}
