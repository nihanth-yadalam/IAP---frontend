import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  category: "exam" | "assignment" | "extra";
  title: string;
  deadline: string;
  status: "pending" | "completed" | "dropped";
  priority: "low" | "medium" | "high";
};

export default function ListView({ tasks, onMarkDone }: { tasks: Task[]; onMarkDone: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {tasks.map(t => (
        <Card key={t.id}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-slate-600">
                {t.category} • {t.priority} • due {new Date(t.deadline).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">{t.status}</div>
              {t.status === "pending" ? <Button variant="outline" onClick={() => onMarkDone(t.id)}>Done</Button> : null}
            </div>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 ? <div className="text-sm text-slate-600">No tasks yet.</div> : null}
    </div>
  );
}
