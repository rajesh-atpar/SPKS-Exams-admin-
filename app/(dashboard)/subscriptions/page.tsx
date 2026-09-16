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

type Subscription = {
  id: string;
  userId?: string;
  planId?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  cancelledAt?: string;
};

export default function SubscriptionsPage() {
  const list = useListQuery();
  const [status, setStatus] = useState("all");
  const query = useMemo(
    () => ({ ...list.query, status: status === "all" ? undefined : status }),
    [list.query, status]
  );
  const { items, meta, loading } = useResourceList<Subscription>(
    "/api/admin/subscriptions",
    query
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Subscriptions"
        description="Student plan subscriptions. Status: active, cancelled, expired, pending."
      />
      <ResourceTable
        columns={[
          { key: "userId", header: "User" },
          { key: "planId", header: "Plan" },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "startsAt", header: "Starts", render: (row) => formatDate(row.startsAt) },
          { key: "endsAt", header: "Ends", render: (row) => formatDate(row.endsAt) },
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
      />
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}
