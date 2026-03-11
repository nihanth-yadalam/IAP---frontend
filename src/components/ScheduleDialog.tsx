import { useState, useEffect } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Sparkles, Clock, CalendarDays } from "lucide-react";
import { useTaskStore } from "@/stores/useTaskStore";
import { DatePicker } from "@/components/DatePicker";
import { format, isBefore, isAfter, addMinutes, addDays, setHours, setMinutes } from "date-fns";
import { api } from "@/lib/api";
import { hasConflict } from "@/lib/scheduling";
import { toast } from "sonner";
import { AlertTriangle, Info, Bot } from "lucide-react";

type Category = "exam" | "assignment" | "extra";
type Priority = "low" | "medium" | "high";



export default function ScheduleDialog({
  open,
  onOpenChange,
  taskToEdit,
  defaultMode = "manual",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  taskToEdit?: any;
  defaultMode?: "manual" | "ai";
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
  const [scheduleMode, setScheduleMode] = useState<"manual" | "ai">("manual");
  const [periodStart, setPeriodStart] = useState<Date | undefined>(new Date());
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(addDays(new Date(), 7));
  const [estimatedDurationMins, setEstimatedDurationMins] = useState<number | "">("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [recommendationStatus, setRecommendationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [recommendedSlots, setRecommendedSlots] = useState<any[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [err, setErr] = useState<string | null>(null);
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
    } else {
      setTitle(""); setDescription(""); setCategory("assignment");
      setPriority("medium"); setDate(undefined); setStartTime(""); setEndTime("23:59"); setCourseId("other");
      setScheduleMode(defaultMode);
      setEstimatedDurationMins("");
      setAiReasoning(null);
      setPeriodStart(new Date());
      setPeriodEnd(addDays(new Date(), 7));
      setRecommendationStatus("idle");
      setRecommendedSlots([]);
      setSelectedSlotIndex(null);
      setShowRecommendations(false);
    }
    setErr(null);
    setConflict(null);
  }, [taskToEdit, open, defaultMode]);

  // Proactive Conflict Check
  useEffect(() => {
    const checkConflicts = async () => {
        if (scheduleMode === "ai" || !date || !startTime) {
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
  }, [date, startTime, endTime, taskToEdit, scheduleMode]);

  async function handleAIEstimate() {
      if (!title.trim() || !description.trim()) {
          setErr("Please enter a title and description for AI estimation.");
          return;
      }
      if (courseId === "other") {
          setErr("Please select a specific course for better AI estimation.");
          return;
      }
      setIsEstimating(true);
      setErr(null);
      setAiReasoning(null);
      try {
          const res = await api.post("/tasks/estimate-duration", {
              course_id: Number(courseId),
              task_type: category === "extra" ? "Extracurricular" : category === "exam" ? "Exam" : "Assignment",
              difficulty: priority === "low" ? "Easy" : priority === "high" ? "Hard" : "Medium",
              description: title + "\n" + description,
          });
          setEstimatedDurationMins(res.data.estimated_duration_mins);
          setAiReasoning(res.data.reasoning);
      } catch(e: any) {
          const detail = e?.response?.data?.detail;
          setErr(detail || "Failed to estimate time.");
      } finally {
          setIsEstimating(false);
      }
  }

  async function handleGetRecommendations() {
      if (!title.trim()) { setErr("Please enter a title."); return; }
      if (courseId === "other") { setErr("Please select a specific course for AI scheduling."); return; }
      if (!periodStart || !periodEnd) { setErr("Please select a time range."); return; }
      if (!estimatedDurationMins) { setErr("Please estimate or enter a duration first."); return; }
      
      setRecommendationStatus("loading");
      setErr(null);
      try {
          const res = await api.post("/tasks/recommend-slots", {
              course_id: Number(courseId),
              task_type: category === "extra" ? "Extracurricular" : category === "exam" ? "Exam" : "Assignment",
              difficulty: priority === "low" ? "Easy" : priority === "high" ? "Hard" : "Medium",
              description: title + "\n" + description,
              estimated_duration_mins: Number(estimatedDurationMins),
              period_start: format(periodStart, "yyyy-MM-dd"),
              period_end: format(periodEnd, "yyyy-MM-dd"),
          });
          setRecommendedSlots(res.data.recommendations || []);
          setSelectedSlotIndex(null);
          setRecommendationStatus("success");
          setShowRecommendations(true);
      } catch(e: any) {
          const detail = e?.response?.data?.detail;
          setErr(detail || "Failed to get recommendations. Please try manually scheduling.");
          setRecommendationStatus("error");
      }
  }

  async function handleSubmit() {
    setErr(null);
    if (!title.trim()) { setErr("Title is required."); return; }
    
    let deadlineIso = "";
    let planned_start: string | undefined;

    if (scheduleMode === "manual") {
      if (!date) { setErr("Due date is required."); return; }

      const deadline = new Date(date);
      const [eh, em] = endTime.split(":").map(Number);
      deadline.setHours(eh, em, 0, 0);

      if (deadline.getTime() < Date.now()) {
        setErr("Deadline cannot be in the past.");
        return;
      }
      deadlineIso = deadline.toISOString();

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
    } else {
      if (!showRecommendations || selectedSlotIndex === null) { 
          setErr("Please select an AI recommended slot or switch to manual mode."); 
          return; 
      }
      const slot = recommendedSlots[selectedSlotIndex];
      const slotDate = new Date(slot.date);
      
      const start = new Date(slotDate);
      const [sh, sm] = slot.start_time.split(":").map(Number);
      start.setHours(sh, sm, 0, 0);
      planned_start = start.toISOString();

      const end = new Date(slotDate);
      const [eh, em] = slot.end_time.split(":").map(Number);
      end.setHours(eh, em, 0, 0);
      deadlineIso = end.toISOString();
    }

    try {
      if (scheduleMode === "manual" && planned_start) {
          try {
              const res = await api.get("/schedule/fixed");
              const fixedSlots = res.data || [];
              const deadlineObj = new Date(deadlineIso);
              const isConflicting = hasConflict(
                  new Date(planned_start),
                  deadlineObj,
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

      let payload: any = {
        category, priority, title: title.trim(), description: description.trim(),
        deadline: deadlineIso,
      };
      if (planned_start && scheduleMode === "manual") payload.planned_start = planned_start;
      if (estimatedDurationMins) payload.estimated_duration_mins = Number(estimatedDurationMins);
      if (courseId !== "other") payload.course_id = courseId;

      let savedTaskId = taskToEdit?.id;

      if (taskToEdit) { 
          await updateTask(taskToEdit.id, payload); 
      } else { 
          // Add task and get the response to get the ID for confirm-slot
          const res = await api.post('/tasks', payload);
          savedTaskId = res.data.id;
          // Optimistically add to store since we bypassed addTask for the id
          useTaskStore.getState().fetchTasks(); 
      }

      if (scheduleMode === "ai" && showRecommendations && selectedSlotIndex !== null) {
          const slot = recommendedSlots[selectedSlotIndex];
          await api.post('/tasks/confirm-slot', {
              task_id: Number(savedTaskId),
              scheduled_date: slot.date,
              scheduled_start_time: slot.start_time,
              scheduled_end_time: slot.end_time
          });
          // Refresh tasks to get the updated scheduled times
          useTaskStore.getState().fetchTasks();
          toast.success("Smart schedule confirmed!");
      }

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
      <DialogContent className="sm:max-w-[680px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground">{taskToEdit ? "Edit Task" : "Schedule Task"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {taskToEdit ? "Update the details of your task." : "Add a new task, assignment, or exam."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-5 custom-scrollbar">
          {!taskToEdit && (
            <Tabs value={scheduleMode} onValueChange={(v) => { setScheduleMode(v as "manual" | "ai"); if(v === "manual") setShowRecommendations(false); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-secondary/80 p-1 border border-border/50 shadow-inner">
                <TabsTrigger value="manual" className="rounded-lg font-bold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60">
                   <CalendarDays className="w-4 h-4 mr-2" /> Manual Schedule
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded-lg font-bold transition-all data-[state=active]:bg-vibrant-purple data-[state=active]:text-white data-[state=active]:shadow-md border border-transparent data-[state=active]:border-vibrant-purple/50 data-[state=active]:scale-[1.02]">
                   <Sparkles className="w-4 h-4 mr-2" /> AI Schedule
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="grid gap-5 py-2">
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

          {/* Row 3: Timings based on mode */}
          {scheduleMode === "manual" ? (
            <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
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
          ) : (
            !showRecommendations && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 p-4 rounded-xl bg-vibrant-purple/5 border border-vibrant-purple/10">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-vibrant-purple/70">Time Range (Start Date)</Label>
                  <DatePicker date={periodStart} setDate={setPeriodStart} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-vibrant-purple/70">Time Range (End Date)</Label>
                  <DatePicker date={periodEnd} setDate={setPeriodEnd} />
                </div>
              </div>
            )
          )}

          {conflict && scheduleMode === "manual" && (
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
          {!showRecommendations && (
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Description</Label>
                   {scheduleMode === "ai" && (
                      <span className="text-[10px] text-vibrant-purple animate-pulse flex items-center bg-vibrant-purple/10 px-2 py-0.5 rounded-full">
                        <Info className="w-3 h-3 mr-1" /> Highly recommended for AI to estimate accurately
                      </span>
                   )}
               </div>
               <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." className="rounded-xl resize-none h-24" />
             </div>
          )}

          {scheduleMode === "ai" && (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-end gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex-1 space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Estimated Duration (Mins)
                      </Label>
                      <Input 
                          type="number" 
                          value={estimatedDurationMins} 
                          onChange={(e) => setEstimatedDurationMins(e.target.value ? Number(e.target.value) : "")}
                          placeholder="Wait for estimate or enter manually..."
                          className="rounded-xl border-primary/20 bg-background"
                      />
                  </div>
                  <Button 
                      type="button" 
                      onClick={handleAIEstimate} 
                      disabled={isEstimating || !title.trim() || courseId === "other"} 
                      className="rounded-xl shadow-md bg-gradient-to-r from-vibrant-purple to-primary text-white hover:opacity-90"
                  >
                      {isEstimating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                      Estimate Duration
                  </Button>
               </div>
               
               <Button 
                   type="button" 
                   onClick={handleGetRecommendations} 
                   disabled={recommendationStatus === "loading" || !title.trim() || courseId === "other" || !estimatedDurationMins} 
                   className="w-full rounded-xl shadow-md border-2 border-vibrant-purple/20 bg-vibrant-purple/10 text-vibrant-purple hover:bg-vibrant-purple hover:text-white transition-all mt-2 h-12"
               >
                   {recommendationStatus === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                   <span className="font-bold text-sm tracking-wide">Get Smart Recommendations</span>
               </Button>
               
               {aiReasoning && (
                  <div className="p-4 rounded-xl bg-vibrant-purple/5 border border-vibrant-purple/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Sparkles className="w-12 h-12 text-vibrant-purple" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-vibrant-purple" />
                          <span className="text-sm font-bold text-foreground">AI Reasoning</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed relative z-10 whitespace-pre-wrap">{aiReasoning}</p>
                  </div>
               )}
            </div>
          )}

          {scheduleMode === "ai" && showRecommendations && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 p-1">
                 <div className="flex justify-between items-center mb-4">
                     <Label className="text-base font-bold text-foreground flex items-center">
                         <Sparkles className="w-5 h-5 mr-2 text-vibrant-purple" />
                         Recommended Slots
                     </Label>
                     <Button variant="ghost" size="sm" onClick={() => { setShowRecommendations(false); setScheduleMode("manual"); }} className="text-xs h-8 text-muted-foreground hover:text-vibrant-purple transition-colors">
                        Select Manually
                     </Button>
                 </div>
                 
                 {recommendedSlots.length === 0 ? (
                     <p className="text-sm text-muted-foreground p-4 text-center rounded-xl border border-border bg-secondary/30">No suitable slots found in the selected range.</p>
                 ) : (
                     <RadioGroup value={selectedSlotIndex?.toString()} onValueChange={(v: string) => setSelectedSlotIndex(Number(v))} className="space-y-3">
                         {recommendedSlots.map((slot, idx) => (
                             <div key={idx} className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${selectedSlotIndex === idx ? 'border-vibrant-purple bg-vibrant-purple/5 shadow-sm' : 'border-border/50 bg-card hover:border-vibrant-purple/30'}`}>
                                 <RadioGroupItem value={idx.toString()} id={`slot-${idx}`} className="mt-1 flex-shrink-0" />
                                 <label htmlFor={`slot-${idx}`} className="flex-1 space-y-1.5 cursor-pointer">
                                     <div className="flex items-center justify-between">
                                         <span className="text-sm font-bold text-foreground flex items-center">
                                             {slot.day}, {format(new Date(slot.date), "MMM d")}
                                         </span>
                                         <span className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                                             {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}
                                         </span>
                                     </div>
                                     <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                                         <strong className="text-foreground/80 font-semibold mr-1">Why:</strong>
                                         {slot.reasoning}
                                     </p>
                                 </label>
                             </div>
                         ))}
                     </RadioGroup>
                 )}
              </div>
          )}

          {err && <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div>}
        </div>
        </div>

        <DialogFooter className="border-t border-border p-4 bg-muted/20 shrink-0">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-xl shadow-md" onClick={handleSubmit} disabled={isLoading || !title.trim() || (scheduleMode === "manual" ? (!date || !!conflict) : (!showRecommendations || selectedSlotIndex === null))}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taskToEdit ? "Update" : (scheduleMode === "manual" ? "Save" : "Confirm Slot")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
