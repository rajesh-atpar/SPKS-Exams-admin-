"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ChevronRight, FileText, Globe, NotebookPen, Plus, Upload, Video } from "lucide-react";

import { toast } from "sonner";

import { apiGet, apiUpload, toastApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { createResource, deleteResource, loadForEdit, updateResource, useResourceList } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { emptyToUndefined, EntityFormSheet, type FormField } from "@/components/admin/EntityFormSheet";
import { LessonPdfDialog } from "@/components/admin/LessonPdfDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable, useListQuery } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

type CatalogRow = {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  isActive?: boolean;
  isPublished?: boolean;
  displayOrder?: number;
  content?: string;
  duration?: number;
  pdfUrl?: string | null;
  pdfPath?: string | null;
  pdfViewUrl?: string | null;
};

type Level = "course" | "group" | "class" | "subject" | "chapter" | "lesson";

const labels: Record<Level, { plural: string; singular: string; child?: Level }> = {
  course: { plural: "Courses", singular: "Course", child: "group" },
  group: { plural: "Groups", singular: "Group", child: "class" },
  class: { plural: "Classes", singular: "Class", child: "subject" },
  subject: { plural: "Subjects", singular: "Subject", child: "chapter" },
  chapter: { plural: "Chapters", singular: "Chapter", child: "lesson" },
  lesson: { plural: "Lessons", singular: "Lesson" },
};

const descriptions: Record<Level, string> = {
  course:
    "Catalog tree: Course → Group → Class → Subject → Chapter → Lesson. Open a group for School Books and group media (notes, videos, tests).",
  group: "Groups under this course. Open a group for School Books (Classes → …) and Notes / Books / Videos / Tests.",
  class: "School books: Classes under this group. Click a class to open its subjects.",
  subject:
    "Subjects under this class. Click a subject to manage chapters and lessons.",
  chapter: "Chapters belong to content, not catalog. Click a chapter to manage lessons.",
  lesson: "Lessons are content under a chapter. Save lesson metadata as JSON, then attach the PDF as multipart (field: file).",
};

async function attachLessonPdf(lessonId: string, file: File) {
  if (file.type && file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }
  const res = await apiUpload<{ pdfUrl?: string | null; pdfViewUrl?: string | null }>(
    `/api/admin/lessons/${lessonId}/pdf`,
    file,
    "file"
  );
  if (!res.data || !(res.data.pdfUrl || res.data.pdfViewUrl)) {
    throw new Error(
      "PDF was not saved on the lesson (data is null). Run database/migrations/2026-09-18-lesson-pdfs.sql in Supabase, reload schema, then upload again."
    );
  }
  toast.success(res.message || "Lesson PDF updated");
}

function fieldsFor(level: Level, editing?: CatalogRow | null): FormField[] {
  if (level === "chapter") {
    return [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "isPublished", label: "Published", type: "switch" },
    ];
  }
  if (level === "lesson") {
    const currentPdf = editing?.pdfUrl || editing?.pdfViewUrl || undefined;
    return [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "duration", label: "Duration (minutes)", type: "number" },
      { name: "displayOrder", label: "Display order", type: "number" },
      {
        name: "file",
        label: "PDF",
        type: "file",
        accept: "application/pdf",
        hint: currentPdf
          ? "Leave empty to keep the current PDF. Choosing a file replaces it after save."
          : "Optional. Saved after the lesson is created (multipart field: file).",
        previewUrl: currentPdf,
        previewLabel: "View current PDF",
      },
      { name: "isPublished", label: "Published", type: "switch" },
    ];
  }
  const extra: FormField[] = level === "course" ? [{ name: "icon", label: "Icon" }] : [];
  const image = level === "class" ? [] : [{ name: "imageUrl", label: "Image URL" }];
  return [
    { name: "name", label: "Name", required: true },
    { name: "slug", label: "Slug", hint: "Leave blank to auto-slugify from the name" },
    { name: "description", label: "Description", type: "textarea" },
    ...image,
    ...extra,
    { name: "displayOrder", label: "Display order", type: "number" },
    { name: "isActive", label: "Active", type: "switch" },
  ];
}

const catalogSteps: Array<{ key: Level; label: string }> = [
  { key: "course", label: "Course" },
  { key: "group", label: "Group" },
  { key: "class", label: "Class" },
  { key: "subject", label: "Subject" },
];

function CatalogTreeBar({
  level,
  names,
  onStep,
}: {
  level: Level;
  names: Record<string, string>;
  onStep: (key: Level) => void;
}) {
  const reached: Record<Level, boolean> = {
    course: true,
    group: level !== "course",
    class: ["class", "subject", "chapter", "lesson"].includes(level),
    subject: ["subject", "chapter", "lesson"].includes(level),
    chapter: ["chapter", "lesson"].includes(level),
    lesson: level === "lesson",
  };

  return (
    <div className="mb-4 rounded-lg border bg-card p-3">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Catalog tree
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {catalogSteps.map((step, index) => {
          const active = level === step.key;
          const enabled = reached[step.key];
          const caption =
            step.key === "course"
              ? names.course
              : step.key === "group"
                ? names.group
                : step.key === "class"
                  ? names.class
                  : names.subject;
          return (
            <div key={step.key} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
              <Button
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                disabled={!enabled}
                onClick={() => onStep(step.key)}
              >
                {step.label}
                {caption ? (
                  <span className="max-w-28 truncate font-normal opacity-80">· {caption}</span>
                ) : null}
              </Button>
            </div>
          );
        })}
      </div>
      {level === "course" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Click a course, or use <span className="font-medium text-foreground">Open groups</span> on
          a row, to reach Group → Class → Subject.
        </p>
      ) : null}
    </div>
  );
}

