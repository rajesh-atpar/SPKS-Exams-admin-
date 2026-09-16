"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { AdminSidebar, navItems } from "@/components/admin/AdminNav";
import { AdminContentLoader } from "@/components/admin/AdminContentLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const title =
    navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.label || "Dashboard";

  if (loading || !user) {
    return (
      <AdminContentLoader
        title={loading ? "Loading admin workspace" : "Redirecting to login"}
        description="Checking your staff session."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-card transition-[width] duration-200 md:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <AdminSidebar compact={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 h-16 border-b bg-background/95 backdrop-blur">
          <div className="flex h-full items-center gap-3 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((v) => !v))}
              aria-label="Toggle sidebar"
            >
              <Menu className="size-4" />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
