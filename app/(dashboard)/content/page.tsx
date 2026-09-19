"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { apiGet, apiUpload, listFrom, toastApiError, uploadedUrl } from "@/lib/api-client";
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

type CatalogOption = { id: string; name: string };

type ContentItem = {
  id: string;
  title: string;
  contentType?: string;
  language?: string;
  isPremium?: boolean;
  isPublished?: boolean;
  fileUrl?: string;
  courseId?: string;
  groupId?: string;
};

const contentTypes = ["note", "book", "outside-source", "pdf"];

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
  const courseFromUrl = params?.get("courseId") || "";
  const groupFromUrl = params?.get("groupId") || "";
  const typeFromUrl = params?.get("contentType") || "all";
  const list = useListQuery();
  const [courseId, setCourseId] = useState(courseFromUrl || "all");
  const [groupId, setGroupId] = useState(groupFromUrl || "all");
  const [contentType, setContentType] = useState(typeFromUrl);
  const [courses, setCourses] = useState<CatalogOption[]>([]);
  const [groups, setGroups] = useState<CatalogOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);

  useEffect(() => {
    setContentType(typeFromUrl);
  }, [typeFromUrl]);

  useEffect(() => {
    if (courseFromUrl) setCourseId(courseFromUrl);
    if (groupFromUrl) setGroupId(groupFromUrl);
  }, [courseFromUrl, groupFromUrl]);

  useEffect(() => {
    apiGet<CatalogOption[]>("/api/admin/courses", { limit: 100 })
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : listFrom(res).items))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (courseId === "all") {
      setGroups([]);
      return;
    }
    apiGet<CatalogOption[]>("/api/admin/groups", { courseId, limit: 100 })
      .then((res) => setGroups(Array.isArray(res.data) ? res.data : listFrom(res).items))
      .catch(() => setGroups([]));
  }, [courseId]);

  const query = useMemo(
    () => ({
      ...list.query,
      contentType: contentType === "all" ? undefined : contentType,
      courseId: courseId !== "all" ? courseId : undefined,
      groupId: groupId !== "all" ? groupId : undefined,
    }),
    [list.query, contentType, courseId, groupId]
  );
  const { items, meta, loading, reload } = useResourceList<ContentItem>("/api/admin/content", query);

  const selectedGroup = groups.find((group) => group.id === groupId);
  const canCreate = writable && groupId !== "all";

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
      name: "file",
      label: "Upload file",
      type: "file",
      accept: "application/pdf,image/jpeg,image/png,image/webp",
      hint: "POST /api/admin/content/upload (field: file) → fileUrl. Do not send the binary as JSON.",
      previewUrl: editing?.fileUrl || undefined,
      previewLabel: "View current file",
    },
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
        description="Pick a course, then a group. Notes, books, outside sources, and PDFs attach to that group (same place as videos and tests)."
        action={
          canCreate ? (
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
          {
            key: "groupId",
            header: "Group",
            render: (row) => groups.find((group) => group.id === row.groupId)?.name || row.groupId || "—",
          },
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
          <>
            <Select
              value={courseId}
              onValueChange={(value) => {
                setCourseId(value);
                setGroupId("all");
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={groupId} onValueChange={setGroupId} disabled={courseId === "all"}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </>
        }
        emptyTitle={groupId === "all" && courseId !== "all" ? "Pick a group" : "No content yet"}
        emptyDescription={
          courseId === "all"
            ? "Filter by course, then a group, then add notes or books."
            : groupId === "all"
              ? "Choose a group to list and create content for that catalog branch."
              : `Create content for ${selectedGroup?.name || "this group"}.`
        }
      />
      <EntityFormSheet
        open={open}
        title={
          editing
            ? "Edit content"
            : `Create content${selectedGroup ? ` · ${selectedGroup.name}` : ""}`
        }
        fields={fields}
        initialValues={
          editing
            ? { ...editing, file: undefined }
            : {
                contentType: contentType === "all" ? "note" : contentType,
                isPremium: false,
                isPublished: true,
                file: undefined,
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
              const uploaded = await apiUpload("/api/admin/content/upload", file);
              body.fileUrl = uploadedUrl(uploaded.data) || body.fileUrl;
            }
            if (!editing) {
              if (groupId === "all") throw new Error("Select a group before creating content");
              body.groupId = groupId;
              if (courseId !== "all") body.courseId = courseId;
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
