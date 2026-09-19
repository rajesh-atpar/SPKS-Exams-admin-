"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { toastApiError } from "@/lib/api-client";
import { formatInr, planIntervalLabel, type BillingPlan } from "@/lib/billing";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { createResource, deleteResource, updateResource, useResourceList } from "@/lib/use-resource";
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

type Plan = BillingPlan & {
  id: string;
  name: string;
  features?: string[];
  courseAccess?: string[];
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
    {
      name: "price",
      label: "Price (INR)",
      type: "number",
      required: true,
      hint: "Student app reads prices from GET /api/plans after you save.",
    },
    { name: "currency", label: "Currency", placeholder: "INR" },
    {
      name: "duration",
      label: "Duration (days)",
      type: "number",
      hint: "30 = Monthly, 180 = 6 Months, 365 = Yearly",
    },
    { name: "features", label: "Features", type: "tags", hint: "One per line or comma-separated" },
    { name: "courseAccess", label: "Course access", type: "tags", hint: "Course IDs, one per line" },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Plans"
        description="Price cards for the student app. Change price with PATCH — admin never opens Razorpay Checkout."
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
            key: "interval",
            header: "Interval",
            render: (row) => planIntervalLabel(row),
          },
          {
            key: "price",
            header: "Price",
            render: (row) => formatInr(row.price),
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
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={setDeleting}
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit plan" : "Create plan"}
        description={
          editing
            ? `Update price for ${planIntervalLabel(editing)}. Students see the new price on the next GET /api/plans.`
            : undefined
        }
        fields={fields}
        initialValues={
          editing
            ? {
                ...editing,
                features: (editing.features || []).join("\n"),
                courseAccess: (editing.courseAccess || []).join("\n"),
              }
            : { currency: "INR", isActive: true, price: 1, duration: 30 }
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
