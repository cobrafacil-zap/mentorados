import { SkeletonBlock, SkeletonChip, SkeletonLine } from "@/components/Skeleton";

export default function ModuleDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <SkeletonLine className="h-3 w-44" />

      {/* Header: título + botões */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-8 w-72" />
          <SkeletonLine className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-44" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <SkeletonChip width="w-24" />
        <SkeletonChip width="w-28" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20" />
        ))}
      </div>

      {/* Filtros */}
      <SkeletonBlock className="h-14" />

      {/* Linhas da tabela */}
      <div className="space-y-2 rounded-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
