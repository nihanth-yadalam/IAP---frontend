import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children, onOpenSchedule }: { children: React.ReactNode; onOpenSchedule: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">AI Academic Planner</div>
            <span className="text-xs text-slate-500">MVP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onOpenSchedule}>Schedule</Button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                {((user?.name ?? user?.email ?? "U").split(" ").map(s=>s[0]).slice(0,2).join(""))?.toUpperCase()}
              </div>
              <div className="text-sm">{user?.name ?? user?.email}</div>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
