import type { ReactNode } from "react";
import {
  Activity,
  BookOpenCheck,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const shellContent = {
  login: {
    eyebrow: "Unified admin workspace",
    title: "Run exams, schedules, and oversight from one polished interface.",
    description:
      "The UI now centers around reusable shadcn components so your auth flow and admin tools feel like one system instead of separate screens.",
    stats: [
      { label: "Exam centers managed", value: "24" },
      { label: "Live sessions tracked", value: "128" },
    ],
    highlights: [
      "Clear dashboard cards for operational metrics and daily priorities.",
      "Consistent forms, tables, badges, and alerts across the whole app.",
      "A calmer admin experience for coordinators, results, and exam teams.",
    ],
  },
  register: {
    eyebrow: "Create admin access",
    title: "Bring new coordinators into the same streamlined control center.",
    description:
      "Every new admin gets a cleaner onboarding flow with the same design language used throughout the dashboard and future management screens.",
    stats: [
      { label: "Teams onboarded", value: "8" },
      { label: "Setup time reduced", value: "35%" },
    ],
    highlights: [
      "Fast account creation with a consistent form layout and clear guidance.",
      "Shared tokens, spacing, and feedback states powered by shadcn/ui.",
      "A foundation that is easier to extend when more admin pages arrive.",
    ],
  },
} as const;

const highlightIcons = [ShieldCheck, BookOpenCheck, Activity];

export function AuthShell({
  mode,
  children,
}: {
  mode: keyof typeof shellContent;
  children: ReactNode;
}) {
  const content = shellContent[mode];

  return (
    <div className="relative min-h-svh overflow-hidden bg-muted/30">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute top-24 right-0 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 size-80 rounded-full bg-accent blur-3xl" />

      <div className="relative mx-auto grid min-h-svh max-w-7xl gap-10 px-4 py-6 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between gap-8">
          <div className="space-y-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">SPKS Exams</p>
                <p className="text-xs text-muted-foreground">
                  Admin control center
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs"
              >
                {content.eyebrow}
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  {content.title}
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {content.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {content.stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="border-border/60 bg-background/75 shadow-sm backdrop-blur"
                >
                  <CardContent className="space-y-2 p-5">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    Why this redesign feels better
                  </p>
                  <Separator className="mt-3" />
                </div>

                <div className="space-y-4">
                  {content.highlights.map((highlight, index) => {
                    const Icon = highlightIcons[index % highlightIcons.length];

                    return (
                      <div key={highlight} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {highlight}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl">{children}</div>
        </section>
      </div>
    </div>
  );
}
