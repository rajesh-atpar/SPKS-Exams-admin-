"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { apiGet, toastApiError } from "@/lib/api-client";
import {
  formatDate,
  formatDateTime,
  formatInr,
  planIntervalLabel,
  planSummary,
  userDisplayName,
  type StudentUser,
  type UserBilling,
} from "@/lib/billing";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserBillingPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId || "";
  const router = useRouter();
  const [user, setUser] = useState<StudentUser | null>(null);
  const [billing, setBilling] = useState<UserBilling | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [userRes, billingRes] = await Promise.all([
          apiGet<StudentUser>(`/api/admin/users/${userId}`),
          apiGet<UserBilling>(`/api/admin/users/${userId}/billing`),
        ]);
        if (cancelled) return;
        setUser(userRes.data);
        setBilling(billingRes.data);
      } catch (error) {
        toastApiError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = billing?.user || user;
  const subscription = billing?.subscription || user?.subscription || null;
  const payments = billing?.payments || [];
  const subscriptions = billing?.subscriptions || [];
  const hasAccess = billing?.hasActiveSubscription ?? user?.hasActiveSubscription ?? false;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={loading ? "Student billing" : userDisplayName(profile)}
        description="Current plan, days left, and Razorpay payment history. Admin views only — students pay in the app."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/users")}>
              <ArrowLeft className="size-4" />
              Users
            </Button>
            <Button variant="outline" onClick={() => router.push(`/users/${userId}/results`)}>
              <ClipboardList className="size-4" />
              Test history
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Student</CardTitle>
            <CardDescription>Profile from GET /api/admin/users/:userId</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <Row label="Name" value={userDisplayName(profile)} />
                <Row label="Email" value={profile?.email || "—"} />
                <Row label="Phone" value={profile?.phone || "—"} />
                <Row
                  label="Access"
                  value={
                    <StatusBadge value={hasAccess ? "active" : "expired"} />
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>From GET /api/admin/users/:userId/billing</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : subscription ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{planSummary(subscription)}</p>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <Row label="Plan" value={subscription.plan?.name || planIntervalLabel(subscription.plan)} />
                  <Row label="Price" value={formatInr(subscription.plan?.price)} />
                  <Row label="Status" value={<StatusBadge value={subscription.status} />} />
                  <Row label="Starts" value={formatDate(subscription.startsAt)} />
                  <Row label="Ends" value={formatDate(subscription.endsAt)} />
                  <Row
                    label="Days left"
                    value={
                      subscription.status === "active"
                        ? String(subscription.daysRemaining ?? 0)
                        : "—"
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active plan. Student must buy again in the app.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>All Razorpay attempts for this student</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/payments?userId=${userId}`}>Open in Payments</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatInr(payment.amount)}</TableCell>
                      <TableCell>{payment.plan?.name || planIntervalLabel(payment.plan)}</TableCell>
                      <TableCell>
                        <StatusBadge value={payment.status} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.providerOrderId || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.providerPaymentId || "—"}
                      </TableCell>
                      <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>History of access windows</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/subscriptions?userId=${userId}`}>Open in Subscriptions</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Starts</TableHead>
                    <TableHead>Ends</TableHead>
                    <TableHead>Days left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.plan?.name || planIntervalLabel(sub.plan)}</TableCell>
                      <TableCell>
                        <StatusBadge value={sub.status} />
                      </TableCell>
                      <TableCell>{formatDate(sub.startsAt)}</TableCell>
                      <TableCell>{formatDate(sub.endsAt)}</TableCell>
                      <TableCell>
                        {sub.status === "active" ? String(sub.daysRemaining ?? 0) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
