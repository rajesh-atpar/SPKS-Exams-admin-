"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { toast } from "sonner";

import { apiPost, toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { useResourceList } from "@/lib/use-resource";
import { emptyToUndefined, EntityFormSheet, type FormField } from "@/components/admin/EntityFormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  title: string;
  body?: string;
  type?: string;
  userId?: string;
  sentAt?: string;
  createdAt?: string;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "notifications");
  const list = useListQuery();
  const { items, meta, loading, reload } = useResourceList<Notification>(
    "/api/admin/notifications",
    list.query
  );
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "body", label: "Body", type: "textarea", required: true },
    { name: "type", label: "Type", placeholder: "general" },
    { name: "userId", label: "User ID", hint: "Leave blank to send to all active students" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Notifications"
        description="With a user ID this goes to one student. Without one it pages through every active student — there is no 100-user cap."
        action={
          writable ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Send notification
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          { key: "body", header: "Body" },
          { key: "type", header: "Type" },
          { key: "userId", header: "User", render: (row) => row.userId || "All" },
          {
            key: "createdAt",
            header: "Sent",
            render: (row) =>
              row.sentAt || row.createdAt ? new Date(row.sentAt || row.createdAt || "").toLocaleString() : "—",
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
      />
      <EntityFormSheet
        open={open}
        title="Send notification"
        fields={fields}
        initialValues={{ type: "general" }}
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const res = await apiPost<{ count?: number }>(
              "/api/admin/notifications/send",
              emptyToUndefined(values)
            );
            const count = res.data?.count;
            toast.success(
              count != null ? `Sent to ${count} student${count === 1 ? "" : "s"}` : res.message || "Sent"
            );
            setOpen(false);
            await reload();
          } catch (error) {
            toastApiError(error);
          } finally {
            setPending(false);
          }
        }}
      />
    </div>
  );
}
