"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  formatDate,
  planIntervalLabel,
  userDisplayName,
  type BillingSubscription,
} from "@/lib/billing";
import { useResourceList } from "@/lib/use-resource";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsPageInner />
    </Suspense>
  );
}

function SubscriptionsPageInner() {
  const params = useSearchParams();
  const userFromUrl = params?.get("userId") || "";
  const list = useListQuery();
  const [status, setStatus] = useState("all");
  const query = useMemo(
    () => ({
      ...list.query,
      status: status === "all" ? undefined : status,
      userId: userFromUrl || undefined,
    }),
    [list.query, status, userFromUrl]
  );
  const { items, meta, loading } = useResourceList<BillingSubscription>(
    "/api/admin/subscriptions",
    query
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Subscriptions"
        description="Who currently has access, and when it expires. Filter active to see students who can open courses."
      />
      <ResourceTable
        columns={[
          {
            key: "student",
            header: "Student",
            render: (row) => (
              <div className="space-y-0.5">
                {row.userId ? (
                  <Link
                    href={`/users/${row.userId}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {userDisplayName(row.user)}
                  </Link>
                ) : (
                  <span>{userDisplayName(row.user)}</span>
                )}
                <p className="text-xs text-muted-foreground">{row.user?.email || "—"}</p>
              </div>
            ),
          },
          {
            key: "plan",
            header: "Plan",
            render: (row) => (
              <div className="space-y-0.5">
                <p>{row.plan?.name || planIntervalLabel(row.plan)}</p>
                <p className="text-xs text-muted-foreground">{planIntervalLabel(row.plan)}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "startsAt",
            header: "Starts",
            render: (row) => formatDate(row.startsAt),
          },
          {
            key: "endsAt",
            header: "Ends",
            render: (row) => formatDate(row.endsAt),
          },
          {
            key: "daysRemaining",
            header: "Days left",
            render: (row) =>
              row.status === "active" ? String(row.daysRemaining ?? 0) : "—",
          },
        ]}
        rows={items}
        loading={loading}
        search={list.search}
        onSearchChange={list.setSearch}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={list.setPage}
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="cancelled">cancelled</SelectItem>
              <SelectItem value="expired">expired</SelectItem>
              <SelectItem value="pending">pending</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle={userFromUrl ? "No subscriptions for this student" : "No subscriptions yet"}
        emptyDescription="After a paid ₹1 Monthly purchase, an active subscription appears with endsAt = today + 30 days."
      />
    </div>
  );
}
