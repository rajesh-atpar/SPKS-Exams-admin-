"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, KeyRound, LogIn, WandSparkles } from "lucide-react";

import { login } from "@/lib/auth-api";
import { storeAuthSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      const user = (res as { user?: unknown }).user;
      const token = getTokenFromResponse(res);
      if (token) {
        storeAuthSession({ token, user });
        router.push("/admin");
        return;
      }
      if (isSuccessResponse(res)) {
        storeAuthSession({ token: "session-authenticated", user });
        router.push("/admin");
        return;
      }
      setError((res as { message?: string }).message || "Login failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  function handleUseDemoAccount() {
    setEmail("admin@example.com");
    setPassword("admin123");
    setError("");
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <AuthShell mode="login">
        <Card className="border-border/60 bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-3xl tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-sm leading-6">
              Sign in to manage exams, coordinators, schedules, and the rest of
              the SPKS admin workflow from one place.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error ? (
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertTitle>Unable to sign in</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Alert className="border-primary/15 bg-primary/5">
              <KeyRound className="size-4" />
              <AlertTitle>Demo credentials</AlertTitle>
              <AlertDescription>
                Use <strong>admin@example.com</strong> and{" "}
                <strong>admin123</strong> while mock authentication is enabled.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <FieldDescription>
                    Your session opens the admin dashboard immediately after a
                    successful sign-in.
                  </FieldDescription>
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <LogIn className="size-4" />
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleUseDemoAccount}
                    disabled={loading}
                  >
                    <WandSparkles className="size-4" />
                    Use demo account
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t pt-6 text-sm text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="ml-1 font-medium text-foreground transition-colors hover:text-primary"
            >
              Create admin access
            </Link>
          </CardFooter>
        </Card>
      </AuthShell>
    </div>
  );
}
