import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GraduationCap } from "lucide-react";

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
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vibrant-purple/20 via-background to-vibrant-blue/20 opacity-40 dark:opacity-20" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      {/* Floating decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-vibrant-purple/30 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-vibrant-blue/25 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-vibrant-pink/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <Card className="relative w-full max-w-md rounded-2xl glass-card border-border/50 animate-scale-in">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your Schedora account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
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
                className="rounded-xl h-11 bg-secondary/50 border-border/60 focus:bg-card transition-colors"
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
                className="rounded-xl h-11 bg-secondary/50 border-border/60 focus:bg-card transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 rounded-xl font-semibold shadow-neon transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
