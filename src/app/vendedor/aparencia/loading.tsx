import {
  FormSkeleton,
  PageHeaderSkeleton,
} from "@/components/panel/panel-skeletons";

export default function AparenciaLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <FormSkeleton fields={2} />
          <FormSkeleton fields={2} />
        </div>
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
}
