import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vibrant-purple/15 via-background to-vibrant-blue/15 dark:from-vibrant-purple/20 dark:to-vibrant-blue/20" />
      <div className="absolute inset-0 backdrop-blur-3xl" />

      {/* Floating decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-vibrant-purple/20 dark:bg-vibrant-purple/30 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-vibrant-blue/15 dark:bg-vibrant-blue/25 blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <Card className="relative w-full max-w-md rounded-2xl bg-card/95 backdrop-blur-xl text-card-foreground border border-border/50 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
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
