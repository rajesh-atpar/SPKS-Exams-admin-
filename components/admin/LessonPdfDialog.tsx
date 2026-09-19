"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiUpload, toastApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LessonPdfTarget = {
  id: string;
  title?: string;
  name?: string;
  pdfUrl?: string | null;
  pdfViewUrl?: string | null;
};

export function LessonPdfDialog({
  lesson,
  open,
  afterCreate = false,
  onOpenChange,
  onUploaded,
}: {
  lesson: LessonPdfTarget | null;
  open: boolean;
  afterCreate?: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => Promise<void> | void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState<LessonPdfTarget | null>(lesson);
  const [created, setCreated] = useState(afterCreate);
  const hasPdf = Boolean(current?.pdfUrl || current?.pdfViewUrl);
  const title = current?.title || current?.name || "this lesson";

  useEffect(() => {
    if (lesson) setCurrent(lesson);
  }, [lesson]);

  useEffect(() => {
    if (open) setCreated(afterCreate);
  }, [open, afterCreate]);

  useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  async function uploadPdf() {
    if (!current?.id) return;
    if (!file) {
      toast.error("Choose a PDF file first.");
      return;
    }
    if (file.type && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    setPending(true);
    try {
      const res = await apiUpload<{ pdfUrl?: string | null; pdfViewUrl?: string | null }>(
        `/api/admin/lessons/${current.id}/pdf`,
        file
      );
      if (!res.data || !(res.data.pdfUrl || res.data.pdfViewUrl)) {
        throw new Error(
          "PDF was not saved on the lesson (data is null). Run database/migrations/2026-09-18-lesson-pdfs.sql in Supabase, reload schema, then upload again."
        );
      }
      toast.success(res.message || "Lesson PDF updated");
      onOpenChange(false);
      await onUploaded();
    } catch (error) {
      toastApiError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasPdf ? "Replace PDF" : "Upload PDF"}</DialogTitle>
          <DialogDescription>
            {created
              ? `Lesson “${title}” is saved. Attach its study PDF now, or skip and add it later.`
              : hasPdf
                ? `Replace the PDF on “${title}”. The previous file is removed after a successful upload.`
                : `Upload a PDF for “${title}”.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="lesson-pdf">PDF file</Label>
          <Input
            id="lesson-pdf"
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">PDF only, max 25MB. Field name: file.</p>
          {hasPdf && current?.pdfUrl ? (
            <a
              href={current.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View current PDF
            </a>
          ) : null}
        </div>
        <DialogFooter>
          {created ? (
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              Skip for now
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button type="button" disabled={pending} onClick={() => void uploadPdf()}>
            {pending ? "Uploading..." : hasPdf ? "Replace PDF" : "Upload PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
