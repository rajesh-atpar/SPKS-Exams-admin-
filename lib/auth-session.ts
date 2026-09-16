import type { StaffUser } from "@/lib/types";

const ACCESS_KEY = "spks_access_token";
const REFRESH_KEY = "spks_refresh_token";
const USER_KEY = "spks_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  return getAccessToken();
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): StaffUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffUser;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(session: {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: StaffUser | null;
}) {
  if (!canUseStorage()) return;
  try {
    if (session.accessToken) localStorage.setItem(ACCESS_KEY, session.accessToken);
    if (session.refreshToken) localStorage.setItem(REFRESH_KEY, session.refreshToken);
    if (session.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // Ignore storage failures.
  }
}

export function getUserDisplayName(user: StaffUser | null): string {
  if (!user) return "Staff";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  return user.email.split("@")[0] || "Staff";
}

export function getUserInitials(user: StaffUser | null): string {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
