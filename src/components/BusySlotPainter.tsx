import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Day = 0|1|2|3|4|5|6;
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

export type BusyCell = { day: Day; hour: number; busy: boolean };

export function BusySlotPainter({
  value,
  onChange
}: {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}) {
  const [drag, setDrag] = useState<{active: boolean; mode: "add"|"remove"}>({active:false, mode:"add"});
  const cells = useMemo(() => {
    const out: BusyCell[] = [];
    for (let d=0; d<7; d++) for (const h of HOURS) out.push({ day: d as Day, hour: h, busy: !!value[`${d}-${h}`] });
    return out;
  }, [value]);

  function setCell(day: number, hour: number, busy: boolean) {
    const k = `${day}-${hour}`;
    const next = { ...value, [k]: busy };
    if (!busy) delete next[k];
    onChange(next);
  }

  function clearAll() { onChange({}); }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Drag to paint your weekly busy slots (classes/labs).</div>
        <Button variant="outline" size="sm" onClick={clearAll}>Clear</Button>
      </div>

      <div
        className="overflow-auto rounded-2xl border border-slate-200 bg-white"
        onMouseLeave={() => setDrag({active:false, mode:"add"})}
        onMouseUp={() => setDrag({active:false, mode:"add"})}
      >
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200">
            <div className="p-2 text-xs text-slate-500">Time</div>
            {DAYS.map(d => <div key={d} className="p-2 text-xs text-slate-700 font-medium">{d}</div>)}
          </div>

          {HOURS.map(h => (
            <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100">
              <div className="p-2 text-xs text-slate-500">{h}:00</div>
              {Array.from({length:7},(_,d)=>d).map(d => {
                const k = `${d}-${h}`;
                const busy = !!value[k];
                return (
                  <div
                    key={k}
                    className={cn(
                      "h-10 border-l border-slate-100 cursor-pointer select-none",
                      busy ? "bg-slate-900/10" : "bg-white",
                      "hover:bg-slate-900/5"
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const mode = busy ? "remove" : "add";
                      setDrag({active:true, mode});
                      setCell(d, h, mode === "add");
                    }}
                    onMouseEnter={() => {
                      if (!drag.active) return;
                      setCell(d, h, drag.mode === "add");
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500">Tip: start with fixed busy slots only. The AI will schedule around them.</div>
    </div>
  );
}
