import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/AuthShell";
import { api } from "@/lib/api";
import { PasswordStrengthIndicator, validatePassword } from "@/components/ui/password-strength";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setErr("Password does not meet all requirements");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token: token || "demo", new_password: password });
      setSuccess(true);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Password reset"
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        }
      >
        <div className="space-y-3 text-foreground">
          <p className="text-sm text-muted-foreground">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link to="/login">
            <Button variant="gradient" className="w-full h-11 rounded-xl font-semibold shadow-md">
              Sign in
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set new password"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-foreground">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
          />
          {password && confirm && password !== confirm && (
            <p className="text-xs text-destructive font-medium">Passwords do not match</p>
          )}
        </div>
        {err && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{err}</div>}
        <Button
          type="submit"
          disabled={loading || !validatePassword(password) || password !== confirm}
          variant="gradient"
          className="w-full h-11 rounded-xl font-semibold shadow-md"
        >
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}
