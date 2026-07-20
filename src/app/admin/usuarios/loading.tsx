import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/panel/panel-skeletons";

export default function AdminUsuariosLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
