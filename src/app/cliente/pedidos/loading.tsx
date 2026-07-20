import {
  CardListSkeleton,
  PageHeaderSkeleton,
} from "@/components/panel/panel-skeletons";

export default function ClientePedidosLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSkeleton />
      <CardListSkeleton items={3} />
    </div>
  );
}
