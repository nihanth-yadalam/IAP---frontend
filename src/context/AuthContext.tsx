import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "@/lib/api";

type User = { id: string; email: string; name?: string | null };

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "aap_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      setAuthToken(t);
      api.get("/auth/me").then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setToken(null);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const t = res.data.access_token as string;
    localStorage.setItem(TOKEN_KEY, t);
    setAuthToken(t);
    setToken(t);
    const me = await api.get("/auth/me");
    setUser(me.data);
  }

  async function signup(name: string, email: string, password: string) {
    await api.post("/auth/signup", { name, email, password });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, isLoading, login, signup, logout }), [user, token, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
