import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardWidgets({
  nextUp,
  completed,
  total,
  burnoutLevel,
  streak
}: {
  nextUp?: { title: string; when: string };
  completed: number;
  total: number;
  burnoutLevel: "Low" | "Medium" | "High";
  streak: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Next Up</div>
        </CardHeader>
        <CardContent>
          {nextUp ? (
            <div>
              <div className="font-medium">{nextUp.title}</div>
              <div className="text-sm text-slate-600">{nextUp.when}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">No upcoming tasks yet.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Daily Progress</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-semibold">{pct}%</div>
            <div className="text-sm text-slate-600">{completed}/{total} done</div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Burnout Meter</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">{burnoutLevel}</div>
            <div className="text-sm text-slate-600">based on drain logs</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Streak</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{streak} days</div>
          <div className="text-sm text-slate-600">Consistency meter</div>
        </CardContent>
      </Card>
    </div>
  );
}
