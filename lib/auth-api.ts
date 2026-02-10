const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user?: { id: string; email: string; fullName?: string };
  token?: string;
  message?: string;
};

async function request<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    body: body ? JSON.stringify(body) : rest.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      data?.error ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}
