import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleDialog from "@/components/ScheduleDialog";
import CalendarView from "@/components/CalendarView";
import ListView from "@/components/ListView";
import KanbanView from "@/components/KanbanView";
import { DashboardWidgets } from "@/components/DashboardWidgets";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Task = {
  id: string;
  category: "exam" | "assignment" | "extra";
  title: string;
  description?: string | null;
  deadline: string;
  status: "pending" | "completed" | "dropped";
  priority: "low" | "medium" | "high";
  planned_start?: string | null;
  planned_end?: string | null;
};

export default function HomePage() {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get("/tasks");
      setTasks(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const nextUp = useMemo(() => {
    const upcoming = tasks
      .filter(t => t.status === "pending")
      .slice()
      .sort((a,b)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime())[0];
    if (!upcoming) return undefined;
    return { title: upcoming.title, when: `Due ${new Date(upcoming.deadline).toLocaleString()}` };
  }, [tasks]);

  const completed = tasks.filter(t => t.status === "completed").length;
  const burnoutLevel: "Low"|"Medium"|"High" = "Medium";
  const streak = 3;

  async function markDone(id: string) {
    await api.post(`/tasks/${id}/complete`, { actual_duration_mins: 60, drain_intensity: 3 });
    await refresh();
  }

  async function runSchedule() {
    await api.post("/schedule/run");
    await refresh();
  }

  return (
    <AppShell onOpenSchedule={() => setOpenSchedule(true)}>
      <ScheduleDialog open={openSchedule} onOpenChange={setOpenSchedule} onCreated={refresh} />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold">Setup checklist</div>
            <div className="text-sm text-slate-600 mt-1">If you haven’t completed setup, do it now.</div>
            <div className="mt-3 flex gap-2">
              <Link to="/wizard"><Button variant="outline">Open Wizard</Button></Link>
              <Button onClick={runSchedule}>Run Scheduling</Button>
            </div>
          </div>
          <DashboardWidgets nextUp={nextUp} completed={completed} total={tasks.length} burnoutLevel={burnoutLevel} streak={streak} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="calendar" className="w-full">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TabsList>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-600">{loading ? "Loading…" : `${tasks.length} tasks`}</div>
                </div>
              </div>

              <TabsContent value="calendar" className="mt-3">
                <CalendarView tasks={tasks} />
              </TabsContent>

              <TabsContent value="list" className="mt-3">
                <ListView tasks={tasks} onMarkDone={markDone} />
              </TabsContent>

              <TabsContent value="kanban" className="mt-3">
                <KanbanView tasks={tasks} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
