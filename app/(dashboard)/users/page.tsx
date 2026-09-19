"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, CreditCard } from "lucide-react";

import { apiPatch, toastApiError } from "@/lib/api-client";
import { planSummary, type StudentUser } from "@/lib/billing";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import type { UserStatus } from "@/lib/types";
import { createResource, deleteResource, loadForEdit, updateResource, useResourceList } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { emptyToUndefined, EntityFormSheet, type FormField } from "@/components/admin/EntityFormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statuses: UserStatus[] = ["active", "inactive", "blocked"];

export default function UsersPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "users");
  const canStatus = canWrite(user?.role, "users.status");
  const router = useRouter();
  const list = useListQuery();
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const query = useMemo(
    () => ({
      ...list.query,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
    }),
    [list.query, role, status]
  );
  const { items, meta, loading, reload } = useResourceList<StudentUser>("/api/admin/users", query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentUser | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<StudentUser | null>(null);

  const fields: FormField[] = [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "email", label: "Email", type: "email", required: !editing },
    { name: "password", label: "Password", type: "password", required: !editing, hint: "Min 6, 1 upper, 1 lower, 1 number" },
    { name: "phone", label: "Phone" },
    { name: "state", label: "State" },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { label: "Student", value: "user" },
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Support", value: "support" },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Users"
        description="Students show hasActiveSubscription from billing. Open a student for plan, days left, and payment history. Admin never pays."
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create user
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim() || "—",
          },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone", render: (row) => row.phone || "—" },
          {
            key: "role",
            header: "Role",
            render: (row) => <span className="capitalize">{row.role}</span>,
          },
          {
            key: "subscription",
            header: "Plan",
            render: (row) =>
              row.role === "user" ? (
                <div className="max-w-56 space-y-1">
                  <StatusBadge value={Boolean(row.hasActiveSubscription)} />
                  <p className="text-xs text-muted-foreground">{planSummary(row.subscription)}</p>
                </div>
              ) : (
                "—"
              ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) =>
              canStatus ? (
                <Select
                  value={row.status || "active"}
                  onValueChange={async (value) => {
                    try {
                      await apiPatch(`/api/admin/users/${row.id}/status`, { status: value });
                      toast.success("Status updated");
                      await reload();
                    } catch (error) {
                      toastApiError(error);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge value={row.status} />
              ),
          },
          { key: "state", header: "State" },
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
          const data = await loadForEdit<StudentUser>(`/api/admin/users/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={canStatus ? setDeleting : undefined}
        onRowClick={(row) => {
          if (row.role === "user") router.push(`/users/${row.id}`);
        }}
        extraActions={(row) => (
          <>
            {row.role === "user" ? (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Billing"
                onClick={() => router.push(`/users/${row.id}`)}
              >
                <CreditCard className="size-4" />
              </Button>
            ) : null}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Test history"
              onClick={() => router.push(`/users/${row.id}/results`)}
            >
              <ClipboardList className="size-4" />
            </Button>
          </>
        )}
        filters={
          <>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="user">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit user" : "Create user"}
        fields={editing ? fields.filter((field) => field.name !== "password" && field.name !== "email") : fields}
        initialValues={
          editing
            ? {
                firstName: editing.firstName || "",
                lastName: editing.lastName || "",
                phone: editing.phone || "",
                state: editing.state || "",
                role: editing.role,
              }
            : { role: "user" }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            if (editing) {
              await updateResource(`/api/admin/users/${editing.id}`, body);
            } else {
              await createResource("/api/admin/users", body);
            }
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
        title="Permanently delete user"
        description="This removes the user completely. They will be gone, not just marked deleted. Use Block or Inactive to keep the row."
        confirmLabel="Delete forever"
        onOpenChange={(next) => !next && setDeleting(null)}
        pending={pending}
        onConfirm={async () => {
          if (!deleting) return;
          setPending(true);
          try {
            await deleteResource(`/api/admin/users/${deleting.id}`);
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
