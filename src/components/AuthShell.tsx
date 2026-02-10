import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold">AI Academic Planner</div>
          <div className="text-sm text-slate-600 mt-1">{title}</div>
        </div>
        <Card>
          <CardHeader />
          <CardContent>{children}</CardContent>
        </Card>
        {footer ? <div className="mt-4 text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}
