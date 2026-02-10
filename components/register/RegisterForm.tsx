"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register as registerUser } from "@/lib/auth-api";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await registerUser({ email, password, fullName });
      if (res.token || res.user) {
        if (typeof window !== "undefined" && res.token) {
          localStorage.setItem("token", res.token);
          if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
        }
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <div className="w-full max-w-[400px] bg-card border border-border rounded-[10px] p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Create account</h1>
        <p className="text-muted-foreground text-sm mb-6">Register to access the admin panel.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="px-3.5 py-2.5 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted-foreground">
            Full name
            <input
              type="text"
              className="px-3.5 py-2.5 bg-secondary border border-border rounded-md text-foreground text-[0.95rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70 transition"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </label>
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
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center py-2.5 px-5 text-[0.95rem] font-medium rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
