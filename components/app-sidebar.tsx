"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconLogout,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import {
  clearAuthSession,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
  },
  {
    title: "TNPSC",
    href: "/admin/tnpsc",
    icon: IconFileDescription,
  },
  {
    title: "RRB",
    href: "/admin/rrb",
    icon: IconFileDescription,
  },
  {
    title: "TNUSRB",
    href: "/admin/tnusrb",
    icon: IconFileDescription,
  },
  {
    title: "Current Affairs",
    href: "/admin/current-affairs",
    icon: IconFileDescription,
  },
];

const managementNavigation = [
  {
    title: "Students",
    href: "/admin/students",
    icon: IconUsers,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: IconChartBar,
  },
];

const secondaryNavigation = [
  {
    title: "Search",
    href: "/admin/search",
    icon: IconSearch,
  },
  {
    title: "Help",
    href: "/admin/help",
    icon: IconHelp,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
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

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div
        className={cn(
          "flex h-24 items-center border-b",
          compact ? "justify-center px-3" : "px-6"
        )}
      >
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <IconDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          {!compact ? (
            <div className="flex flex-col">
              <span className="text-base font-semibold">SPKS Exams</span>
              <span className="text-sm text-muted-foreground">Admin Panel</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto", compact ? "space-y-4 px-2 py-4" : "space-y-6 p-4")}>
        <SidebarSection
          title="Exams"
          items={navigation}
          pathname={pathname}
          compact={compact}
          onNavigate={onNavigate}
        />
        <SidebarSection
          title="Management"
          items={managementNavigation}
          pathname={pathname}
          compact={compact}
          onNavigate={onNavigate}
        />
        <SidebarSection
          title="Support"
          items={secondaryNavigation}
          pathname={pathname}
          compact={compact}
          onNavigate={onNavigate}
        />
      </div>

      <div className={cn("space-y-4 border-t", compact ? "p-2" : "p-4")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">{user.initials}</span>
          </div>
          {!compact ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          className={cn("w-full", compact ? "justify-center px-0" : "justify-start")}
          onClick={handleLogout}
          aria-label="Logout"
        >
          <IconLogout className={cn("h-4 w-4", compact ? "" : "mr-2")} />
          <span className={cn(compact ? "sr-only" : "")}>Logout</span>
        </Button>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
  compact,
  onNavigate,
}: {
  title: string;
  items: Array<{
    title: string;
    href: string;
    icon: typeof IconDashboard;
  }>;
  pathname: string;
  compact: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-2">
      <h3
        className={cn(
          "text-xs font-medium uppercase tracking-wider text-muted-foreground",
          compact ? "px-1 text-center" : ""
        )}
      >
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              className={cn("w-full", compact ? "justify-center px-0" : "justify-start")}
              asChild
            >
              <Link href={item.href} onClick={onNavigate} aria-label={item.title}>
                <item.icon className={cn("h-4 w-4", compact ? "" : "mr-2")} />
                <span className={cn(compact ? "sr-only" : "")}>{item.title}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
