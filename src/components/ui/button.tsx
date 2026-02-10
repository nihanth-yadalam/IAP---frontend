import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Button({ className, variant="default", size="default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" && "border border-slate-200 bg-white hover:bg-slate-50",
        variant === "ghost" && "hover:bg-slate-100",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-6",
        className
      )}
      {...props}
    />
  );
}
