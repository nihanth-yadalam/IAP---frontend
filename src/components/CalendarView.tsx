import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  category: "exam" | "assignment" | "extra";
  title: string;
  description?: string | null;
  deadline: string; // ISO
  status: "pending" | "completed" | "dropped";
  planned_start?: string | null;
  planned_end?: string | null;
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HALF_HOURS = Array.from({ length: 24 }, (_, i) => ({ h: 8 + Math.floor(i / 2), m: i % 2 === 0 ? 0 : 30 })); // 08:00 .. 19:30

function dayIndex(d: Date) {
  // Monday=0 .. Sunday=6
  const js = d.getDay(); // Sun=0
  return (js + 6) % 7;
}

export default function CalendarView({ tasks }: { tasks: Task[] }) {
  const blocks = useMemo(() => {
    return tasks
      .filter(t => t.planned_start && t.planned_end)
      .map(t => {
        const s = new Date(t.planned_start!);
        const e = new Date(t.planned_end!);
        function idx(dt: Date) { return (dt.getHours() - 8) * 2 + (dt.getMinutes() >= 30 ? 1 : 0); }
        const sh = idx(s);
        const eh = Math.max(sh + 1, idx(e));
        return { t, d: dayIndex(s), sh, eh };
      });
  }, [tasks]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200">
          <div className="p-2 text-xs text-slate-500">Time</div>
          {DAYS.map(d => <div key={d} className="p-2 text-xs font-medium text-slate-700">{d}</div>)}
        </div>

        {HALF_HOURS.map(({ h, m }, rowIdx) => (
          <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100">
            <div className="p-2 text-xs text-slate-500">{String(h).padStart(2, "0")}:{m === 0 ? "00" : "30"}</div>
            {Array.from({length:7},(_,d)=>d).map(d => {
              const slotTasks = blocks.filter(b => b.d === d && b.sh <= rowIdx && b.eh > rowIdx);
              return (
                <div key={`${d}-${h}`} className="h-10 border-l border-slate-100 relative">
                  {slotTasks.slice(0,1).map(({t}) => (
                    <div
                      key={t.id}
                      className={cn(
                        "absolute inset-1 rounded-xl px-2 py-1 text-xs border",
                        t.category === "exam" && "bg-rose-50 border-rose-200 text-rose-900",
                        t.category === "assignment" && "bg-amber-50 border-amber-200 text-amber-900",
                        t.category === "extra" && "bg-emerald-50 border-emerald-200 text-emerald-900"
                      )}
                      title={t.description ?? undefined}
                    >
                      <div className="font-semibold truncate">{t.title}</div>
                      <div className="opacity-70 truncate">{t.category}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
