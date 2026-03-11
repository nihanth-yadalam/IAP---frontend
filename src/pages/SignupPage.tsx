import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, Fingerprint, Mail } from "lucide-react";
import { PasswordStrengthIndicator, validatePassword } from "@/components/ui/password-strength";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthLayout } from "@/components/AuthLayout";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, resendConfirmation, isLoading, error, clearError, signupComplete, signupEmail } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signup(username, email, password, name);
    } catch {
      // Error handled in store
    }
  };

  const handleResend = async () => {
    if (!signupEmail) return;
    try {
      await resendConfirmation(signupEmail);
      setResent(true);
      setTimeout(() => setResent(false), 30000);
    } catch {
      // Error handled in store
    }
  };

  // ── Email confirmation pending screen ──────────────────────────────
  if (signupComplete && signupEmail) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We sent a confirmation link to ${signupEmail}`}
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to confirm your address and activate your account.
          </p>

          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl font-medium"
            onClick={handleResend}
            disabled={isLoading || resent}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {resent ? "Confirmation link sent!" : "Resend confirmation email"}
          </Button>

          <Link to="/login" className="block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details to get started"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-xl h-11 bg-background border-border focus:border-primary transition-all text-slate-900 dark:text-slate-100"
          />
          <PasswordStrengthIndicator password={password} />
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
          disabled={isLoading || !validatePassword(password)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>

      </form>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
