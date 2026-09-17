"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiGet, toastApiError } from "@/lib/api-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AttemptQuestion = {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
};

type AttemptResult = {
  userId?: string;
  attemptId?: string;
  result?: {
    title?: string;
    testTitle?: string;
    score?: number;
    totalMarks?: number;
    correct?: number;
    incorrect?: number;
    unanswered?: number;
    percentage?: number;
    passed?: boolean;
  };
  questions?: AttemptQuestion[];
};

export default function AttemptResultPage() {
  const params = useParams<{ testId: string; attemptId: string }>();
  const testId = params?.testId || "";
  const attemptId = params?.attemptId || "";
  const router = useRouter();
  const [data, setData] = useState<AttemptResult | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    apiGet<AttemptResult>(`/api/admin/attempts/${attemptId}/result`)
      .then((res) => setData(res.data))
      .catch(toastApiError);
  }, [attemptId]);

  const result = data?.result;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={result?.title || result?.testTitle || "Attempt result"}
        description={`User ${data?.userId || "—"} · ${result?.score ?? 0}/${result?.totalMarks ?? 0} (${result?.percentage ?? 0}%)`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge value={result?.passed} />
            <Button variant="outline" onClick={() => router.push(`/tests/${testId}?tab=results`)}>
              Back to results
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(data?.questions || []).map((question, index) => (
            <div key={question.id || index} className="space-y-2 rounded-lg border p-4">
              <p className="font-medium">
                {index + 1}. {question.question}
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {(question.options || []).map((option) => {
                  const selected = option === question.selectedAnswer;
                  const correct = option === question.correctAnswer;
                  return (
                    <li
                      key={option}
                      className={
                        correct
                          ? "font-medium text-primary"
                          : selected
                            ? "text-destructive"
                            : undefined
                      }
                    >
                      {option}
                      {selected ? " · selected" : ""}
                      {correct ? " · correct" : ""}
                    </li>
                  );
                })}
              </ol>
              <p className="text-xs text-muted-foreground">
                {question.isCorrect ? "Correct" : "Incorrect"} · marks {question.marksAwarded ?? 0}
              </p>
            </div>
          ))}
          {!data?.questions?.length ? (
            <p className="text-sm text-muted-foreground">No answer breakdown for this attempt.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
