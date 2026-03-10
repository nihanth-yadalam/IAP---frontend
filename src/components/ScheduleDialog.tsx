<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { DatePicker } from "@/components/DatePicker";
import { format, isBefore, isAfter, addMinutes, setHours, setMinutes } from "date-fns";
import { api } from "@/lib/api";
import { hasConflict } from "@/lib/scheduling";
import { toast } from "sonner";
import { AlertTriangle, Info } from "lucide-react";

type Category = "exam" | "assignment" | "extra";
type Priority = "low" | "medium" | "high";

// Mock AI function
async function mockAIEstimate(title: string, category: Category, priority: Priority): Promise<number> {
  return new Promise(resolve => {
    setTimeout(() => {
      let base = 60;
      if (category === "exam") base += 120;
      else if (category === "assignment") base += 60;
      if (priority === "high") base *= 1.5;
      if (title.toLowerCase().includes("final") || title.toLowerCase().includes("project")) base += 180;
      resolve(Math.round(base));
    }, 800);
  });
}


export default function ScheduleDialog({
  open,
  onOpenChange,
  taskToEdit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  taskToEdit?: any;
}) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  const { courses, fetchCourses } = useCourseStore();

  const [category, setCategory] = useState<Category>("assignment");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [courseId, setCourseId] = useState("other");
  const [estimatedDuration, setEstimatedDuration] = useState<number | "">("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showDecomposePrompt, setShowDecomposePrompt] = useState(false);
  const [conflict, setConflict] = useState<{ type: 'task' | 'fixed', title: string } | null>(null);

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      if (taskToEdit.deadline) {
        const d = new Date(taskToEdit.deadline);
        setDate(d);
        setEndTime(format(d, "HH:mm"));
      }
      if (taskToEdit.planned_start) {
        const s = new Date(taskToEdit.planned_start);
        setStartTime(format(s, "HH:mm"));
      } else {
        setStartTime("");
      }
      setCourseId(taskToEdit.course_id || "other");
      setEstimatedDuration(taskToEdit.estimated_duration_mins || "");
    } else {
      setTitle(""); setDescription(""); setCategory("assignment");
      setPriority("medium"); setDate(undefined); setStartTime(""); setEndTime("23:59"); setCourseId("other");
      setEstimatedDuration("");
    }
    setErr(null);
    setShowDecomposePrompt(false);
    setConflict(null);
  }, [taskToEdit, open]);

  // Proactive Conflict Check
  useEffect(() => {
    const checkConflicts = async () => {
        if (!date || !startTime) {
            setConflict(null);
            return;
        }

        const start = new Date(date);
        const [sh, sm] = startTime.split(":").map(Number);
        start.setHours(sh, sm, 0, 0);

        const deadline = new Date(date);
        const [eh, em] = endTime.split(":").map(Number);
        deadline.setHours(eh, em, 0, 0);

        if (start.getTime() >= deadline.getTime()) {
            setConflict(null);
            return;
        }

        try {
            const res = await api.get("/schedule/fixed");
            const fixedSlots = res.data || [];
            
            // Check fixed conflicts
            const fixedConflict = fixedSlots.find((s: any) => {
                const sStart = new Date(s.start_time);
                const sEnd = new Date(s.end_time);
                return (start < sEnd && deadline > sStart);
            });

            if (fixedConflict) {
                setConflict({ type: 'fixed', title: fixedConflict.title });
                return;
            }

            // Check task conflicts
            const otherTasks = useTaskStore.getState().tasks.filter(t => t.id !== taskToEdit?.id && t.status === 'pending');
            const taskConflict = otherTasks.find(t => {
                if (!t.planned_start || !t.deadline) return false;
                const tStart = new Date(t.planned_start);
                const tEnd = new Date(t.deadline);
                return (start < tEnd && deadline > tStart);
            });

            if (taskConflict) {
                setConflict({ type: 'task', title: taskConflict.title });
                return;
            }

            setConflict(null);
        } catch (e) {
            console.error("Conflict check failed", e);
        }
    };

    const timer = setTimeout(checkConflicts, 400);
    return () => clearTimeout(timer);
  }, [date, startTime, endTime, taskToEdit]);

  async function handleSubmit() {
    setErr(null);
    if (!title.trim()) { setErr("Title is required."); return; }
    if (!date) { setErr("Due date is required."); return; }

    // Build deadline datetime
    const deadline = new Date(date);
    const [eh, em] = endTime.split(":").map(Number);
    deadline.setHours(eh, em, 0, 0);

    // Validate: deadline must not be in the past
    if (deadline.getTime() < Date.now()) {
      setErr("Deadline cannot be in the past.");
      return;
    }

    // Build planned_start if provided
    let planned_start: string | undefined;
    if (startTime) {
      const start = new Date(date);
      const [sh, sm] = startTime.split(":").map(Number);
      start.setHours(sh, sm, 0, 0);

      if (start.getTime() < Date.now()) {
        setErr("Start time cannot be in the past.");
        return;
      }
      if (start.getTime() >= deadline.getTime()) {
        setErr("Start time must be before the deadline.");
        return;
      }
      planned_start = start.toISOString();
    }

    try {
      // Conflict Resolution: Check if this overlaps with existing tasks or fixed events
      if (planned_start) {
          try {
              const res = await api.get("/schedule/fixed");
              const fixedSlots = res.data || [];
              const isConflicting = hasConflict(
                  new Date(planned_start),
                  deadline,
                  useTaskStore.getState().tasks.filter(t => t.id !== taskToEdit?.id),
                  fixedSlots
              );
              if (isConflicting) {
                  setErr("Conflict Alert: This move is impossible! It overlaps with a fixed class or existing task.");
                  return;
              }

              const startHr = new Date(planned_start).getHours();
              if (startHr >= 21 && (priority === "high" || category === "exam")) {
                  toast.warning("Burnout Alert: High-drain task at night!", {
                      description: "Scheduling heavy tasks late at night increases fatigue. Consider moving this to your peak hours tomorrow.",
                      duration: 6000,
                  });
              }
          } catch (e) {
              console.error("Failed to fetch fixed slots for conflict check.");
          }
      }

      if (estimatedDuration && Number(estimatedDuration) > 180 && !showDecomposePrompt && !taskToEdit) {
        setShowDecomposePrompt(true);
        return;
      }

      if (showDecomposePrompt) {
         // Handle decomposition
         const chunks = Math.ceil(Number(estimatedDuration) / 60);
         for (let i = 0; i < chunks; i++) {
           const payload: any = {
             category, priority, title: `${title.trim()} (Part ${i + 1}/${chunks})`, description: description.trim(),
             deadline: deadline.toISOString(), estimated_duration_mins: 60
           };
           if (planned_start) payload.planned_start = planned_start;
           if (courseId !== "other") payload.course_id = courseId;
           await addTask(payload);
         }
         onOpenChange(false);
         setShowDecomposePrompt(false);
         return;
      }

      const payload: any = {
        category, priority, title: title.trim(), description: description.trim(),
        deadline: deadline.toISOString(),
      };
      if (estimatedDuration) payload.estimated_duration_mins = Number(estimatedDuration);
      if (planned_start) payload.planned_start = planned_start;
      if (courseId !== "other") payload.course_id = courseId;

      if (taskToEdit) { await updateTask(taskToEdit.id, payload); }
      else { await addTask(payload); }
      onOpenChange(false);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (detail) {
        setErr(detail);
      } else {
        setErr(e?.message || "Failed to save task");
      }
    }
  }

  async function handleAIEstimate() {
      if (!title.trim()) {
          setErr("Please enter a title first for AI estimation.");
          return;
      }
      setIsEstimating(true);
      setErr(null);
      try {
          const duration = await mockAIEstimate(title, category, priority);
          setEstimatedDuration(duration);
      } catch(e) {
          setErr("Failed to estimate time.");
      } finally {
          setIsEstimating(false);
      }
  }

  const categoryEmoji = { exam: "📝", assignment: "📋", extra: "🎭" };
  const priorityEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{taskToEdit ? "Edit Task" : "Schedule Task"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {taskToEdit ? "Update the details of your task." : "Add a new task, assignment, or exam."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Row 1: Category, Priority, Subject */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">{categoryEmoji.exam} Exam</SelectItem>
                  <SelectItem value="assignment">{categoryEmoji.assignment} Assignment</SelectItem>
                  <SelectItem value="extra">{categoryEmoji.extra} Extra Curricular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{priorityEmoji.low} Low</SelectItem>
                  <SelectItem value="medium">{priorityEmoji.medium} Medium</SelectItem>
                  <SelectItem value="high">{priorityEmoji.high} High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Subject / Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Other</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="rounded-xl h-11" />
          </div>

          {/* Row 3: Date, Start Time, End Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Due Date</Label>
              <DatePicker date={date} setDate={setDate} disablePast />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl h-10" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Deadline Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl h-10" />
            </div>
          </div>

          {conflict && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-destructive">Conflict Detected!</p>
                        <p className="text-xs text-destructive/80 mt-1">
                             This slot overlaps with <span className="font-black italic">"{conflict.title}"</span> ({conflict.type === 'fixed' ? 'Fixed Event' : 'Scheduled Task'}). 
                             You cannot save this move without resolving the overlap.
                        </p>
                    </div>
                </div>
            </div>
          )}

          {/* Row 4: Description */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." className="rounded-xl resize-none h-24" />
          </div>

          {/* Row 5: AI Tools */}
          <div className="flex items-end gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="space-y-2 flex-1">
                 <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Estimated Duration (mins)</Label>
                 <Input type="number" value={estimatedDuration} onChange={(e) => {
                     setEstimatedDuration(e.target.value ? Number(e.target.value) : "");
                     setShowDecomposePrompt(false);
                 }} placeholder="e.g. 120" className="rounded-xl" />
              </div>
              <Button type="button" variant="secondary" onClick={handleAIEstimate} disabled={isEstimating} className="rounded-xl flex-shrink-0 bg-primary/10 hover:bg-primary/20 text-primary">
                  {isEstimating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "✨ Magic Estimate"}
              </Button>
          </div>

          {showDecomposePrompt && (
              <div className="p-4 rounded-xl bg-vibrant-orange/10 border border-vibrant-orange/20 animate-fade-in">
                  <p className="text-sm font-semibold text-vibrant-orange mb-2">High Burden Task Detected! (&gt; 3 hrs)</p>
                  <p className="text-sm text-vibrant-orange/80 mb-3">Would you like the AI to break this down into smaller, manageable 1-hour chunks?</p>
                  <div className="flex gap-2">
                      <Button size="sm" onClick={() => setShowDecomposePrompt(false)} variant="outline" className="rounded-lg border-vibrant-orange/20 text-vibrant-orange/80 bg-vibrant-orange/5 hover:bg-vibrant-orange/10">No, keep as one</Button>
                      <Button size="sm" onClick={handleSubmit} className="rounded-lg bg-vibrant-orange hover:bg-vibrant-orange/90 text-white shadow-neon shadow-vibrant-orange/30">Yes, break it down</Button>
                  </div>
              </div>
          )}

          {err && <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div>}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={isLoading || !title.trim() || !date || !!conflict || (showDecomposePrompt === true)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taskToEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
=======
import { useState, useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { DatePicker } from "@/components/DatePicker";
import { format } from "date-fns";

type Category = "exam" | "assignment" | "extra";
type Priority = "low" | "medium" | "high";

export default function ScheduleDialog({
  open,
  onOpenChange,
  taskToEdit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  taskToEdit?: any;
}) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  const { courses, fetchCourses } = useCourseStore();

  const [category, setCategory] = useState<Category>("assignment");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [courseId, setCourseId] = useState("other");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      if (taskToEdit.deadline) {
        const d = new Date(taskToEdit.deadline);
        setDate(d);
        setEndTime(format(d, "HH:mm"));
      }
      if (taskToEdit.planned_start) {
        const s = new Date(taskToEdit.planned_start);
        setStartTime(format(s, "HH:mm"));
      } else {
        setStartTime("");
      }
      setCourseId(taskToEdit.course_id || "other");
    } else {
      setTitle(""); setDescription(""); setCategory("assignment");
      setPriority("medium"); setDate(undefined); setStartTime(""); setEndTime("23:59"); setCourseId("other");
    }
    setErr(null);
  }, [taskToEdit, open]);

  async function handleSubmit() {
    setErr(null);
    if (!title.trim()) { setErr("Title is required."); return; }
    if (!date) { setErr("Due date is required."); return; }

    // Build deadline datetime
    const deadline = new Date(date);
    const [eh, em] = endTime.split(":").map(Number);
    deadline.setHours(eh, em, 0, 0);

    // Validate: deadline must not be in the past
    if (deadline.getTime() < Date.now()) {
      setErr("Deadline cannot be in the past.");
      return;
    }

    // Build planned_start if provided
    let planned_start: string | undefined;
    if (startTime) {
      const start = new Date(date);
      const [sh, sm] = startTime.split(":").map(Number);
      start.setHours(sh, sm, 0, 0);

      if (start.getTime() < Date.now()) {
        setErr("Start time cannot be in the past.");
        return;
      }
      if (start.getTime() >= deadline.getTime()) {
        setErr("Start time must be before the deadline.");
        return;
      }
      planned_start = start.toISOString();
    }

    try {
      const payload: any = {
        category, priority, title: title.trim(), description: description.trim(),
        deadline: deadline.toISOString(),
      };
      if (planned_start) payload.planned_start = planned_start;
      if (courseId !== "other") payload.course_id = courseId;

      if (taskToEdit) { await updateTask(taskToEdit.id, payload); }
      else { await addTask(payload); }
      onOpenChange(false);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (detail) {
        setErr(detail);
      } else {
        setErr(e?.message || "Failed to save task");
      }
    }
  }

  const categoryEmoji = { exam: "📝", assignment: "📋", extra: "🎭" };
  const priorityEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{taskToEdit ? "Edit Task" : "Schedule Task"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {taskToEdit ? "Update the details of your task." : "Add a new task, assignment, or exam."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Row 1: Category, Priority, Subject */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">{categoryEmoji.exam} Exam</SelectItem>
                  <SelectItem value="assignment">{categoryEmoji.assignment} Assignment</SelectItem>
                  <SelectItem value="extra">{categoryEmoji.extra} Extra Curricular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{priorityEmoji.low} Low</SelectItem>
                  <SelectItem value="medium">{priorityEmoji.medium} Medium</SelectItem>
                  <SelectItem value="high">{priorityEmoji.high} High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Subject / Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Other</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="rounded-xl h-11" />
          </div>

          {/* Row 3: Date, Start Time, End Time */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Due Date</Label>
              <DatePicker date={date} setDate={setDate} disablePast />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl h-10" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Deadline Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl h-10" />
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." className="rounded-xl resize-none h-24" />
          </div>

          {err && <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div>}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-xl" onClick={handleSubmit} disabled={isLoading || !title.trim() || !date}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taskToEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
