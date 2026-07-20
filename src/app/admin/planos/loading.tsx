import { PageHeaderSkeleton } from "@/components/panel/panel-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPlanosLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border-2 bg-card p-7">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-2 h-4 w-40" />
            <Skeleton className="mt-4 h-9 w-28" />
            <div className="mt-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
