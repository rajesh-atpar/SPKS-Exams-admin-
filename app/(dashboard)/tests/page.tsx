"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, ListChecks, Plus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CatalogOption = { id: string; name: string; slug?: string };

type TestItem = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingMarks?: number;
  totalQuestions?: number;
  isPremium?: boolean;
  isPublished?: boolean;
  courseId?: string;
  groupId?: string;
};

export default function TestsPage() {
  return (
    <Suspense>
      <TestsPageInner />
    </Suspense>
  );
}

function TestsPageInner() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "tests");
  const router = useRouter();
  const params = useSearchParams();
  const courseFromUrl = params?.get("courseId") || "";
  const groupFromUrl = params?.get("groupId") || "";
  const [courseId, setCourseId] = useState(courseFromUrl || "all");
  const [groupId, setGroupId] = useState(groupFromUrl || "all");
  const list = useListQuery();
  const query = useMemo(
    () => ({
      ...list.query,
      courseId: courseId !== "all" ? courseId : undefined,
      groupId: groupId !== "all" ? groupId : undefined,
    }),
    [list.query, courseId, groupId]
  );
  const { items, meta, loading, reload } = useResourceList<TestItem>("/api/admin/tests", query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<TestItem | null>(null);
  const [courses, setCourses] = useState<CatalogOption[]>([]);
  const [groups, setGroups] = useState<CatalogOption[]>([]);

  useEffect(() => {
    apiGet<CatalogOption[]>("/api/admin/courses", { limit: 100 })
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (courseFromUrl) setCourseId(courseFromUrl);
    if (groupFromUrl) setGroupId(groupFromUrl);
  }, [courseFromUrl, groupFromUrl]);

  useEffect(() => {
    if (courseId === "all") {
      setGroups([]);
      return;
    }
    apiGet<CatalogOption[]>("/api/admin/groups", { courseId, limit: 100 })
      .then((res) => setGroups(Array.isArray(res.data) ? res.data : []))
      .catch(() => setGroups([]));
  }, [courseId]);

  const selectedGroup = groups.find((group) => group.id === groupId);
  const canCreate = writable && groupId !== "all";

  const fields: FormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "duration", label: "Duration (minutes)", type: "number" },
    { name: "passingMarks", label: "Passing marks", type: "number" },
    { name: "isPremium", label: "Premium", type: "switch" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Tests"
        description="Pick a course, then a group (Group 1–4, Others). Create the paper, then open it to add questions. correctAnswer must match one option exactly."
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create test
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          {
            key: "groupId",
            header: "Group",
            render: (row) => groups.find((group) => group.id === row.groupId)?.name || row.groupId || "—",
          },
          { key: "duration", header: "Minutes" },
          { key: "totalQuestions", header: "Questions" },
          { key: "passingMarks", header: "Pass marks" },
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
          const data = await loadForEdit<TestItem>(`/api/admin/tests/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
        extraActions={(row) => (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Questions"
              onClick={() => router.push(`/tests/${row.id}`)}
            >
              <ListChecks className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Results"
              onClick={() => router.push(`/tests/${row.id}?tab=results`)}
            >
              <ClipboardList className="size-4" />
            </Button>
          </>
        )}
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
            <Select
              value={groupId}
              onValueChange={setGroupId}
              disabled={courseId === "all"}
            >
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
        emptyTitle={groupId === "all" && courseId !== "all" ? "Pick a group" : "No tests yet"}
        emptyDescription={
          courseId === "all"
            ? "Filter by course, then Group 1–4 or Others, then create a paper."
            : groupId === "all"
              ? "Choose Group 1, 2, 3, 4, or Others to list and create tests."
              : `Create a test for ${selectedGroup?.name || "this group"}.`
        }
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit test" : `Create test${selectedGroup ? ` · ${selectedGroup.name}` : ""}`}
        fields={fields}
        initialValues={
          editing
            ? {
                title: editing.title,
                description: editing.description || "",
                duration: editing.duration ?? 60,
                passingMarks: editing.passingMarks ?? 20,
                isPremium: editing.isPremium ?? false,
                isPublished: editing.isPublished ?? false,
              }
            : { duration: 60, passingMarks: 20, isPremium: false, isPublished: true }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
            if (!editing) {
              if (groupId === "all") {
                throw new Error("Select a group before creating a test");
              }
              body.groupId = groupId;
              if (courseId !== "all") body.courseId = courseId;
            }
            if (editing) await updateResource(`/api/admin/tests/${editing.id}`, body);
            else await createResource("/api/admin/tests", body);
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
            await deleteResource(`/api/admin/tests/${deleting.id}`);
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
