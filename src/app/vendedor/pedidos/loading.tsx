import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/panel/panel-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function PedidosLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderSkeleton />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}
