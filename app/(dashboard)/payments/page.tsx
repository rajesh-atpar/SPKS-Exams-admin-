"use client";

import { useMemo, useState } from "react";

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

type Payment = {
  id: string;
  userId?: string;
  planId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  provider?: string;
  providerPaymentId?: string;
  createdAt?: string;
};

export default function PaymentsPage() {
  const list = useListQuery();
  const [status, setStatus] = useState("all");
  const query = useMemo(
    () => ({ ...list.query, status: status === "all" ? undefined : status }),
    [list.query, status]
  );
  const { items, meta, loading } = useResourceList<Payment>("/api/admin/payments", query);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Payments" description="Razorpay payment records. Status: created, paid, failed, refunded." />
      <ResourceTable
        columns={[
          { key: "userId", header: "User" },
          {
            key: "amount",
            header: "Amount",
            render: (row) => `${row.currency || "INR"} ${row.amount ?? 0}`,
          },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "provider", header: "Provider" },
          { key: "providerPaymentId", header: "Payment ID" },
          { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
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
      />
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}
