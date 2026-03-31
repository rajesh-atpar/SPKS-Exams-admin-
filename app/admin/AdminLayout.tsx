"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminContentLoader } from "@/components/admin/AdminContentLoader";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStoredToken } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setAuthStatus("unauthenticated");
      router.replace("/login");
      return;
    }

    setAuthStatus("authenticated");
  }, [router]);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile]);

  function handleToggleSidebar() {
    if (isMobile) {
      setIsMobileSidebarOpen((open) => !open);
      return;
    }

    setIsSidebarCollapsed((collapsed) => !collapsed);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-card transition-[width] duration-200 md:block",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <AppSidebar compact={isSidebarCollapsed} />
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <AppSidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader onToggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-muted/20">
          {authStatus === "authenticated" ? (
            children
          ) : (
            <AdminContentLoader
              title={
                authStatus === "unauthenticated"
                  ? "Redirecting to login"
                  : "Loading admin workspace"
              }
              description={
                authStatus === "unauthenticated"
                  ? "Your sidebar stays mounted while we move you back to the sign-in page."
                  : "Preparing the current section without replacing the full application shell."
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
