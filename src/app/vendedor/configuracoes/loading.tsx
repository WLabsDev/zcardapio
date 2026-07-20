import {
  FormSkeleton,
  PageHeaderSkeleton,
} from "@/components/panel/panel-skeletons";

export default function ConfiguracoesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={4} />
      <FormSkeleton fields={2} />
    </div>
  );
}
