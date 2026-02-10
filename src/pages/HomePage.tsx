import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { DashboardWidgets } from "@/components/DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Calendar as CalendarIcon, ArrowRight, Sparkles, ClipboardList } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function HomePage() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const nextUp = useMemo(() => {
    const upcoming = tasks
      .filter(t => t.status === "pending")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
    if (!upcoming) return undefined;
    return {
      title: upcoming.title,
      when: `Due ${format(new Date(upcoming.deadline), "MMM d, h:mm a")}`
    };
  }, [tasks]);

  const completed = tasks.filter(t => t.status === "completed").length;
  const burnoutLevel: "Low" | "Medium" | "High" = "Medium";
  const streak = 3;

  const quickActions = [
    { label: "New Task", icon: Plus, to: "/tasks", variant: "default" as const },
    { label: "Add Course", icon: BookOpen, to: "/courses", variant: "outline" as const },
    { label: "Calendar", icon: CalendarIcon, to: "/calendar", variant: "outline" as const },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}, <span className="capitalize bg-gradient-to-r from-vibrant-purple to-vibrant-pink bg-clip-text text-transparent">{user?.username || "Student"}</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to}>
              <Button
                variant={action.variant}
                size="sm"
                className="rounded-xl shadow-sm hover:shadow-neon transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <action.icon className="mr-1.5 h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Widgets */}
      <DashboardWidgets
        nextUp={nextUp}
        completed={completed}
        total={tasks.length}
        burnoutLevel={burnoutLevel}
        streak={streak}
      />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="md:col-span-2 rounded-2xl border-border/50 shadow-sm glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Recent Tasks
            </CardTitle>
            <CardDescription>Your latest assignments and to-dos.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse-glow">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <p className="font-medium text-foreground/80">No tasks yet</p>
                  <p className="text-sm text-muted-foreground">Create your first task to get started!</p>
                </div>
                <Link to="/tasks">
                  <Button size="sm" className="rounded-xl mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 p-3.5 hover:bg-accent/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-medium leading-none truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(task.deadline), "MMM d, h:mm a")} · <span className="capitalize">{task.category}</span>
                        </div>
                      </div>
                      <div className={`shrink-0 ml-3 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${task.status === 'completed' ? 'bg-vibrant-green/15 text-vibrant-green' :
                        task.priority === 'high' ? 'bg-vibrant-pink/15 text-vibrant-pink' :

                          'bg-secondary text-secondary-foreground'
                        }`}>
                        {task.status === 'completed' ? 'Done' : task.status}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {tasks.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Link to="/tasks">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 rounded-lg">
                    View all tasks <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel */}
        <Card className="rounded-2xl border-border/50 shadow-sm glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Snapshot
            </CardTitle>
            <CardDescription>Coming up next on your calendar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-accent/20">
              <div className="text-center space-y-2">
                <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No events scheduled soon</p>
              </div>
            </div>
            <Link to="/calendar">
              <Button variant="outline" className="w-full rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-colors">
                Open Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
