import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/panel/panel-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardapioLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <PageHeaderSkeleton />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
