import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
