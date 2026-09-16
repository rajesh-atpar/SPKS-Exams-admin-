"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListChecks, Plus } from "lucide-react";

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

type TestItem = {
  id: string;
  title: string;
  duration?: number;
  passingMarks?: number;
  totalQuestions?: number;
  isPremium?: boolean;
  isPublished?: boolean;
  courseId?: string;
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
  const courseId = params?.get("courseId") || "";
  const list = useListQuery();
  const query = useMemo(
    () => ({ ...list.query, courseId: courseId || undefined }),
    [list.query, courseId]
  );
  const { items, meta, loading, reload } = useResourceList<TestItem>("/api/admin/tests", query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestItem | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<TestItem | null>(null);
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
      name: "courseId",
      label: "Course",
      type: "select",
      options: courses.map((course) => ({ label: course.name, value: course.id })),
    },
    { name: "duration", label: "Duration (minutes)", type: "number" },
    { name: "passingMarks", label: "Passing marks", type: "number" },
    { name: "isPremium", label: "Premium", type: "switch" },
    { name: "isPublished", label: "Published", type: "switch" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Tests"
        description={
          courseId
            ? "Tests attached to this catalog course. Open a paper to add questions."
            : "Create papers, then open a test to add questions and mark the correct answer."
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
              Create test
            </Button>
          ) : undefined
        }
      />
      <ResourceTable
        columns={[
          { key: "title", header: "Title" },
          { key: "duration", header: "Minutes" },
          { key: "totalQuestions", header: "Questions" },
          { key: "passingMarks", header: "Pass marks" },
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
          const data = await loadForEdit<TestItem>(`/api/admin/tests/${row.id}`, row);
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
        extraActions={(row) => (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Questions"
            onClick={() => router.push(`/tests/${row.id}`)}
          >
            <ListChecks className="size-4" />
          </Button>
        )}
      />
      <EntityFormSheet
        open={open}
        title={editing ? "Edit test" : "Create test"}
        fields={fields}
        initialValues={
          editing || { duration: 60, isPremium: false, isPublished: false, courseId: courseId || undefined }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = emptyToUndefined(values);
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
