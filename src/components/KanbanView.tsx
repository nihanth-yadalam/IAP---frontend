import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  category: "exam" | "assignment" | "extra";
  status: "pending" | "completed" | "dropped";
};

function Col({ title, items }: { title: string; items: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold">{title}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="font-medium">{i.title}</div>
            <div className="text-xs text-slate-600 mt-1">{i.category}</div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-sm text-slate-600">No items.</div> : null}
      </CardContent>
    </Card>
  );
}

export default function KanbanView({ tasks }: { tasks: Task[] }) {
  const todo = tasks.filter(t => t.status === "pending");
  const done = tasks.filter(t => t.status === "completed");
  const dropped = tasks.filter(t => t.status === "dropped");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Col title="To‑Do" items={todo} />
      <Col title="Done" items={done} />
      <Col title="Dropped" items={dropped} />
    </div>
  );
}
