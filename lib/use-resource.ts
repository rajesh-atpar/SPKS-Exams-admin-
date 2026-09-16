"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { apiDelete, apiGet, apiPatch, apiPost, listFrom, toastApiError } from "@/lib/api-client";
import type { ApiMeta } from "@/lib/types";

export function useResourceList<T extends { id: string }>(
  path: string,
  query: Record<string, string | number | boolean | undefined>,
  enabled = true
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await apiGet<T[]>(path, query);
      const parsed = listFrom<T>(res);
      setItems(parsed.items);
      setMeta(parsed.meta);
    } catch (error) {
      toastApiError(error);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(query), enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, meta, loading, reload, setItems };
}

export async function createResource<T>(path: string, body: unknown) {
  const res = await apiPost<T>(path, body);
  toast.success(res.message || "Created");
  return res.data;
}

export async function updateResource<T>(path: string, body: unknown) {
  const res = await apiPatch<T>(path, body);
  toast.success(res.message || "Updated");
  return res.data;
}

export async function deleteResource(path: string) {
  const res = await apiDelete(path);
  toast.success(res.message || "Deleted");
  return res.data;
}

export async function loadForEdit<T>(path: string, fallback?: T) {
  try {
    const res = await apiGet<T>(path);
    return res.data ?? fallback ?? null;
  } catch (error) {
    if (fallback) return fallback;
    toastApiError(error);
    return null;
  }
}
