"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LockKeyhole, UserPlus } from "lucide-react";

import { register as registerUser } from "@/lib/auth-api";
import { storeAuthSession } from "@/lib/auth-session";
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
      const success =
        Boolean(res.token || res.user) ||
        res.message?.toLowerCase().includes("success") === true;

      if (success) {
        storeAuthSession({
          token: res.token ?? "session-authenticated",
          user: res.user,
        });
        router.push("/admin");
        router.refresh();
        return;
      }

      setError(res.message || "Registration failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="register">
      <Card className="border-border/60 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-3xl tracking-tight">
            Create admin account
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            Add a coordinator or administrator who can access the redesigned
            SPKS control center right away.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Registration failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Alert className="border-primary/15 bg-primary/5">
            <LockKeyhole className="size-4" />
            <AlertTitle>Quick setup</AlertTitle>
            <AlertDescription>
              New admin accounts work immediately in mock mode and can be used
              to enter the dashboard without additional steps.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter administrator name"
                  required
                  autoComplete="name"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <FieldDescription>
                  Use at least 6 characters so the account is ready for future
                  backend validation rules too.
                </FieldDescription>
              </Field>

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="size-4" />
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t pt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="ml-1 font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign in instead
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
