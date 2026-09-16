"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { createResource, deleteResource, loadForEdit, updateResource, useResourceList } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  emptyToUndefined,
  EntityFormSheet,
  splitTags,
  type FormField,
} from "@/components/admin/EntityFormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

type Plan = {
  id: string;
  name: string;
  price?: number;
  currency?: string;
  duration?: number;
  features?: string[];
  courseAccess?: string[];
  isActive?: boolean;
};

export default function PlansPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "plans");
  const list = useListQuery();
  const { items, meta, loading, reload } = useResourceList<Plan>("/api/admin/plans", list.query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<Plan | null>(null);

  const fields: FormField[] = [
    { name: "name", label: "Name", required: true },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "currency", label: "Currency", placeholder: "INR" },
    { name: "duration", label: "Duration (days)", type: "number" },
    { name: "features", label: "Features", type: "tags", hint: "One per line or comma-separated" },
    { name: "courseAccess", label: "Course access", type: "tags", hint: "Course IDs, one per line" },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Plans"
        description="Subscription plans. Create, update, and delete are admin-only."
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create plan
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "name", header: "Name" },
          {
            key: "price",
            header: "Price",
            render: (row) => `${row.currency || "INR"} ${row.price ?? 0}`,
          },
          { key: "duration", header: "Days" },
          { key: "isActive", header: "Active", render: (row) => <StatusBadge value={row.isActive} /> },
        ]}
        rows={items}
        loading={loading}
        search={list.search}
        onSearchChange={list.setSearch}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={list.setPage}
        canWrite={writable}
        onEdit={async (row) => {
          const data = await loadForEdit<Plan>(`/api/admin/plans/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit plan" : "Create plan"}
        fields={fields}
        initialValues={
          editing
            ? {
                ...editing,
                features: (editing.features || []).join("\n"),
                courseAccess: (editing.courseAccess || []).join("\n"),
              }
            : { currency: "INR", isActive: true }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            body.features = splitTags(body.features);
            body.courseAccess = splitTags(body.courseAccess);
            if (editing) await updateResource(`/api/admin/plans/${editing.id}`, body);
            else await createResource("/api/admin/plans", body);
            setOpen(false);
            await reload();
          } catch (error) {
            toastApiError(error);
          } finally {
            setPending(false);
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        pending={pending}
        onOpenChange={(next) => !next && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          setPending(true);
          try {
            await deleteResource(`/api/admin/plans/${deleting.id}`);
            setDeleting(null);
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
