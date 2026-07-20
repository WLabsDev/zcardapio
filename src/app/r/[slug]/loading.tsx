import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Cover */}
      <Skeleton className="h-40 w-full rounded-none md:h-56" />

      {/* Restaurant header */}
      <div className="mx-auto -mt-10 max-w-3xl px-4">
        <div className="rounded-2xl border-2 border-foreground bg-card p-4 shadow-offset">
          <div className="flex items-start gap-4">
            <Skeleton className="size-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3.5 w-56" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Search + categories */}
      <div className="mx-auto mt-4 max-w-3xl space-y-3 px-4 py-3">
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border-2 border-foreground/15 bg-card p-3"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="size-24 shrink-0 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
