import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/AuthShell";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSent(true);
      // If SMTP is not configured, backend returns the token directly
      if (res.data?.token) {
        setResetToken(res.data.token);
      }
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
        <div className="space-y-4 text-foreground">
          {resetToken ? (
            <>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">⚠️ Development Mode</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email is not configured. Use the link below to reset your password.
                </p>
              </div>
              <Link
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="block w-full"
              >
                <Button variant="gradient" className="w-full h-11 rounded-xl font-semibold shadow-md">
                  Reset your password →
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">✉️ Email sent!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We've sent a password reset link to <b>{email}</b>. Check your inbox (and spam folder).
                </p>
              </div>
            </>
          )}
          <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm block text-center">
            Return to login
          </Link>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all"
          />
          {err ? <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div> : null}
          <Button
            className="w-full h-11 rounded-xl font-semibold shadow-md"
            variant="gradient"
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
