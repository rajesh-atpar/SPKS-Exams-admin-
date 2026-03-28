import { Skeleton } from "@/components/ui/skeleton";

interface AdminContentLoaderProps {
  title?: string;
  description?: string;
}

export function AdminContentLoader({
  title = "Loading content",
  description = "Refreshing the current view inside the admin workspace.",
}: AdminContentLoaderProps) {
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Skeleton className="h-[360px] rounded-3xl" />
          <Skeleton className="h-[360px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
