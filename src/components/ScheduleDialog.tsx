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
