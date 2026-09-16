"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type Ticket = {
  id: string;
  userId?: string;
  subject?: string;
  status?: string;
  createdAt?: string;
};

export default function SupportPage() {
  const router = useRouter();
  const list = useListQuery();
  const [status, setStatus] = useState("all");
  const query = useMemo(
    () => ({ ...list.query, status: status === "all" ? undefined : status }),
    [list.query, status]
  );
  const { items, meta, loading } = useResourceList<Ticket>("/api/admin/support/tickets", query);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Support" description="Open a ticket to view the thread, change status, and reply." />
      <ResourceTable
        columns={[
          { key: "subject", header: "Subject" },
          { key: "userId", header: "User" },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          {
            key: "createdAt",
            header: "Created",
            render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
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
        onRowClick={(row) => router.push(`/support/${row.id}`)}
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">open</SelectItem>
              <SelectItem value="in-progress">in-progress</SelectItem>
              <SelectItem value="resolved">resolved</SelectItem>
              <SelectItem value="closed">closed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
