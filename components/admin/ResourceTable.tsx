"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export function ResourceTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  search,
  onSearchChange,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  onEdit,
  onDelete,
  onRowClick,
  extraActions,
  canWrite = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting search or create a new item.",
  filters,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onRowClick?: (row: T) => void;
  extraActions?: (row: T) => React.ReactNode;
  canWrite?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  filters?: React.ReactNode;
}) {
  const showActions = canWrite || extraActions;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {onSearchChange ? (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          ) : null}
          {filters}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {showActions ? <TableHead className="w-28 text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                    {showActions ? (
                      <TableCell>
                        <Skeleton className="ml-auto h-4 w-16" />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showActions ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <p className="font-medium">{emptyTitle}</p>
                    <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render
                          ? column.render(row)
                          : String((row as Record<string, unknown>)[column.key] ?? "—")}
                      </TableCell>
                    ))}
                    {showActions ? (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {extraActions?.(row)}
                          {canWrite && onEdit ? (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => onEdit(row)}
                              aria-label="Edit"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {canWrite && onDelete ? (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => onDelete(row)}
                              aria-label="Delete"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} result{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useListQuery() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const query = useMemo(
    () => ({ page, limit: 20, search: debouncedSearch || undefined }),
    [page, debouncedSearch]
  );
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  return { page, setPage, search, setSearch, query };
}
