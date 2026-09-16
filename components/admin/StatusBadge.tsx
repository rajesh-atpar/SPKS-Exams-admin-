"use client";

import { Badge } from "@/components/ui/badge";

const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  published: "default",
  paid: "default",
  resolved: "default",
  closed: "secondary",
  inactive: "secondary",
  pending: "outline",
  created: "outline",
  open: "outline",
  "in-progress": "secondary",
  failed: "destructive",
  blocked: "destructive",
  deleted: "destructive",
  cancelled: "destructive",
  expired: "secondary",
  refunded: "outline",
};

export function StatusBadge({ value }: { value?: string | boolean | null }) {
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }
  const key = String(value || "unknown").toLowerCase();
  return (
    <Badge variant={variants[key] || "outline"} className="capitalize">
      {String(value || "—").replaceAll("-", " ")}
    </Badge>
  );
}
