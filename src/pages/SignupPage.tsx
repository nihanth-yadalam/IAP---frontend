import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      nav("/wizard");
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      footer={
        <>
          <div>
            Already have an account? <Link className="text-slate-900 underline" to="/login">Login</Link>
          </div>
        </>
      }
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
