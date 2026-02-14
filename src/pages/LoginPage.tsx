import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, Fingerprint } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(loginInput, password);
      navigate("/dashboard");
    } catch {
      // Error is handled in store
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login" className="text-sm font-medium">Username or Email</Label>
          <Input
            id="login"
            placeholder="student@university.edu"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              to="/forgot"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
          />
        </div>

        {error && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        <Button
          variant="gradient"
          className="w-full h-11 rounded-xl font-semibold text-base shadow-md"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase text-muted-foreground"><span className="bg-card px-2">or</span></div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-xl font-medium"
          onClick={() => alert("Sign in with Google is not configured. Add OAuth in backend.")}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Sign in with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-xl font-medium"
          onClick={() => alert("Passkey sign-in is not configured. Requires WebAuthn backend.")}
        >
          <Fingerprint className="mr-2 h-4 w-4" />
          Sign in with passkey
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
