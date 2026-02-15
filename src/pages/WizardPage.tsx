import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusySlotPainter } from "@/components/BusySlotPainter";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle2, ArrowRight, ArrowLeft, X, Trophy, Save, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type Chronotype = "morning" | "balanced" | "night" | undefined | null;
type WorkStyle = "deep" | "mixed" | "sprints" | undefined | null;

const steps = [
  { id: "intro", title: "Welcome" },
  { id: "profile", title: "Profile" },
  { id: "chronotype", title: "Energy" },
  { id: "workstyle", title: "Focus" },
  { id: "availability", title: "Availability" },
  { id: "integrations", title: "Connect" },
  { id: "finish", title: "Ready" }
];

export default function WizardPage() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Form State
  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);
  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null);
  const [sessionLength, setSessionLength] = useState(60);
  const [busyGrid, setBusyGrid] = useState<Record<string, boolean>>({});
  const [calendarWrite, setCalendarWrite] = useState(false);

  // Gamification: Profile Strength
  const profileStrength = useMemo(() => {
    let score = 0;
    if (name) score += 10;
    if (university) score += 10;
    if (major) score += 10;
    if (chronotype) score += 15;
    if (workStyle) score += 15;
    if (Object.keys(busyGrid).length > 0) score += 20;
    if (calendarWrite) score += 20;
    return Math.min(score, 100);
  }, [name, university, major, chronotype, workStyle, busyGrid, calendarWrite]);

  // Auto-save simulation
  useEffect(() => {
    if (step > 0 && step < steps.length - 1) {
      setAutoSaveState("saving");
      const timer = setTimeout(() => setAutoSaveState("saved"), 800);
      return () => clearTimeout(timer);
    }
  }, [name, university, major, chronotype, workStyle, busyGrid, calendarWrite, step]);


  async function saveProfile() {
    try {
      await api.post("/profile/baseline", { name, university, major, chronotype, work_style: workStyle, preferred_session_mins: sessionLength });
    } catch (e) { console.error("Save profile failed", e); }
  }

  async function saveBusySlots() {
    try {
      const slots: { day_of_week: number; start_hour: number; end_hour: number; title?: string; slot_type: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const hours = Object.keys(busyGrid)
          .filter(k => k.startsWith(`${d}-`))
          .map(k => parseInt(k.split("-")[1], 10))
          .sort((a, b) => a - b);
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
    } catch (e) { console.error("Save slots failed", e); }
  }

  async function next() {
    if (step === 1) saveProfile();
    if (step === 4) saveBusySlots();

    setDirection(1);
    setStep(s => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  }

  function skip() {
    if (confirm("Are you sure? Skipping setup means we can't optimize your schedule effectively.")) {
      nav("/dashboard");
    }
  }

  const progress = Math.round(((step) / (steps.length - 1)) * 100);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-background to-purple-500/5 -z-10" />
      <div className="absolute top-0 w-full h-2 bg-muted/50 backdrop-blur-sm z-50">
        <motion.div
          className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          Schedora
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {step < steps.length - 1 && (
            <Button variant="ghost" size="sm" onClick={skip} className="text-muted-foreground hover:text-foreground">
              Skip Setup
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl relative z-10 px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <div className="min-h-[500px] flex flex-col justify-center">
              {/* Step Content Render */}
              <StepContent
                step={step}
                data={{ name, university, major, chronotype, workStyle, sessionLength, busyGrid, calendarWrite }}
                setters={{ setName, setUniversity, setMajor, setChronotype, setWorkStyle, setSessionLength, setBusyGrid, setCalendarWrite }}
              />

              {/* Navigation Footer */}
              <div className="mt-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button variant="ghost" size="lg" onClick={back} className="gap-2 pl-2 text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-5 w-5" /> Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  {autoSaveState === "saving" && <span className="text-sm text-muted-foreground flex items-center gap-1"><Save className="h-4 w-4 animate-pulse" /> Saving...</span>}
                  {autoSaveState === "saved" && <span className="text-sm text-green-500 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Saved</span>}

                  {step < steps.length - 1 ? (
                    <Button onClick={next} size="lg" className="gap-2 text-lg px-8 rounded-full shadow-lg shadow-primary/25">
                      {step === 0 ? "Get Started" : "Next Step"} <ArrowRight className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button onClick={() => nav("/dashboard")} size="lg" className="gap-2 bg-green-500 hover:bg-green-600 text-white text-lg px-8 rounded-full shadow-lg shadow-green-500/20">
                      Go to Dashboard <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gamification Badge */}
      {step > 0 && step < steps.length - 1 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 bg-card border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-3 z-20"
        >
          <div className="relative">
            <Trophy className={cn("h-5 w-5", profileStrength > 80 ? "text-yellow-500" : "text-muted-foreground")} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">Profile Strength</span>
            <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${profileStrength}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-bold">{profileStrength}%</span>
        </motion.div>
      )}
    </div>
  );
}

// --- Step Components ---

function StepContent({ step, data, setters }: any) {
  switch (step) {
    case 0: // Intro
      return (
        <div className="space-y-6 text-center max-w-lg mx-auto py-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <GraduationCap className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Let's solve the "Cold Start"</h1>
          <p className="text-muted-foreground text-lg">
            An intelligent planner needs to know <b>you</b> to work effectively.
            We ask these questions to build a baseline schedule that adapts to your energy levels, not just your deadlines.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left bg-muted/30 p-6 rounded-xl border border-border/50">
            <FeatureItem icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} text="Dynamic Scheduling tailored to your habits" />
            <FeatureItem icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} text="Burnout prevention with smart breaks" />
            <FeatureItem icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} text="Conflict detection with your real life" />
          </div>
        </div>
      );
    case 1: // Profile
      return (
        <div className="space-y-6">
          <StepHeader
            title="Tell us about yourself"
            desc="This helps us categorize your academic load."
            tooltip="We use your major and university to benchmark your workload against similar students."
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={data.name} onChange={(e) => setters.setName(e.target.value)} placeholder="e.g. Alex Smith" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">University / Institution</label>
              <Input value={data.university} onChange={(e) => setters.setUniversity(e.target.value)} placeholder="e.g. Stanford University" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Major / Field of Study</label>
              <Input value={data.major} onChange={(e) => setters.setMajor(e.target.value)} placeholder="e.g. Computer Science" className="h-12" />
            </div>
          </div>
        </div>
      );
    case 2: // Chronotype
      return (
        <div className="space-y-6">
          <StepHeader
            title="When do you work best?"
            desc="Your energy fluctuates. We schedule hard tasks when you're peaking."
            tooltip="Circadian rhythms affect cognitive performance. We schedule 'Deep Work' during your peak hours."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectableCard
              selected={data.chronotype === "morning"}
              onClick={() => setters.setChronotype("morning")}
              title="Early Bird"
              desc="I focus best in the mornings (6AM - 11AM)."
              icon="🌅"
            />
            <SelectableCard
              selected={data.chronotype === "balanced"}
              onClick={() => setters.setChronotype("balanced")}
              title="Balanced"
              desc="I have steady energy throughout the work day (9AM - 5PM)."
              icon="⚖️"
            />
            <SelectableCard
              selected={data.chronotype === "night"}
              onClick={() => setters.setChronotype("night")}
              title="Night Owl"
              desc="My brain turns on when the sun goes down (8PM - 2AM)."
              icon="🦉"
            />
          </div>
        </div>
      );
    case 3: // Work Style
      return (
        <div className="space-y-6">
          <StepHeader
            title="How do you focus?"
            desc="Standardizing your session lengths prevents burnout."
            tooltip="This sets the default duration for generated study blocks. You can override this per task later."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectableCard
              selected={data.workStyle === "deep"}
              onClick={() => setters.setWorkStyle("deep")}
              title="Deep Diver"
              desc="Long, uninterrupted blocks (90m+). Good for coding/writing."
              icon="🐋"
            />
            <SelectableCard
              selected={data.workStyle === "mixed"}
              onClick={() => setters.setWorkStyle("mixed")}
              title="Balanced"
              desc="Standard academic hours (45-60m). Good for lectures/reading."
              icon="📚"
            />
            <SelectableCard
              selected={data.workStyle === "sprints"}
              onClick={() => setters.setWorkStyle("sprints")}
              title="Sprinter"
              desc="Short, intense bursts (25m Pomodoro). Good for drills."
              icon="🏃"
            />
          </div>
          <div className="pt-4">
            <label className="text-sm font-medium mb-2 block">Preferred Max Session Length (Minutes)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20" max="180" step="10"
                value={data.sessionLength}
                onChange={(e) => setters.setSessionLength(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono bg-muted px-3 py-1 rounded-md min-w-[3rem] text-center">{data.sessionLength}m</span>
            </div>
          </div>
        </div>
      );
    case 4: // Availability
      return (
        <div className="space-y-6 h-full flex flex-col">
          <StepHeader
            title="Define your 'Busy Slots'"
            desc="Paint over times you absolutely CANNOT study (classes, work, sleep)."
            tooltip="We treat these slots as rigid constraints. No tasks will ever be scheduled here automatically."
          />
          <div className="flex-1 min-h-[300px] border rounded-xl overflow-hidden bg-muted/20">
            <BusySlotPainter value={data.busyGrid} onChange={setters.setBusyGrid} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Click and drag to paint red (busy). Click again to clear.
          </p>
        </div>
      );
    case 5: // Integrations
      return (
        <div className="space-y-6">
          <StepHeader
            title="Sync your life"
            desc="Connect Google Calendar to import events automatically."
            tooltip="We import events as 'Busy Slots' so we don't double-book you."
          />
          <div className="flex flex-col gap-4">
            <div className={`p-6 border rounded-xl flex items-center justify-between transition-colors ${data.calendarWrite ? "border-primary bg-primary/5" : "bg-card"}`}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">G</div>
                <div>
                  <div className="font-semibold">Google Calendar</div>
                  <div className="text-sm text-muted-foreground">Import events & write-back schedules</div>
                </div>
              </div>
              <Button variant={data.calendarWrite ? "default" : "outline"} onClick={() => setters.setCalendarWrite(!data.calendarWrite)}>
                {data.calendarWrite ? "Connected" : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      );
    case 6: // Finish
      return (
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          <h1 className="text-4xl font-bold">You're all set!</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            We've built your baseline profile. Schedora is now ready to organize your academic life.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
            <div className="bg-muted p-4 rounded-xl">
              <div className="text-2xl font-bold">{Object.keys(data.busyGrid).length > 10 ? "Optimized" : "basic"}</div>
              <div className="text-xs text-muted-foreground">Schedule Base</div>
            </div>
            <div className="bg-muted p-4 rounded-xl">
              <div className="text-2xl font-bold">{data.chronotype}</div>
              <div className="text-xs text-muted-foreground">Energy Profile</div>
            </div>
          </div>
        </div>
      );
    default: return null;
  }
}

function StepHeader({ title, desc, tooltip }: { title: string, desc: string, tooltip?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

function SelectableCard({ title, desc, icon, selected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl relative overflow-hidden group",
        selected
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
          : "border-border bg-background/60 backdrop-blur-sm hover:border-primary/50 hover:bg-background/80"
      )}
    >
      {selected && (
        <div className="absolute top-4 right-4 text-primary bg-white rounded-full p-1 shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="font-bold text-xl text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
    </div>
  )
}

function FeatureItem({ icon, text }: any) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
