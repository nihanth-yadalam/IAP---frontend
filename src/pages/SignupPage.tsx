import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap, Fingerprint } from "lucide-react";
import { PasswordStrengthIndicator, validatePassword } from "@/components/ui/password-strength";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signup(username, email, password, name);
      navigate("/wizard");
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vibrant-orange/20 via-background to-vibrant-pink/20 opacity-40 dark:opacity-20" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Floating decorative blobs */}
      <div className="absolute top-16 right-16 w-80 h-80 rounded-full bg-vibrant-pink/30 blur-3xl animate-float" />
      <div className="absolute bottom-24 left-16 w-72 h-72 rounded-full bg-vibrant-orange/25 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <Card className="relative w-full max-w-md rounded-2xl bg-card text-card-foreground border border-border shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight gradient-text animate-fade-in">
              Schedora
            </h1>
            <CardTitle className="text-xl font-semibold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter your details to get started
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
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
                  className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
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
                  className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
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
                className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
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
                className="rounded-xl h-11 bg-card/80 border-border focus:border-primary transition-all"
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase text-muted-foreground"><span className="bg-card px-2">or</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl font-medium"
              onClick={() => alert("Sign up with Google is not configured. Add OAuth in backend.")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl font-medium"
              onClick={() => alert("Passkey is not configured. Requires WebAuthn backend.")}
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Sign up with passkey
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
