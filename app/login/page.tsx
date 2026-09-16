"use client";

import { useState } from "react";
import { CircleAlert, KeyRound, LogIn, WandSparkles } from "lucide-react";

import { toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

const SEED_EMAIL = "admin@spks.com";
const SEED_PASSWORD = "Admin123";

export default function LoginPage() {
  const { login, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState(SEED_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (authLoading || user) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
      toastApiError(err);
    } finally {
      setPending(false);
    }
  }

  function handleUseSeedAccount() {
    setEmail(SEED_EMAIL);
    setPassword(SEED_PASSWORD);
    setError("");
  }

  return (
    <AuthShell mode="login">
      <Card className="border-border/60 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl tracking-tight">Staff sign in</CardTitle>
          <CardDescription className="text-sm leading-6">
            Use your admin, editor, or support account. Student logins are not accepted here.
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
            <AlertTitle>Seed credentials</AlertTitle>
            <AlertDescription>
              Use <strong>{SEED_EMAIL}</strong> and <strong>{SEED_PASSWORD}</strong>{" "}
              for the default staff login.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={SEED_EMAIL}
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
                <Button type="submit" className="w-full" disabled={pending}>
                  <LogIn className="size-4" />
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleUseSeedAccount}
                  disabled={pending}
                >
                  <WandSparkles className="size-4" />
                  Use seed account
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
