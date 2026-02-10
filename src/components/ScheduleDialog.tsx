import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type Category = "exam" | "assignment" | "extra";
type Priority = "low" | "medium" | "high";

export default function ScheduleDialog({
  open,
  onOpenChange,
  onCreated
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [category, setCategory] = useState<Category>("assignment");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      await api.post("/tasks", {
        category,
        priority,
        title,
        description,
        deadline
      });
      setTitle(""); setDescription(""); setDeadline("");
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Schedule a task</DialogTitle>
        <DialogDescription>Add an exam, assignment, or extracurricular item.</DialogDescription>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm mb-1">Category</div>
              <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" value={category} onChange={(e)=>setCategory(e.target.value as Category)}>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="extra">Extra curricular</option>
              </select>
            </div>
            <div>
              <div className="text-sm mb-1">Priority</div>
              <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" value={priority} onChange={(e)=>setPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-sm mb-1">Title</div>
            <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., DS Lab Eval" />
          </div>

          <div>
            <div className="text-sm mb-1">Description</div>
            <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Optional details…" />
          </div>

          <div>
            <div className="text-sm mb-1">Deadline</div>
            <Input type="datetime-local" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
          </div>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} disabled={loading || !title || !deadline}>
              {loading ? "Saving…" : "Save & schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
