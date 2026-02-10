import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Flame, ListTodo, TrendingUp, Sparkles } from "lucide-react";

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

  const energyLabel = burnoutLevel === "Low" ? "High" : burnoutLevel === "Medium" ? "Balanced" : "Low";
  const energyColor = burnoutLevel === "Low" ? "text-vibrant-green" : burnoutLevel === "Medium" ? "text-vibrant-orange" : "text-destructive";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Next Up Widget */}
      <Card className="group relative overflow-hidden rounded-2xl border-border/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 glass-card">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vibrant-purple to-vibrant-blue rounded-t-2xl" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">Next Up</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vibrant-purple/10">
            <ListTodo className="h-4 w-4 text-vibrant-purple" />
          </div>
        </CardHeader>
        <CardContent>
          {nextUp ? (
            <div className="space-y-1">
              <div className="text-lg font-bold truncate gradient-text" title={nextUp.title}>{nextUp.title}</div>
              <p className="text-xs text-muted-foreground">{nextUp.when}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-lg font-semibold text-muted-foreground/70">All clear ✨</div>
              <p className="text-xs text-muted-foreground">No upcoming tasks</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Progress Widget */}
      <Card className="group relative overflow-hidden rounded-2xl border-border/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 glass-card">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vibrant-blue to-vibrant-cyan rounded-t-2xl" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Progress</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vibrant-blue/10">
            <CheckCircle2 className="h-4 w-4 text-vibrant-blue" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pct}%</div>
          <p className="text-xs text-muted-foreground">{completed}/{total} tasks completed</p>
          <div className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-vibrant-blue to-vibrant-cyan transition-all duration-700 ease-out shadow-neon"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Energy Level */}
      <Card className="group relative overflow-hidden rounded-2xl border-border/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 glass-card">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vibrant-orange to-vibrant-pink rounded-t-2xl" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">Energy Level</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vibrant-orange/10">
            <Flame className={`h-4 w-4 ${burnoutLevel === "High" ? "text-destructive animate-pulse-glow" : "text-vibrant-orange"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${energyColor}`}>{energyLabel}</div>
          <p className="text-xs text-muted-foreground">Based on recent activity</p>
        </CardContent>
      </Card>

      {/* Streak Widget */}
      <Card className="group relative overflow-hidden rounded-2xl border-border/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 glass-card">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vibrant-green to-vibrant-cyan rounded-t-2xl" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vibrant-green/10">
            <TrendingUp className="h-4 w-4 text-vibrant-green" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{streak}</span>
            <span className="text-sm font-medium text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
        </CardContent>
      </Card>
    </div>
  );
}
