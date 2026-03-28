import { mockLogin, mockRegister } from "./mock-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" || process.env.NODE_ENV === "development";

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

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...rest } = options;
  const requestBody = body ? JSON.stringify(body) : undefined;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    body: requestBody,
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
  if (USE_MOCK_AUTH) {
    return mockRegister(payload);
  }
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCK_AUTH) {
    return mockLogin(payload);
  }
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}
