"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  formatDateTime,
  formatInr,
  planIntervalLabel,
  userDisplayName,
  type BillingPayment,
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

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsPageInner />
    </Suspense>
  );
}

function PaymentsPageInner() {
  const params = useSearchParams();
  const userFromUrl = params?.get("userId") || "";
  const statusFromUrl = params?.get("status") || "all";
  const list = useListQuery();
  const [status, setStatus] = useState(statusFromUrl);
  useEffect(() => {
    setStatus(statusFromUrl === "paid" || statusFromUrl === "created" || statusFromUrl === "failed" || statusFromUrl === "refunded" ? statusFromUrl : "all");
  }, [statusFromUrl]);
  const query = useMemo(
    () => ({
      ...list.query,
      status: status === "all" ? undefined : status,
      userId: userFromUrl || undefined,
    }),
    [list.query, status, userFromUrl]
  );
  const { items, meta, loading } = useResourceList<BillingPayment>("/api/admin/payments", query);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Payments"
        description="Every Razorpay attempt. Paid means that student can open courses until their plan ends. Admin never opens Checkout."
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
                <p className="text-xs text-muted-foreground">{row.user?.phone || "—"}</p>
              </div>
            ),
          },
          {
            key: "plan",
            header: "Plan",
            render: (row) => (
              <div className="space-y-0.5">
                <p>{row.plan?.name || planIntervalLabel(row.plan)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatInr(row.plan?.price)} · {row.plan?.duration ?? "—"} days
                </p>
              </div>
            ),
          },
          {
            key: "amount",
            header: "Amount",
            render: (row) => formatInr(row.amount),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            key: "providerOrderId",
            header: "Order ID",
            render: (row) => (
              <span className="font-mono text-xs">{row.providerOrderId || "—"}</span>
            ),
          },
          {
            key: "providerPaymentId",
            header: "Payment ID",
            render: (row) => (
              <span className="font-mono text-xs">{row.providerPaymentId || "—"}</span>
            ),
          },
          {
            key: "createdAt",
            header: "Date",
            render: (row) => formatDateTime(row.createdAt),
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
              <SelectItem value="created">created</SelectItem>
              <SelectItem value="paid">paid</SelectItem>
              <SelectItem value="failed">failed</SelectItem>
              <SelectItem value="refunded">refunded</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle={userFromUrl ? "No payments for this student" : "No payments yet"}
        emptyDescription="When a student pays ₹1 Monthly, a paid row appears here with Razorpay ids."
      />
    </div>
  );
}
