import { useState, useEffect } from "react";
import { useTaskStore, Task } from "@/stores/useTaskStore";
import CalendarView from "@/components/calendar/CalendarView";
import ScheduleDialog from "@/components/ScheduleDialog";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
    const { tasks, fetchTasks } = useTaskStore();
    const [openSchedule, setOpenSchedule] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleTaskSelect = (task: Task) => {
        setSelectedTask(task);
        setOpenSchedule(true);
    };

    const handleSlotSelect = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedTask(undefined);
        setOpenSchedule(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-7 w-7 text-primary" />
                        Calendar
                    </h1>
                    <p className="text-muted-foreground">Manage your schedule and deadlines.</p>
                </div>
                <Button
                    onClick={() => { setSelectedTask(undefined); setOpenSchedule(true); }}
                    className="rounded-xl shadow-neon transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <div className="flex-1 min-h-0 rounded-2xl border border-border/50 bg-card p-4 shadow-sm animate-fade-in">
                <CalendarView
                    tasks={tasks}
                    onSelectTask={handleTaskSelect}
                    onSelectSlot={handleSlotSelect}
                />
            </div>

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
