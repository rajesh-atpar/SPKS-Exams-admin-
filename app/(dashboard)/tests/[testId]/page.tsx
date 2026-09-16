"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiGet, apiPatch, apiPost, apiUpload, toastApiError, uploadedUrl } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { canWrite } from "@/lib/permissions";
import { deleteResource } from "@/lib/use-resource";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Question = {
  id?: string;
  question: string;
  questionImage?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks?: number;
  negativeMarks?: number;
  questionNumber?: number;
};

type TestDetail = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  questions?: Question[];
};

const blankQuestion = (): Question => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
  negativeMarks: 0,
});

export default function TestDetailPage() {
  const params = useParams<{ testId: string }>();
  const testId = params?.testId || "";
  const router = useRouter();
  const { user } = useAuth();
  const writable = canWrite(user?.role, "tests");
  const [test, setTest] = useState<TestDetail | null>(null);
  const [draft, setDraft] = useState<Question>(blankQuestion());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<Question | null>(null);

  async function load() {
    try {
      const res = await apiGet<TestDetail>(`/api/admin/tests/${testId}`);
      setTest(res.data);
    } catch (error) {
      toastApiError(error);
    }
  }

  useEffect(() => {
    if (!testId) return;
    void load();
  }, [testId]);

  async function saveQuestion() {
    const options = draft.options.map((item) => item.trim()).filter(Boolean);
    if (!draft.question.trim() || options.length < 2 || !draft.correctAnswer) {
      toast.error("Question, at least two options, and a correct answer are required");
      return;
    }
    setPending(true);
    try {
      const body = { ...draft, options };
      if (editingId) {
        await apiPatch(`/api/admin/questions/${editingId}`, body);
        toast.success("Question updated");
      } else {
        await apiPost(`/api/admin/tests/${testId}/questions`, body);
        toast.success("Question added");
      }
      setDraft(blankQuestion());
      setEditingId(null);
      await load();
    } catch (error) {
      toastApiError(error);
    } finally {
      setPending(false);
    }
  }

  const questions = test?.questions || [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={test?.title || "Test"}
        description="Add options, pick the correct answer, then preview the paper."
        action={
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to tests
          </Button>
        }
      />
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Question editor</TabsTrigger>
          <TabsTrigger value="preview">Preview paper</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit question" : "Add question"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Question</Label>
                <Textarea
                  value={draft.question}
                  onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Question image</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 25 * 1024 * 1024) {
                      toast.error("Image must be 25MB or smaller");
                      return;
                    }
                    setPending(true);
                    try {
                      const uploaded = await apiUpload(
                        "/api/admin/questions/upload",
                        file,
                        "questionImage"
                      );
                      const url = uploadedUrl(uploaded.data);
                      if (url) {
                        setDraft((prev) => ({ ...prev, questionImage: url }));
                        toast.success("Image uploaded");
                      } else {
                        toast.error("Upload succeeded but no URL was returned");
                      }
                    } catch (error) {
                      toastApiError(error);
                    } finally {
                      setPending(false);
                    }
                  }}
                />
                <Input
                  placeholder="Or paste image URL"
                  value={draft.questionImage || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, questionImage: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft((prev) => ({ ...prev, options: [...prev.options, ""] }))}
                  >
                    <Plus className="size-4" />
                    Option
                  </Button>
                </div>
                {draft.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={draft.correctAnswer === option && option !== ""}
                      onChange={() => setDraft((prev) => ({ ...prev, correctAnswer: option }))}
                    />
                    <Input
                      value={option}
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) => {
                        const next = [...draft.options];
                        next[index] = e.target.value;
                        setDraft((prev) => ({
                          ...prev,
                          options: next,
                          correctAnswer: prev.correctAnswer === option ? e.target.value : prev.correctAnswer,
                        }));
                      }}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          options: prev.options.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Select the radio next to the correct answer.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={draft.marks ?? 1}
                    onChange={(e) => setDraft((prev) => ({ ...prev, marks: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Negative marks</Label>
                  <Input
                    type="number"
                    value={draft.negativeMarks ?? 0}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, negativeMarks: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Number</Label>
                  <Input
                    type="number"
                    value={draft.questionNumber ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, questionNumber: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Explanation</Label>
                <Textarea
                  value={draft.explanation || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, explanation: e.target.value }))}
                />
              </div>
              {writable ? (
                <div className="flex gap-2">
                  <Button type="button" disabled={pending} onClick={() => void saveQuestion()}>
                    {pending ? "Saving..." : editingId ? "Update question" : "Add question"}
                  </Button>
                  {editingId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(blankQuestion());
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions yet.</p>
              ) : (
                questions.map((question, index) => (
                  <div key={question.id || index} className="rounded-lg border p-3">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    {question.questionImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={question.questionImage} alt="" className="mt-2 h-20 rounded-md object-cover" />
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Answer: {normalizeAnswer(question.correctAnswer)}
                    </p>
                    {writable ? (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(question.id || null);
                            setDraft({
                              ...question,
                              options: normalizeOptions(question.options),
                              correctAnswer: normalizeAnswer(question.correctAnswer),
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(question)}>
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>{test?.title} — preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id || index} className="space-y-2">
                  <p className="font-medium">
                    {index + 1}. {question.question}{" "}
                    <span className="text-xs text-muted-foreground">({question.marks ?? 1} marks)</span>
                  </p>
                  {question.questionImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={question.questionImage} alt="" className="h-32 rounded-md object-cover" />
                  ) : null}
                  <ol className="list-decimal space-y-1 pl-5 text-sm">
                    {normalizeOptions(question.options).map((option) => (
                      <li key={option} className={option === normalizeAnswer(question.correctAnswer) ? "font-medium text-primary" : ""}>
                        {option}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ConfirmDialog
        open={Boolean(deleting)}
        pending={pending}
        onOpenChange={(next) => !next && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting?.id) return;
          setPending(true);
          try {
            await deleteResource(`/api/admin/questions/${deleting.id}`);
            setDeleting(null);
            await load();
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

function normalizeOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) =>
    typeof option === "string" ? option : String((option as { text?: string }).text || "")
  );
}

function normalizeAnswer(answer: unknown) {
  if (typeof answer === "string") return answer;
  if (answer && typeof answer === "object" && "text" in answer) {
    return String((answer as { text?: string }).text || "");
  }
  return String(answer || "");
}
