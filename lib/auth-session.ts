export type StoredUser = {
  id?: string;
  email: string;
  fullName?: string;
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as StoredUser;
  return typeof candidate.email === "string";
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);
    return isStoredUser(parsedUser) ? parsedUser : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(session: {
  token?: string | null;
  user?: unknown;
}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (session.token) {
      localStorage.setItem(TOKEN_KEY, session.token);
    }

    if (isStoredUser(session.user)) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    }
  } catch {}
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getUserDisplayName(user: StoredUser | null): string {
  if (!user) {
    return "Admin";
  }

  const trimmedName = user.fullName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const emailName = user.email.split("@")[0]?.trim();
  return emailName || "Admin";
}

export function getUserInitials(user: StoredUser | null): string {
  if (!user) {
    return "AD";
  }

  const trimmedName = user.fullName?.trim();
  if (trimmedName) {
    return trimmedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return user.email.slice(0, 2).toUpperCase();
}
