"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  storeAuthSession,
} from "@/lib/auth-session";
import type { AuthPayload, StaffUser } from "@/lib/types";

type AuthContextValue = {
  user: StaffUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = getStoredUser();
    const token = getAccessToken();
    if (!stored || !token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(stored);
    apiGet<StaffUser>("/api/admin/auth/me")
      .then((res) => {
        setUser(res.data);
        storeAuthSession({ user: res.data });
      })
      .catch(() => {
        setUser(getStoredUser());
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<AuthPayload>("/api/admin/auth/login", {
      email,
      password,
    });
    storeAuthSession(res.data);
    setUser(res.data.user);
    router.replace("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/admin/auth/logout", {
        refreshToken: getRefreshToken(),
      });
    } catch {
      // Still clear local session.
    }
    clearAuthSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  useEffect(() => {
    if (loading) return;
    const publicPaths = ["/login", "/privacy-policy", "/delete-account", "/privacy-policy.html", "/delete-account.html"];
    const isPublic = publicPaths.some((path) => pathname === path);
    if (!user && !isPublic) {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [loading, user, pathname, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
