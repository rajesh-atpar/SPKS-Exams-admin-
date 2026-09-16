"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  FolderTree,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Repeat,
  Scale,
  Ticket,
  Users,
  Video,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName, getUserInitials } from "@/lib/auth-session";
import { canSeeNav } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/catalog", label: "Catalog", icon: FolderTree },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/current-affairs", label: "Current Affairs", icon: Newspaper },
  { href: "/tests", label: "Tests", icon: BookOpen },
  { href: "/plans", label: "Plans", icon: Wallet },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/support", label: "Support", icon: Ticket },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/legal", label: "Legal", icon: Scale },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className={cn("flex h-20 items-center border-b", compact ? "justify-center px-3" : "px-5")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          {!compact ? (
            <div>
              <p className="text-sm font-semibold">SPKS Admin</p>
              <p className="text-xs text-muted-foreground">Exam-prep CMS</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", compact ? "px-2" : "px-3")}>
        {navItems.filter((item) => canSeeNav(user?.role, item.href)).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "secondary" : "ghost"}
              className={cn("w-full", compact ? "justify-center px-0" : "justify-start")}
            >
              <Link href={item.href} onClick={onNavigate}>
                <item.icon className={cn("size-4", compact ? "" : "mr-2")} />
                <span className={cn(compact ? "sr-only" : "")}>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className={cn("border-t space-y-3", compact ? "p-2" : "p-4")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {getUserInitials(user)}
          </div>
          {!compact ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{getUserDisplayName(user)}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          ) : null}
        </div>
        {!compact && user?.role ? (
          <Badge variant="outline" className="capitalize">
            {user.role}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className={cn("w-full", compact ? "justify-center px-0" : "justify-start")}
          onClick={() => void logout()}
        >
          <LogOut className={cn("size-4", compact ? "" : "mr-2")} />
          <span className={cn(compact ? "sr-only" : "")}>Sign out</span>
        </Button>
      </div>
    </div>
  );
}
