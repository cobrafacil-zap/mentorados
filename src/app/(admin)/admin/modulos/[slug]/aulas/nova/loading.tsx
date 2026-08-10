import { SkeletonBlock, SkeletonLine } from "@/components/Skeleton";

export default function NewAulaLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-3 w-44" />
        <SkeletonLine className="h-8 w-72" />
        <SkeletonLine className="h-4 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SkeletonBlock className="h-56" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-72" />
        </div>
        <div className="space-y-5">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-40" />
        </div>
      </div>
    </div>
  );
}
