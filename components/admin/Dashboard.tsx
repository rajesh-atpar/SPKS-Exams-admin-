"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  ShieldCheck,
  Users2,
} from "lucide-react";

import { examBoards } from "@/lib/admin-navigation";
import { getStoredUser, getUserDisplayName } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const boardThemes = {
  tnpsc: {
    surface: "border-amber-200/80 bg-amber-50/80",
    icon: "bg-amber-100 text-amber-700",
    badge: "border-amber-200 text-amber-700",
  },
  rrb: {
    surface: "border-sky-200/80 bg-sky-50/80",
    icon: "bg-sky-100 text-sky-700",
    badge: "border-sky-200 text-sky-700",
  },
} as const;

const heroStats = [
  {
    label: "Boards in motion",
    value: "02",
    detail: "Dedicated workspaces are live for TNPSC and RRB.",
  },
  {
    label: "Next publish window",
    value: "Apr 01",
    detail: "RRB coordination closes before TNPSC hall ticket release.",
  },
  {
    label: "Open approvals",
    value: "08",
    detail: "A small morning queue still needs admin sign-off.",
  },
];

const statCards = [
  {
    title: "Live boards",
    value: "02",
    detail: "Both board teams are working from dedicated pages.",
    badge: "Focused",
    icon: BookOpenCheck,
  },
  {
    title: "Active schedules",
    value: "20",
    detail: "Exam phases are moving in parallel across TNPSC and RRB.",
    badge: "Stable",
    icon: Users2,
  },
  {
    title: "Next review",
    value: "Apr 01",
    detail: "Zone coordination and hall ticket checks are next in line.",
    badge: "Soon",
    icon: CalendarClock,
  },
  {
    title: "Escalations",
    value: "08",
    detail: "Pending items are limited and visible from one overview.",
    badge: "Tracked",
    icon: BellRing,
  },
];

const recentExams = [
  {
    name: "TNPSC Group I Preliminary",
    window: "April 2, 2026",
    candidates: "18 centers",
    status: "Ready",
  },
  {
    name: "RRB ALP CBT-2",
    window: "April 1, 2026",
    candidates: "20 centers",
    status: "Review",
  },
  {
    name: "TNPSC Group II Combined Services",
    window: "April 7, 2026",
    candidates: "12 centers",
    status: "Ready",
  },
  {
    name: "RRB NTPC Document Verification",
    window: "April 9, 2026",
    candidates: "7 centers",
    status: "Draft",
  },
];

const activityFeed = [
  {
    title: "TNPSC hall ticket review updated",
    description: "Two district centers were moved into the ready-to-publish lane.",
    time: "8 minutes ago",
  },
  {
    title: "RRB zone coordination adjusted",
    description: "A CBT-2 reporting slot was updated after a local center change.",
    time: "24 minutes ago",
  },
  {
    title: "Overview refreshed",
    description: "The admin shell now separates board workspaces cleanly.",
    time: "1 hour ago",
  },
];

const checklistItems = [
  {
    title: "Review TNPSC publication blockers",
    description: "Close the remaining hall ticket sync issues before release.",
  },
  {
    title: "Confirm RRB zone approvals",
    description: "Three active RRB phases still need final schedule approval.",
  },
  {
    title: "Share the morning summary",
    description: "Export the combined overview for the operations team stand-up.",
  },
];

function getStatusVariant(status: string) {
  if (status === "Ready") {
    return "default" as const;
  }

  if (status === "Review") {
    return "outline" as const;
  }

  return "secondary" as const;
}

export function Dashboard() {
  const [userName, setUserName] = useState("Admin User");

  useEffect(() => {
    setUserName(getUserDisplayName(getStoredUser()));
  }, []);

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card className="overflow-hidden rounded-[32px] border-0 bg-[linear-gradient(135deg,#020617,#0f172a_42%,#1d4ed8)] py-0 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <CardContent className="p-6 sm:p-8">
            <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">
              Overview
            </Badge>

            <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back, {userName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  This is the clean admin view for TNPSC and RRB. Track board
                  readiness, upcoming exam windows, and the next team actions
                  without the clutter from the old layout.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link href="/admin/tnpsc">
                    Open TNPSC
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/admin/rrb">
                    Open RRB
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-[28px] border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Morning priorities</CardTitle>
              <CardDescription>
                The first tasks to close before the next exam updates go live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-border/70 bg-muted/30 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium tracking-tight">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>System signal</CardTitle>
                  <CardDescription>{todayLabel}</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Readiness score
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">87%</p>
                  </div>
                  <Clock3 className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[87%] rounded-full bg-slate-950" />
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[22px] border border-border/70 p-4">
                  <p className="text-sm text-muted-foreground">Launch queue</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">
                    2 sessions awaiting final review
                  </p>
                </div>
                <div className="rounded-[22px] border border-border/70 p-4">
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">
                    Most centers are ready for today&apos;s cycle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="rounded-[26px] border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-tight">
                    {stat.value}
                  </CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline" className="rounded-full">
                {stat.badge}
              </Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                {stat.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {Object.values(examBoards).map((board) => {
          const theme = boardThemes[board.key];

          return (
            <Card
              key={board.key}
              className={cn(
                "overflow-hidden rounded-[32px] py-0 shadow-sm",
                theme.surface
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full bg-white/85", theme.badge)}
                    >
                      {board.badge}
                    </Badge>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                      {board.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      {board.shortDescription}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                      theme.icon
                    )}
                  >
                    <board.icon className="size-5" />
                  </div>
                </div>

                <Separator className="my-6 bg-slate-200/80" />

                <div className="grid gap-3 sm:grid-cols-2">
                  {board.metrics.slice(0, 2).map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[22px] border border-white/70 bg-white/70 p-4"
                    >
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {metric.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <p className="max-w-xl text-sm leading-6 text-slate-600">
                    {board.focusNote}
                  </p>
                  <Button
                    asChild
                    className="rounded-full bg-slate-950 text-white hover:bg-slate-900"
                  >
                    <Link href={board.href}>
                      Open {board.title}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <Tabs defaultValue="exams" className="gap-0">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Operations stream</CardTitle>
                  <CardDescription>
                    Review today&apos;s exam windows and the latest team updates.
                  </CardDescription>
                </div>
                <TabsList className="grid w-full grid-cols-2 rounded-full sm:w-auto">
                  <TabsTrigger value="exams" className="rounded-full">
                    Recent exams
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-full">
                    Team activity
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <TabsContent value="exams" className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Centers</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExams.map((exam) => (
                      <TableRow key={exam.name}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>{exam.window}</TableCell>
                        <TableCell>{exam.candidates}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={getStatusVariant(exam.status)}
                            className="rounded-full"
                          >
                            {exam.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="activity" className="mt-0 space-y-4">
                {activityFeed.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-border/70 bg-muted/25 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium tracking-tight">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full">
                        {item.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Alert className="rounded-[28px] border-primary/15 bg-primary/5 shadow-sm">
            <ShieldCheck className="size-4" />
            <AlertTitle>Mock authentication is enabled</AlertTitle>
            <AlertDescription>
              Use <strong>admin@example.com</strong> and <strong>admin123</strong>{" "}
              while the backend is still disconnected.
            </AlertDescription>
          </Alert>

          <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Jump straight into the next admin workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild className="justify-between rounded-2xl">
                <Link href="/admin/tnpsc">
                  Open TNPSC workspace
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-between rounded-2xl"
              >
                <Link href="/admin/rrb">
                  Open RRB workspace
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-between rounded-2xl"
              >
                <Link href="/register">
                  Add another admin
                  <FileSpreadsheet className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
