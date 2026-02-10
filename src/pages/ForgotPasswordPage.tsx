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
      await api.post("/auth/forgot", { email });
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
        <div className="space-y-3">
          <div className="text-sm text-slate-700">
            If an account exists for <b>{email}</b>, you’ll receive a reset email (demo mode logs to backend console).
          </div>
          <Link className="underline text-slate-900" to="/login">Return to login</Link>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
