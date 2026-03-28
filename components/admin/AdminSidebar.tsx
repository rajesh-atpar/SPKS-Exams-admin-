"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  clearAuthSession,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/auth-session";
import { examBoards, sidebarNavigation } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    initials: "AU",
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      return;
    }

    setUser({
      name: getUserDisplayName(storedUser),
      email: storedUser.email,
      initials: getUserInitials(storedUser),
    });
  }, []);

  function isActivePath(url: string) {
    if (url === "/admin") {
      return pathname === url;
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  }

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-4 overflow-x-hidden",
        className
      )}
    >
      <Card className="rounded-[28px] border-border/60 bg-card/95 py-0 shadow-sm backdrop-blur">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">SPKS Exams</p>
              <p className="truncate text-xs text-muted-foreground">
                Clean admin workspace
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,#0f172a,#1e293b_55%,#2563eb)] p-4 text-white shadow-xl">
            <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">
              Operations desk
            </Badge>
            <p className="mt-3 text-lg font-semibold tracking-tight">
              TNPSC and RRB
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-200">
              One focused space for exam boards, schedules, and approvals.
            </p>
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="mt-4 rounded-full bg-white/95 text-slate-950 hover:bg-white"
            >
              <Link href="/admin" onClick={onNavigate}>
                Overview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/60 bg-card/95 py-0 shadow-sm backdrop-blur">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Exam boards
          </CardTitle>
          <CardDescription>
            Open the workspace you want to manage right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-4">
          {sidebarNavigation.map((item) => {
            const active = isActivePath(item.href);

            return (
              <Button
                key={item.title}
                asChild
                variant={active ? "default" : "ghost"}
                className={cn(
                  "h-auto w-full justify-start rounded-2xl px-3 py-3 text-left",
                  active
                    ? "bg-slate-950 text-white shadow-md hover:bg-slate-900"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Link href={item.href} onClick={onNavigate}>
                  <div className="flex w-full items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-white/10" : "bg-muted"
                      )}
                    >
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div
                        className={cn(
                          "mt-1 text-xs leading-5",
                          active ? "text-slate-300" : "text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/60 bg-card/95 py-0 shadow-sm backdrop-blur">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Board Pulse
          </CardTitle>
          <CardDescription>
            Quick signal cards for the two active exam boards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {Object.values(examBoards).map((board) => {
            const theme = boardThemes[board.key];

            return (
              <Link
                key={board.key}
                href={board.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-[24px] border p-4 transition-transform duration-150 hover:-translate-y-0.5",
                  theme.surface
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full bg-white/80", theme.badge)}
                    >
                      {board.title}
                    </Badge>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      {board.snapshotValue}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {board.snapshotLabel}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-2xl",
                      theme.icon
                    )}
                  >
                    <board.icon className="size-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="mt-auto h-auto w-full justify-start rounded-[28px] border-border/60 bg-card/95 px-4 py-4 shadow-sm"
          >
            <div className="flex w-full items-center gap-3">
              <Avatar size="lg">
                <AvatarImage alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-2xl">
          <DropdownMenuLabel className="p-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <LayoutDashboard className="size-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/tnpsc")}>
            <Sparkles className="size-4" />
            TNPSC workspace
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
