import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  storeAuthSession,
} from "@/lib/auth-session";
import type { ApiEnvelope, ApiMeta, AuthPayload, PaginationQuery } from "@/lib/types";

const DEFAULT_API_URL = "https://spks-exams-backend.vercel.app";

function resolveApiBase() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();
  return (
    raw
      .replace(/\/+$/, "")
      .replace(/\/api-docs$/i, "")
      .replace(/\/api$/i, "") || DEFAULT_API_URL
  );
}

export const API_BASE = resolveApiBase();

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    status = 500,
    code?: string,
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

let refreshPromise: Promise<string | null> | null = null;

function isAuthRoute(url?: string) {
  return Boolean(
    url &&
      (url.includes("/api/admin/auth/login") ||
        url.includes("/api/admin/auth/refresh-token"))
  );
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const { data } = await axios.post<ApiEnvelope<AuthPayload>>(
    `${API_BASE}/api/admin/auth/refresh-token`,
    { refreshToken }
  );
  const payload = data.data;
  if (!payload?.accessToken) return null;
  storeAuthSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  });
  return payload.accessToken;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !isAuthRoute(original.url)) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const token = await refreshPromise;
        if (token) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        // Fall through to logout.
      }
      clearAuthSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    const payload = error.response?.data;
    const message =
      payload?.message ||
      error.message ||
      `Request failed (${status || "network"})`;
    throw new ApiError(message, status || 0, payload?.code, payload?.errors);
  }
);

export function toastApiError(error: unknown) {
  if (error instanceof ApiError) {
    toast.error(error.message);
    return;
  }
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  toast.error("Something went wrong");
}

export async function apiGet<T>(url: string, params?: PaginationQuery) {
  const { data } = await api.get<ApiEnvelope<T>>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<ApiEnvelope<T>>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch<ApiEnvelope<T>>(url, body);
  return data;
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete<ApiEnvelope<T>>(url);
  return data;
}

export async function apiUpload<T>(url: string, file: File, fieldName = "file") {
  const form = new FormData();
  form.append(fieldName, file);
  const { data } = await api.post<ApiEnvelope<T>>(url, form, { timeout: 120000 });
  return data;
}

export function listFrom<T>(envelope: ApiEnvelope<T[] | { items?: T[] }>): {
  items: T[];
  meta: ApiMeta;
} {
  const raw = envelope.data;
  const items = Array.isArray(raw) ? raw : raw?.items || [];
  return {
    items,
    meta: envelope.meta || {
      page: 1,
      limit: items.length || 20,
      total: items.length,
      totalPages: 1,
    },
  };
}

export function uploadedUrl(data: unknown): string {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  const rec = data as Record<string, unknown>;
  const value = rec.url || rec.fileUrl || rec.questionImage || rec.path;
  return typeof value === "string" ? value : "";
}

export default api;
