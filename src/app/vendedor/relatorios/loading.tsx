import {
  PageHeaderSkeleton,
  StatsSkeleton,
} from "@/components/panel/panel-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const barHeights = [45, 70, 55, 90, 65, 82, 50];

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-2 h-3.5 w-56" />
      <div className="mt-6 flex h-44 items-end gap-2.5">
        {barHeights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function RelatoriosLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-end justify-between">
        <PageHeaderSkeleton />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <StatsSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
