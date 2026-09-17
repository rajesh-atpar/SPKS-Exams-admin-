"use client";

import { useParams, useRouter } from "next/navigation";

import { useResourceList } from "@/lib/use-resource";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceTable } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

type HistoryRow = {
  id: string;
  attemptId?: string;
  testId?: string;
  title?: string;
  testTitle?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  passed?: boolean;
  submittedAt?: string;
};

export default function UserTestHistoryPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId || "";
  const router = useRouter();
  const { items, meta, loading } = useResourceList<HistoryRow>(
    `/api/admin/users/${userId}/test-history`,
    { page: 1, limit: 20 },
    Boolean(userId)
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Test history"
        description={`Results for user ${userId}`}
        action={
          <Button variant="outline" onClick={() => router.push("/users")}>
            Back to users
          </Button>
        }
      />
      <ResourceTable
        columns={[
          {
            key: "title",
            header: "Test",
            render: (row) => row.title || row.testTitle || "—",
          },
          {
            key: "score",
            header: "Score",
            render: (row) => `${row.score ?? 0} / ${row.totalMarks ?? 0}`,
          },
          { key: "percentage", header: "%" },
          { key: "passed", header: "Passed", render: (row) => <StatusBadge value={row.passed} /> },
          {
            key: "submittedAt",
            header: "Submitted",
            render: (row) => (row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"),
          },
        ]}
        rows={items.map((row) => ({ ...row, id: row.attemptId || row.id }))}
        loading={loading}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        emptyTitle="No attempts"
        extraActions={(row) =>
          row.testId && (row.attemptId || row.id) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/tests/${row.testId}/attempts/${row.attemptId || row.id}`)}
            >
              Answers
            </Button>
          ) : null
        }
      />
    </div>
  );
}
