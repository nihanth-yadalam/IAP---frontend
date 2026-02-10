import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Login to your planner"
      footer={
        <>
          <div>
            New here? <Link className="text-slate-900 underline" to="/signup">Create an account</Link>
          </div>
        </>
      }
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <div className="text-sm text-slate-600 text-center">
          <Link className="underline" to="/forgot">Forgot password?</Link>
        </div>
      </form>
    </AuthShell>
  );
}
