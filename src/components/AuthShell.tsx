import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vibrant-purple/20 via-background to-vibrant-blue/20 opacity-40 dark:opacity-20" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Floating decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-vibrant-purple/30 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-vibrant-blue/25 blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <Card className="relative w-full max-w-md rounded-2xl bg-card text-card-foreground border border-border shadow-xl animate-scale-in">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight gradient-text animate-fade-in">
              Schedora
            </h1>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {children}
        </CardContent>
        {footer && (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
