"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { apiGet, apiUpload, toastApiError, uploadedUrl } from "@/lib/api-client";
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

type ContentItem = {
  id: string;
  title: string;
  contentType?: string;
  language?: string;
  isPremium?: boolean;
  isPublished?: boolean;
  fileUrl?: string;
  courseId?: string;
};

const contentTypes = ["pdf", "book", "note", "article", "outside-source", "lesson"];

export default function ContentPage() {
  return (
    <Suspense>
      <ContentPageInner />
    </Suspense>
  );
}

function ContentPageInner() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "content");
  const params = useSearchParams();
  const courseId = params?.get("courseId") || "";
  const typeFromUrl = params?.get("contentType") || "all";
  const list = useListQuery();
  const [contentType, setContentType] = useState(typeFromUrl);
  useEffect(() => {
    setContentType(typeFromUrl);
  }, [typeFromUrl]);
  const query = useMemo(
    () => ({
      ...list.query,
      contentType: contentType === "all" ? undefined : contentType,
      courseId: courseId || undefined,
    }),
    [list.query, contentType, courseId]
  );
  const { items, meta, loading, reload } = useResourceList<ContentItem>("/api/admin/content", query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);

  useMemo(() => {
    apiGet<Array<{ id: string; name: string }>>("/api/admin/courses", { limit: 100 })
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => undefined);
  }, []);

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "contentType",
      label: "Type",
      type: "select",
      required: true,
      options: contentTypes.map((value) => ({ label: value, value })),
    },
    {
      name: "courseId",
      label: "Course",
      type: "select",
      options: courses.map((course) => ({ label: course.name, value: course.id })),
    },
    { name: "file", label: "Upload file", type: "file", accept: "application/pdf,image/jpeg,image/png,image/webp", hint: "PDF or image, max 25MB" },
    { name: "fileUrl", label: "File URL" },
    { name: "thumbnailUrl", label: "Thumbnail URL" },
    { name: "language", label: "Language" },
    { name: "isPremium", label: "Premium", type: "switch" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Content"
        description={
          courseId
            ? "Course media for this catalog course. Types: pdf, book, note, article, outside-source, lesson."
            : "PDFs, books, notes, articles, and outside sources attached to a course."
        }
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add content
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          { key: "contentType", header: "Type" },
          { key: "language", header: "Language" },
          { key: "isPremium", header: "Premium", render: (row) => <StatusBadge value={row.isPremium} /> },
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
          const data = await loadForEdit<ContentItem>(`/api/admin/content/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
        filters={
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {contentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit content" : "Create content"}
        fields={fields}
        initialValues={
          editing
            ? { ...editing, file: undefined }
            : { contentType: contentType === "all" ? "pdf" : contentType, courseId: courseId || undefined, isPremium: false, isPublished: false }
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
              const uploaded = await apiUpload("/api/admin/content/upload", file);
              body.fileUrl = uploadedUrl(uploaded.data) || body.fileUrl;
            }
            if (editing) await updateResource(`/api/admin/content/${editing.id}`, body);
            else await createResource("/api/admin/content", body);
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
            await deleteResource(`/api/admin/content/${deleting.id}`);
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
