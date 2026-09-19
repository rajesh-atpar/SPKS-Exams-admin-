"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  IndianRupee,
  Users,
  UserCog,
} from "lucide-react";

import { apiGet, toastApiError } from "@/lib/api-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Overview = {
  users?: number;
  staff?: number;
  courses?: number;
  tests?: number;
  paidPayments?: number;
  revenue?: number;
};

type UsersAnalytics = { total?: number; active?: number; blocked?: number };
type CoursesAnalytics = { total?: number; active?: number };
type TestsAnalytics = { total?: number; published?: number; attempts?: number };
type RevenueAnalytics = { totalRevenue?: number; paidCount?: number; failedCount?: number };

function formatInr(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UsersAnalytics | null>(null);
  const [courses, setCourses] = useState<CoursesAnalytics | null>(null);
  const [tests, setTests] = useState<TestsAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [overviewRes, usersRes, coursesRes, testsRes, revenueRes] = await Promise.all([
          apiGet<Overview>("/api/admin/analytics/overview"),
          apiGet<UsersAnalytics>("/api/admin/analytics/users"),
          apiGet<CoursesAnalytics>("/api/admin/analytics/courses"),
          apiGet<TestsAnalytics>("/api/admin/analytics/tests"),
          apiGet<RevenueAnalytics>("/api/admin/analytics/revenue"),
        ]);
        if (cancelled) return;
        setOverview(overviewRes.data);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setTests(testsRes.data);
        setRevenue(revenueRes.data);
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
  }, []);

  const cards = [
    { label: "Total students", value: overview?.users, icon: Users, href: "/users" },
    { label: "Staff", value: overview?.staff, icon: UserCog, href: "/users" },
    { label: "Courses", value: overview?.courses, icon: GraduationCap, href: "/catalog" },
    { label: "Tests", value: overview?.tests, icon: BookOpen, href: "/tests" },
    { label: "Paid payments", value: overview?.paidPayments ?? revenue?.paidCount, icon: CreditCard, href: "/payments?status=paid" },
    { label: "Revenue", value: formatInr(overview?.revenue ?? revenue?.totalRevenue), icon: IndianRupee, href: "/payments" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Dashboard"
        description="Admin does not pay. View students, paid payments, and revenue. Change plan prices on Plans."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/plans">Plans</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/subscriptions">Subscriptions</Link>
            </Button>
            <Button asChild>
              <Link href="/payments">Payments</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-semibold">{card.value ?? 0}</div>
              )}
              <Button asChild variant="link" className="h-auto px-0 pt-2">
                <Link href={card.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Student accounts only</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <Stat label="Total" value={users?.total} loading={loading} />
            <Stat label="Active" value={users?.active} loading={loading} />
            <Stat label="Blocked" value={users?.blocked} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Catalog health</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Total" value={courses?.total} loading={loading} />
            <Stat label="Active" value={courses?.active} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>Published papers and attempts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <Stat label="Total" value={tests?.total} loading={loading} />
            <Stat label="Published" value={tests?.published} loading={loading} />
            <Stat label="Attempts" value={tests?.attempts} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>GET /api/admin/analytics/revenue — Razorpay outcomes</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <Stat label="Total" value={formatInr(revenue?.totalRevenue)} loading={loading} />
            <Stat label="Paid" value={revenue?.paidCount} loading={loading} />
            <Stat label="Failed" value={revenue?.failedCount} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number | string;
  loading?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      {loading ? <Skeleton className="mt-1 h-6 w-16" /> : <p className="text-xl font-semibold">{value ?? 0}</p>}
    </div>
  );
}
