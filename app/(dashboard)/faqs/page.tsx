"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { createResource, deleteResource, loadForEdit, updateResource, useResourceList } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { emptyToUndefined, EntityFormSheet, type FormField } from "@/components/admin/EntityFormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
  isPublished?: boolean;
};

export default function FaqsPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "faqs");
  const list = useListQuery();
  const { items, meta, loading, reload } = useResourceList<Faq>("/api/admin/faqs", list.query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<Faq | null>(null);

  const fields: FormField[] = [
    { name: "question", label: "Question", required: true },
    { name: "answer", label: "Answer", type: "textarea", required: true },
    { name: "category", label: "Category", placeholder: "tests" },
    { name: "displayOrder", label: "Display order", type: "number" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="FAQs"
        description="Staff CRUD for help FAQs. The student app still reads GET /api/help/faqs."
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add FAQ
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "question", header: "Question" },
          { key: "category", header: "Category" },
          { key: "displayOrder", header: "Order" },
          { key: "isPublished", header: "Published", render: (row) => <StatusBadge value={row.isPublished} /> },
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
          const data = await loadForEdit<Faq>(`/api/admin/faqs/${row.id}`);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit FAQ" : "Create FAQ"}
        fields={fields}
        initialValues={editing || { category: "general", isPublished: true, displayOrder: 1 }}
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            if (editing) await updateResource(`/api/admin/faqs/${editing.id}`, body);
            else await createResource("/api/admin/faqs", body);
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
            await deleteResource(`/api/admin/faqs/${deleting.id}`);
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
