import { PageHeaderSkeleton } from "@/components/panel/panel-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClienteLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeaderSkeleton />
      <div className="rounded-xl border bg-primary/5 p-5">
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <div className="rounded-xl border bg-card p-5">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
