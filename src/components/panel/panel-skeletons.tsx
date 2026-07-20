import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-foreground/15 bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className={j === 0 ? "h-4 w-16" : "h-4 w-24"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <Skeleton className="h-5 w-40" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <PageHeaderSkeleton />
        <div className="hidden gap-2 sm:flex">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
      <StatsSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <TableSkeleton rows={4} />
        <div className="rounded-2xl border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-52 max-w-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3.5 w-64 max-w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
