"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { apiUpload, toastApiError, uploadedUrl } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
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

type Article = {
  id: string;
  title: string;
  category?: string;
  state?: string;
  date?: string;
  language?: string;
  isPublished?: boolean;
  imageUrl?: string;
};

const categories = ["state", "india", "international", "others"];

export default function CurrentAffairsPage() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "currentAffairs");
  const list = useListQuery();
  const [category, setCategory] = useState("all");
  const query = useMemo(
    () => ({ ...list.query, category: category === "all" ? undefined : category }),
    [list.query, category]
  );
  const { items, meta, loading, reload } = useResourceList<Article>(
    "/api/admin/current-affairs",
    query
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<Article | null>(null);

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "summary", label: "Summary", type: "textarea" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map((value) => ({ label: value, value })),
    },
    { name: "state", label: "State" },
    { name: "date", label: "Date", type: "date", required: true, hint: "YYYY-MM-DD" },
    { name: "file", label: "Image", type: "file", accept: "image/jpeg,image/png,image/webp" },
    { name: "imageUrl", label: "Image URL" },
    { name: "sourceName", label: "Source name" },
    { name: "sourceUrl", label: "Source URL" },
    { name: "language", label: "Language" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Current affairs"
        description="State, India, international, and other daily affairs for the student app."
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add article
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "date", header: "Date" },
          { key: "state", header: "State" },
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
          const data = await loadForEdit<Article>(`/api/admin/current-affairs/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
        filters={
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit article" : "Create article"}
        fields={fields}
        initialValues={
          editing
            ? { ...editing, file: undefined, date: String(editing.date || "").slice(0, 10) }
            : {
                category: "india",
                isPublished: false,
                date: new Date().toISOString().slice(0, 10),
              }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            const file = body.file as File | undefined;
            delete body.file;
            if (file instanceof File) {
              const uploaded = await apiUpload("/api/admin/current-affairs/upload", file);
              body.imageUrl = uploadedUrl(uploaded.data) || body.imageUrl;
            }
            if (editing) await updateResource(`/api/admin/current-affairs/${editing.id}`, body);
            else await createResource("/api/admin/current-affairs", body);
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
            await deleteResource(`/api/admin/current-affairs/${deleting.id}`);
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
