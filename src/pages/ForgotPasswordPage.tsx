import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/AuthShell";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      footer={
        <div>
          <Link className="underline" to="/login">Back to login</Link>
        </div>
      }
    >
      {sent ? (
        <div className="space-y-3 text-foreground">
          <p className="text-sm text-muted-foreground">
            If an account exists for <b>{email}</b>, you’ll receive a reset email (demo mode logs to backend console).
          </p>
          <Link to="/reset-password?token=demo" className="text-primary font-medium hover:underline block">Set new password (demo)</Link>
          <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm">Return to login</Link>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input 
            placeholder="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all" 
          />
          {err ? <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div> : null}
          <Button 
            className="w-full h-11 rounded-xl font-semibold shadow-md" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
