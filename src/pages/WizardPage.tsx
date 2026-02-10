import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusySlotPainter } from "@/components/BusySlotPainter";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

type Chronotype = "morning" | "balanced" | "night";
type WorkStyle = "deep" | "mixed" | "sprints";

const steps = ["Welcome", "Profile", "Chronotype", "Attention", "Busy Slots", "Google Calendar", "Finish"];

export default function WizardPage() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [chronotype, setChronotype] = useState<Chronotype>("balanced");
  const [workStyle, setWorkStyle] = useState<WorkStyle>("mixed");
  const [sessionLength, setSessionLength] = useState(60);
  const [busyGrid, setBusyGrid] = useState<Record<string, boolean>>({});
  const [calendarWrite, setCalendarWrite] = useState(false);

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  async function saveProfile() {
    await api.post("/profile/baseline", { name, university, major, chronotype, work_style: workStyle, preferred_session_mins: sessionLength });
  }

  async function saveBusySlots() {
    // convert grid to ranges per day (hour blocks)
    const slots: { day_of_week: number; start_hour: number; end_hour: number; title?: string; slot_type: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const hours = Object.keys(busyGrid)
        .filter(k => k.startsWith(`${d}-`))
        .map(k => parseInt(k.split("-")[1], 10))
        .sort((a, b) => a - b);
      // collapse contiguous hours into ranges
      let i = 0;
      while (i < hours.length) {
        const start = hours[i];
        let end = start + 1;
        i++;
        while (i < hours.length && hours[i] === end) { end++; i++; }
        slots.push({ day_of_week: d, start_hour: start, end_hour: end, slot_type: "fixed", title: "Busy" });
      }
    }
    await api.post("/busy-slots/bulk", { slots });
  }

  async function saveCalendarPrefs() {
    await api.post("/calendar/prefs", { write_enabled: calendarWrite });
  }

  async function next() {
    if (step === 1) await saveProfile();
    if (step === 4) await saveBusySlots();
    if (step === 5) await saveCalendarPrefs();
    setStep(s => Math.min(s + 1, steps.length - 1));
  }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  async function connectGoogle() {
    // Frontend-only: this is a UI stub.
    alert("Google Calendar connect is a UI stub in the frontend-only build.");
  }
  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Quick Setup</div>
            <div className="text-sm text-slate-600">Step {step + 1} of {steps.length}: {steps[step]}</div>
          </div>
          <div className="text-sm text-slate-600">{progress}%</div>
        </div>

        <Card>
          <CardHeader />
          <CardContent>
            {step === 0 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">Welcome 👋</div>
                <div className="text-slate-600">
                  This planner is not just a to-do list. It learns your habits and schedules tasks around your real availability.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  You’ll set: <b>baseline preferences</b>, <b>weekly busy slots</b>, and optional <b>Google Calendar sync</b>.
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">Your profile</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm mb-1">Name</div>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <div className="text-sm mb-1">University</div>
                    <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="University" />
                  </div>
                  <div>
                    <div className="text-sm mb-1">Major</div>
                    <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Major/Department" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">Chronotype</div>
                <div className="text-slate-600">Are you a Morning Lark or a Night Owl?</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ChoiceCard label="Morning Lark" active={chronotype === "morning"} onClick={() => setChronotype("morning")} desc="Best focus early day" />
                  <ChoiceCard label="Balanced" active={chronotype === "balanced"} onClick={() => setChronotype("balanced")} desc="Steady focus through day" />
                  <ChoiceCard label="Night Owl" active={chronotype === "night"} onClick={() => setChronotype("night")} desc="Peak focus late evening" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold">Attention span</div>
                  <div className="text-slate-600">Do you prefer deep work or short sprints?</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ChoiceCard label="Deep Work" active={workStyle === "deep"} onClick={() => setWorkStyle("deep")} desc="90–180 min blocks" />
                  <ChoiceCard label="Mixed" active={workStyle === "mixed"} onClick={() => setWorkStyle("mixed")} desc="Flexible blocks" />
                  <ChoiceCard label="Sprints" active={workStyle === "sprints"} onClick={() => setWorkStyle("sprints")} desc="25–45 min bursts" />
                </div>
                <div>
                  <div className="text-sm mb-1">Ideal session length (minutes)</div>
                  <Input type="number" value={sessionLength} onChange={(e) => setSessionLength(parseInt(e.target.value || "0", 10))} min={15} max={240} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">Weekly busy slots</div>
                <BusySlotPainter value={busyGrid} onChange={setBusyGrid} />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">Google Calendar</div>
                <div className="text-slate-600">
                  Connect to import existing events as busy slots. Optionally allow writing scheduled tasks back.
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button onClick={connectGoogle}>Connect Google Calendar</Button>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={calendarWrite} onChange={(e) => setCalendarWrite(e.target.checked)} />
                    Allow writing tasks to my Google Calendar
                  </label>
                </div>
                <div className="text-xs text-slate-500">Note: In local demo, Google OAuth is stubbed unless you add keys.</div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-3">
                <div className="text-lg font-semibold">You’re all set ✅</div>
                <div className="text-slate-600">
                  Go to the home page and click <b>Schedule</b> to add your first exam/assignment.
                </div>
                <Button onClick={() => nav("/app")}>Go to Home</Button>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0}>Back</Button>
              <div className="flex items-center gap-2">
                {step < steps.length - 1 ? (
                  <Button onClick={next}>{step === steps.length - 2 ? "Finish" : "Next"}</Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChoiceCard({ label, desc, active, onClick }: { label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-slate-600 mt-1">{desc}</div>
    </button>
  );
}
