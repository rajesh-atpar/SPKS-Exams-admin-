"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminContentLoader } from "@/components/admin/AdminContentLoader";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getStoredToken } from "@/lib/auth-session";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setAuthStatus("unauthenticated");
      router.replace("/login");
      return;
    }

    setAuthStatus("authenticated");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r bg-card">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader />

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
