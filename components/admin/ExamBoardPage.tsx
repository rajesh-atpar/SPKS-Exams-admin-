import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import { type BoardKey, examBoards } from "@/lib/admin-navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const metricIcons = [ClipboardCheck, CalendarClock, MapPinned, ShieldCheck];

const boardThemes = {
  tnpsc: {
    hero: "bg-[linear-gradient(135deg,#78350f,#b45309_46%,#f59e0b)]",
    surface: "border-amber-200/80 bg-amber-50/80",
    icon: "bg-amber-100 text-amber-700",
    badge: "border-amber-200 text-amber-700",
    bar: "bg-amber-600",
  },
  rrb: {
    hero: "bg-[linear-gradient(135deg,#082f49,#0369a1_52%,#38bdf8)]",
    surface: "border-sky-200/80 bg-sky-50/80",
    icon: "bg-sky-100 text-sky-700",
    badge: "border-sky-200 text-sky-700",
    bar: "bg-sky-600",
  },
} as const;

function getStatusVariant(status: string) {
  if (status === "Ready") {
    return "default" as const;
  }

  if (status === "Review") {
    return "outline" as const;
  }

  return "secondary" as const;
}

export function ExamBoardPage({ boardKey }: { boardKey: BoardKey }) {
  const board = examBoards[boardKey];
  const theme = boardThemes[board.key];
  const activeCount = board.schedules.filter(
    (schedule) => schedule.status === "Ready" || schedule.status === "Review"
  ).length;
  const readinessPercent = Math.round(
    (activeCount / Math.max(board.schedules.length, 1)) * 100
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card
          className={cn(
            "overflow-hidden rounded-[32px] border-0 py-0 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]",
            theme.hero
          )}
        >
          <CardContent className="p-6 sm:p-8">
            <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">
              {board.badge}
            </Badge>

            <div className="mt-5 max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {board.title} workspace
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
                {board.summary}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {board.metrics.slice(0, 3).map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link href="/admin">
                  <ArrowLeft className="size-4" />
                  Back to overview
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowUpRight className="size-4" />
                Export {board.title} status
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-[28px] border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Focus for the next 48 hours</CardTitle>
              <CardDescription>
                The highest-impact work for the {board.title} team today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("rounded-[24px] border p-4", theme.surface)}>
                <p className="text-sm text-slate-600">Primary note</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {board.focusNote}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[22px] border border-border/70 p-4">
                  <p className="text-sm text-muted-foreground">Readiness</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {readinessPercent}%
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-2 rounded-full", theme.bar)}
                      style={{ width: `${readinessPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[22px] border border-border/70 p-4">
                  <p className="text-sm text-muted-foreground">Escalation</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">
                    {board.alertTitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="rounded-[28px] border-primary/15 bg-primary/5 shadow-sm">
            <ShieldCheck className="size-4" />
            <AlertTitle>{board.alertTitle}</AlertTitle>
            <AlertDescription>{board.alertDescription}</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {board.metrics.map((metric, index) => {
          const Icon = metricIcons[index % metricIcons.length];

          return (
            <Card key={metric.label} className="rounded-[26px] border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardDescription>{metric.label}</CardDescription>
                    <CardTitle className="mt-2 text-3xl tracking-tight">
                      {metric.value}
                    </CardTitle>
                  </div>
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl",
                      theme.icon
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card className="rounded-[32px] border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{board.title} schedule tracker</CardTitle>
                <CardDescription>
                  Keep phases, center allocations, and readiness visible for the
                  operations team.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit rounded-full">
                {board.schedules.length} live schedule items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Centers</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {board.schedules.map((schedule) => (
                  <TableRow key={`${schedule.exam}-${schedule.phase}`}>
                    <TableCell className="font-medium">{schedule.exam}</TableCell>
                    <TableCell>{schedule.phase}</TableCell>
                    <TableCell>{schedule.date}</TableCell>
                    <TableCell>{schedule.centers}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={getStatusVariant(schedule.status)}
                        className="rounded-full"
                      >
                        {schedule.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Priority checklist</CardTitle>
              <CardDescription>
                Finish these items to keep the {board.title} timeline on track.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {board.checklist.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-border/70 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl",
                        theme.icon
                      )}
                    >
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

          <Card className={cn("rounded-[28px] shadow-sm", theme.surface)}>
            <CardContent className="p-5">
              <Badge
                variant="outline"
                className={cn("rounded-full bg-white/80", theme.badge)}
              >
                Operational pulse
              </Badge>
              <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                {activeCount} of {board.schedules.length} phases are already ready
                or in final review.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use this panel as the quick read before you switch into detailed
                schedule work.
              </p>

              <Separator className="my-5 bg-slate-200/80" />

              <div className="space-y-3 text-sm text-slate-600">
                <p>{board.snapshotValue}</p>
                <p>{board.snapshotLabel}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
