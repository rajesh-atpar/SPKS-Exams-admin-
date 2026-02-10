"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-api";

// JWT-like: 3 base64 segments separated by dots
function looksLikeToken(s: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s.trim());
}

function findTokenInObject(obj: unknown): string | null {
  if (typeof obj === "string" && looksLikeToken(obj)) return obj;
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  for (const value of Object.values(o)) {
    if (typeof value === "string" && looksLikeToken(value)) return value;
    if (value && typeof value === "object") {
      const found = findTokenInObject(value);
      if (found) return found;
    }
  }
  return null;
}

function getTokenFromResponse(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const o = res as Record<string, unknown>;
  const paths = [
    o.token,
    o.accessToken,
    o.access_token,
    (o.data as Record<string, unknown>)?.token,
    (o.data as Record<string, unknown>)?.accessToken,
    (o.data as Record<string, unknown>)?.access_token,
  ];
  for (const v of paths) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  for (const [key, value] of Object.entries(o)) {
    if (/token/i.test(key) && typeof value === "string" && value.length > 0) return value;
  }
  const data = o.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (/token/i.test(key) && typeof value === "string" && value.length > 0) return value;
    }
  }
  return findTokenInObject(res);
}

function isSuccessResponse(res: unknown): boolean {
  if (!res || typeof res !== "object") return false;
  const o = res as Record<string, unknown>;
  if (o.success === true) return true;
  const msg = typeof o.message === "string" ? o.message.toLowerCase() : "";
  return msg.includes("success") || msg.includes("logged in");
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      const token = getTokenFromResponse(res);
      if (token) {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            const user = (res as { user?: unknown }).user;
            if (user) localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (_) {}
        window.location.replace("/admin");
        return;
      }
      if (isSuccessResponse(res)) {
        window.location.replace("/admin");
        return;
      }
      setError((res as { message?: string }).message || "Login failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <div className="w-full max-w-[400px] bg-card border border-border rounded-[10px] p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Sign in</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter your credentials to access the admin panel.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="px-3.5 py-2.5 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted-foreground">
            Email
            <input
              type="email"
              className="px-3.5 py-2.5 bg-secondary border border-border rounded-md text-foreground text-[0.95rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted-foreground">
            Password
            <input
              type="password"
              className="px-3.5 py-2.5 bg-secondary border border-border rounded-md text-foreground text-[0.95rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center py-2.5 px-5 text-[0.95rem] font-medium rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/register" className="font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