function GroupMediaLinks({ courseId, groupId }: { courseId: string; groupId: string }) {
  const qs = `courseId=${courseId}&groupId=${groupId}`;
  const links = [
    { href: `/content?${qs}&contentType=note`, label: "Notes", icon: NotebookPen },
    { href: `/content?${qs}&contentType=book`, label: "Books", icon: BookOpen },
    {
      href: `/content?${qs}&contentType=outside-source`,
      label: "Outside sources",
      icon: Globe,
    },
    { href: `/content?${qs}&contentType=pdf`, label: "PDFs", icon: FileText },
    { href: `/videos?${qs}`, label: "Videos", icon: Video },
    { href: `/tests?${qs}`, label: "Tests", icon: BookOpen },
  ];
  return (
    <div className="mb-4 rounded-lg border bg-card p-3">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Group media
      </p>
      <p className="mb-2 text-sm text-muted-foreground">
        School books stay in this tree (Classes → Subjects → Chapters → Lessons). Notes, books,
        videos, and tests attach to this group.
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((item) => (
          <Button key={item.href} asChild size="sm" variant="outline">
            <Link href={item.href}>
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogPageInner />
    </Suspense>
  );
}

function CatalogPageInner() {
  const { user } = useAuth();
  const writable = canWrite(user?.role, "catalog");
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params?.get("courseId") || "";
  const groupId = params?.get("groupId") || "";
  const classId = params?.get("classId") || "";
  const subjectId = params?.get("subjectId") || "";
  const chapterId = params?.get("chapterId") || "";

  const level: Level = chapterId
    ? "lesson"
    : subjectId
      ? "chapter"
      : classId
        ? "subject"
        : groupId
          ? "class"
          : courseId
            ? "group"
            : "course";

  const list = useListQuery();
  const endpoint = useMemo(() => {
    if (level === "course") return { path: "/api/admin/courses", query: list.query };
    if (level === "group") return { path: "/api/admin/groups", query: { ...list.query, courseId } };
    if (level === "class") return { path: "/api/admin/classes", query: { ...list.query, groupId } };
    if (level === "subject") return { path: "/api/admin/subjects", query: { ...list.query, classId } };
    if (level === "chapter") return { path: "/api/admin/chapters", query: { ...list.query, subjectId } };
    return { path: "/api/admin/lessons", query: { ...list.query, chapterId } };
  }, [level, list.query, courseId, groupId, classId, subjectId, chapterId]);

  const { items, meta, loading, reload } = useResourceList<CatalogRow>(endpoint.path, endpoint.query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<CatalogRow | null>(null);
  const [pdfLesson, setPdfLesson] = useState<CatalogRow | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadNames() {
      const next: Record<string, string> = {};
      const fetches: Array<[string, string]> = [];
      if (courseId) fetches.push(["course", `/api/admin/courses/${courseId}`]);
      if (groupId) fetches.push(["group", `/api/admin/groups/${groupId}`]);
      if (classId) fetches.push(["class", `/api/admin/classes/${classId}`]);
      if (subjectId) fetches.push(["subject", `/api/admin/subjects/${subjectId}`]);
      if (chapterId) fetches.push(["chapter", `/api/admin/chapters/${chapterId}`]);
      await Promise.all(
        fetches.map(async ([key, path]) => {
          try {
            const res = await apiGet<CatalogRow>(path);
            next[key] = res.data?.name || res.data?.title || "";
          } catch {
            next[key] = "";
          }
        })
      );
      if (!cancelled) setNames(next);
    }
    void loadNames();
    return () => {
      cancelled = true;
    };
  }, [courseId, groupId, classId, subjectId, chapterId]);

  function setParams(next: Record<string, string>) {
    const search = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    router.push(`/catalog${search.toString() ? `?${search}` : ""}`);
  }

  function mutatePath(row?: CatalogRow) {
    const id = row?.id;
    if (level === "course") return id ? `/api/admin/courses/${id}` : "/api/admin/courses";
    if (level === "group") return id ? `/api/admin/groups/${id}` : "/api/admin/groups";
    if (level === "class") return id ? `/api/admin/classes/${id}` : "/api/admin/classes";
    if (level === "subject") return id ? `/api/admin/subjects/${id}` : "/api/admin/subjects";
    if (level === "chapter") return id ? `/api/admin/chapters/${id}` : "/api/admin/chapters";
    return id ? `/api/admin/lessons/${id}` : "/api/admin/lessons";
  }

  function createBody(values: Record<string, unknown>) {
    const body = emptyToUndefined(values);
    if (level === "group") body.courseId = courseId;
    if (level === "class") body.groupId = groupId;
    if (level === "subject") {
      body.classId = classId;
      if (groupId) body.groupId = groupId;
      if (courseId) body.courseId = courseId;
    }
    if (level === "chapter") body.subjectId = subjectId;
    if (level === "lesson") body.chapterId = chapterId;
    return body;
  }

  function openChild(row: CatalogRow) {
    if (!labels[level].child) return;
    if (level === "course") setParams({ courseId: row.id });
    if (level === "group") setParams({ courseId, groupId: row.id });
    if (level === "class") setParams({ courseId, groupId, classId: row.id });
    if (level === "subject") setParams({ courseId, groupId, classId, subjectId: row.id });
    if (level === "chapter") setParams({ courseId, groupId, classId, subjectId, chapterId: row.id });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={labels[level].plural}
        description={descriptions[level]}
        action={
          writable ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" />
              New {labels[level].singular.toLowerCase()}
            </Button>
          ) : undefined
        }
      />
      <CatalogTreeBar
        level={level === "chapter" || level === "lesson" ? "subject" : level}
        names={names}
        onStep={(key) => {
          if (key === "course") setParams({});
          if (key === "group") setParams({ courseId });
          if (key === "class") setParams({ courseId, groupId });
          if (key === "subject") setParams({ courseId, groupId, classId });
        }}
      />
      {courseId && groupId ? <GroupMediaLinks courseId={courseId} groupId={groupId} /> : null}
      <ResourceTable
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => row.name || row.title || "—",
          },
          { key: "slug", header: "Slug", render: (row) => row.slug || "—" },
          ...(level === "lesson"
            ? [
                {
                  key: "pdf",
                  header: "PDF",
                  render: (row: CatalogRow) =>
                    row.pdfUrl || row.pdfViewUrl ? (
                      <a
                        href={row.pdfUrl || row.pdfViewUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    ),
                },
              ]
            : []),
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.isPublished ?? row.isActive ?? false} />,
          },
          { key: "displayOrder", header: "Order" },
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
          const data = await loadForEdit<CatalogRow>(mutatePath(row));
          if (!data) return;
          setEditing(data);
          setOpen(true);
        }}
        onDelete={setDeleting}
        onRowClick={labels[level].child ? openChild : undefined}
        extraActions={
          labels[level].child || (level === "lesson" && writable)
            ? (row) => (
                <>
                  {labels[level].child ? (
                    <Button size="sm" variant="outline" onClick={() => openChild(row)}>
                      Open {labels[labels[level].child!].plural.toLowerCase()}
                      <ChevronRight className="size-4" />
                    </Button>
                  ) : null}
                  {level === "lesson" && writable ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPdfLesson(row)}
                    >
                      <Upload className="size-4" />
                      {row.pdfUrl || row.pdfViewUrl ? "Replace PDF" : "Upload PDF"}
                    </Button>
                  ) : null}
                </>
              )
            : undefined
        }
        emptyTitle={`No ${labels[level].plural.toLowerCase()} yet`}
        emptyDescription={
          labels[level].child
            ? `Create a ${labels[level].singular.toLowerCase()}, then click it to open the next level.`
            : "Create a lesson, then upload its PDF."
        }
      />
      <EntityFormSheet
        open={open}
        title={`${editing ? "Edit" : "Create"} ${labels[level].singular.toLowerCase()}`}
        description={
          level === "lesson"
            ? "Lesson details are saved as JSON. The PDF is uploaded separately as multipart/form-data (field: file)."
            : undefined
        }
        fields={fieldsFor(level, editing)}
        initialValues={
          editing
            ? {
                name: editing.name || "",
                title: editing.title || "",
                slug: editing.slug || "",
                description: editing.description || "",
                imageUrl: editing.imageUrl || "",
                icon: editing.icon || "",
                content: editing.content || "",
                duration: editing.duration ?? "",
                displayOrder: editing.displayOrder ?? 0,
                isActive: editing.isActive ?? true,
                isPublished: editing.isPublished ?? false,
                file: undefined,
              }
            : { isActive: true, isPublished: false, displayOrder: 0, file: undefined }
        }
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          setPending(true);
          try {
            const body = createBody(values);
            const file = body.file as File | undefined;
            delete body.file;

            if (editing) {
              await updateResource(mutatePath(editing), body);
              if (level === "lesson" && file instanceof File) {
                await attachLessonPdf(editing.id, file);
              }
            } else {
              const created = await createResource<CatalogRow>(mutatePath(), body);
              if (level === "lesson" && created?.id && file instanceof File) {
                await attachLessonPdf(created.id, file);
              }
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
      <LessonPdfDialog
        lesson={pdfLesson}
        open={Boolean(pdfLesson)}
        onOpenChange={(next) => {
          if (!next) setPdfLesson(null);
        }}
        onUploaded={reload}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        pending={pending}
        onOpenChange={(next) => !next && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          setPending(true);
          try {
            await deleteResource(mutatePath(deleting));
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
