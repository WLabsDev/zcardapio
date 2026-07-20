import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/panel/panel-skeletons";

export default function AdminRestaurantesLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
