"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { apiGet, listFrom, toastApiError } from "@/lib/api-client";
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
  groupId?: string;
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
  const courseFromUrl = params?.get("courseId") || "";
  const groupFromUrl = params?.get("groupId") || "";
  const list = useListQuery();
  const [courseId, setCourseId] = useState(courseFromUrl || "all");
  const [groupId, setGroupId] = useState(groupFromUrl || "all");
  const [courses, setCourses] = useState<CatalogOption[]>([]);
  const [groups, setGroups] = useState<CatalogOption[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<VideoItem | null>(null);

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
      courseId: courseId !== "all" ? courseId : undefined,
      groupId: groupId !== "all" ? groupId : undefined,
    }),
    [list.query, courseId, groupId]
  );
  const { items, meta, loading, reload } = useResourceList<VideoItem>("/api/admin/videos", query);

  const selectedGroup = groups.find((group) => group.id === groupId);
  const canCreate = writable && groupId !== "all";

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "youtubeId", label: "YouTube ID" },
    { name: "videoUrl", label: "Video URL" },
    { name: "thumbnailUrl", label: "Thumbnail URL" },
    { name: "category", label: "Category" },
    { name: "duration", label: "Duration (seconds)", type: "number" },
    { name: "isPremium", label: "Premium", type: "switch" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Videos"
        description="Pick a course, then a group. Videos attach to that group (same place as notes and tests)."
        action={
          canCreate ? (
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
          {
            key: "groupId",
            header: "Group",
            render: (row) => groups.find((group) => group.id === row.groupId)?.name || row.groupId || "—",
          },
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
          </>
        }
        emptyTitle={groupId === "all" && courseId !== "all" ? "Pick a group" : "No videos yet"}
        emptyDescription={
          courseId === "all"
            ? "Filter by course, then a group, then add a video."
            : groupId === "all"
              ? "Choose a group to list and create videos for that catalog branch."
              : `Create a video for ${selectedGroup?.name || "this group"}.`
        }
      />
      <EntityFormSheet
        open={open}
        title={
          editing ? "Edit video" : `Create video${selectedGroup ? ` · ${selectedGroup.name}` : ""}`
        }
        fields={fields}
        initialValues={
          editing
            ? { ...editing }
            : { isPremium: false, isPublished: true }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            if (!editing) {
              if (groupId === "all") throw new Error("Select a group before creating a video");
              body.groupId = groupId;
              if (courseId !== "all") body.courseId = courseId;
            }
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
