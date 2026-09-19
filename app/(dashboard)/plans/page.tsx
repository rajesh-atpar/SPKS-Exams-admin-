"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { toastApiError } from "@/lib/api-client";
import {
  formatDate,
  formatInr,
  planAmount,
  planIntervalLabel,
  toDateInputValue,
  type BillingPlan,
} from "@/lib/billing";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import {
  createResource,
  deleteResource,
  loadForEdit,
  updateResource,
  useResourceList,
} from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  emptyToUndefined,
  EntityFormSheet,
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

function buildPlanBody(values: Record<string, unknown>, { clearEmptyDates }: { clearEmptyDates: boolean }) {
  const body = emptyToUndefined(values);

  const amount = body.amount ?? body.price;
  if (amount !== undefined && amount !== null && amount !== "") {
    body.amount = Number(amount);
  }
  delete body.price;

  for (const key of ["startDate", "endDate"] as const) {
    const value = body[key];
    if (value === undefined || value === "") {
      body[key] = clearEmptyDates ? null : undefined;
    }
  }

  if (body.startDate && body.endDate) {
    delete body.duration;
  }

  delete body.features;
  delete body.courseAccess;
  delete body.currency;

  return body;
}

function defaultCreateValues() {
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    name: "Monthly",
    amount: 1,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    isActive: true,
    duration: "",
  };
}

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
    { name: "name", label: "Name", required: true, placeholder: "Monthly" },
    {
      name: "amount",
      label: "Amount (INR)",
      type: "number",
      required: true,
      hint: "Sent as amount on POST/PATCH /api/admin/plans (price alias also accepted by API).",
    },
    {
      name: "startDate",
      label: "Start date",
      type: "date",
      hint: editing
        ? "Clear and save to send null and remove the fixed start date."
        : "Included in create body as startDate.",
    },
    {
      name: "endDate",
      label: "End date",
      type: "date",
      hint: editing
        ? "Clear and save to send null and remove the fixed end date."
        : "With startDate, the API calculates duration automatically.",
    },
    {
      name: "duration",
      label: "Duration (days)",
      type: "number",
      hint: "Optional fallback when dates are not set. Omitted when both dates are sent.",
    },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Plans"
        description="Admin list/create/edit/delete use /api/admin/plans only. Table reads amount (or price), startDate, and endDate from the response."
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
            key: "amount",
            header: "Amount",
            render: (row) => formatInr(planAmount(row)),
          },
          {
            key: "startDate",
            header: "Start date",
            render: (row) => formatDate(row.startDate || row.startsAt),
          },
          {
            key: "endDate",
            header: "End date",
            render: (row) => formatDate(row.endDate || row.endsAt),
          },
          {
            key: "interval",
            header: "Interval",
            render: (row) => planIntervalLabel(row),
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
        description={
          editing
            ? "PATCH /api/admin/plans/:planId — body uses amount, startDate, endDate, isActive."
            : 'POST /api/admin/plans — e.g. { name: "Monthly", amount: 1, startDate, endDate, isActive: true }'
        }
        fields={fields}
        initialValues={
          editing
            ? {
                name: editing.name,
                amount: planAmount(editing),
                startDate: toDateInputValue(editing.startDate || editing.startsAt),
                endDate: toDateInputValue(editing.endDate || editing.endsAt),
                duration: editing.duration ?? "",
                isActive: editing.isActive ?? true,
              }
            : defaultCreateValues()
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = buildPlanBody(values, { clearEmptyDates: Boolean(editing) });
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
        title="Delete plan?"
        description="If students already bought this plan, delete is blocked by the API. Edit the plan and set Active off instead."
        confirmLabel="Delete"
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
