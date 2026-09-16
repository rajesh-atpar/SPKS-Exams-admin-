"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { apiGet, toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { createResource, deleteResource, loadForEdit, updateResource, useResourceList } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { emptyToUndefined, EntityFormSheet, type FormField } from "@/components/admin/EntityFormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

type VideoItem = {
  id: string;
  title: string;
  youtubeId?: string;
  videoUrl?: string;
  category?: string;
  duration?: number;
  isPremium?: boolean;
  isPublished?: boolean;
  courseId?: string;
};

export default function VideosPage() {
  return (
    <Suspense>
      <VideosPageInner />
    </Suspense>
  );
}

function VideosPageInner() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "videos");
  const params = useSearchParams();
  const courseId = params?.get("courseId") || "";
  const list = useListQuery();
  const query = useMemo(
    () => ({ ...list.query, courseId: courseId || undefined }),
    [list.query, courseId]
  );
  const { items, meta, loading, reload } = useResourceList<VideoItem>("/api/admin/videos", query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<VideoItem | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);

  useMemo(() => {
    apiGet<Array<{ id: string; name: string }>>("/api/admin/courses", { limit: 100 })
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => undefined);
  }, []);

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "youtubeId", label: "YouTube ID" },
    { name: "videoUrl", label: "Video URL" },
    { name: "thumbnailUrl", label: "Thumbnail URL" },
    { name: "category", label: "Category" },
    {
      name: "courseId",
      label: "Course",
      type: "select",
      options: courses.map((course) => ({ label: course.name, value: course.id })),
    },
    { name: "duration", label: "Duration (seconds)", type: "number" },
    { name: "isPremium", label: "Premium", type: "switch" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Videos"
        description={
          courseId
            ? "Videos attached to this catalog course."
            : "YouTube IDs or hosted video URLs. Toggle publish to show in the student app."
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
              Add video
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          { key: "youtubeId", header: "YouTube" },
          { key: "category", header: "Category" },
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
          const data = await loadForEdit<VideoItem>(`/api/admin/videos/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit video" : "Create video"}
        fields={fields}
        initialValues={editing || { isPremium: false, isPublished: false, courseId: courseId || undefined }}
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            if (editing) await updateResource(`/api/admin/videos/${editing.id}`, body);
            else await createResource("/api/admin/videos", body);
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
            await deleteResource(`/api/admin/videos/${deleting.id}`);
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
