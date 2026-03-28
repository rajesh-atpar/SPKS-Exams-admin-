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

export function AppSidebar() {
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
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <IconDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">SPKS Exams</span>
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <SidebarSection title="Exams" items={navigation} pathname={pathname} />
        <SidebarSection
          title="Management"
          items={managementNavigation}
          pathname={pathname}
        />
        <SidebarSection
          title="Support"
          items={secondaryNavigation}
          pathname={pathname}
        />
      </div>

      <div className="space-y-4 border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">{user.initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <IconLogout className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: Array<{
    title: string;
    href: string;
    icon: typeof IconDashboard;
  }>;
  pathname: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
