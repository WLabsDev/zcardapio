import {
  FormSkeleton,
  PageHeaderSkeleton,
} from "@/components/panel/panel-skeletons";

export default function ClientePerfilLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={3} />
      <FormSkeleton fields={2} />
    </div>
  );
}
