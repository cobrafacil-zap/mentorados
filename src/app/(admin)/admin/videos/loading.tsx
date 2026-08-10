// =========================================================
// Loading skeleton para /admin/videos — exibido enquanto o
// server entrega o bundle e o componente client monta.
// A página em si é client (`"use client"`); esse skeleton
// cobre o tempo entre o request e a hidratação.
// =========================================================

import { SkeletonBlock, SkeletonChip, SkeletonLine } from "@/components/Skeleton";

export default function AdminVideosLoading() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-1.5">
            <SkeletonLine width="w-10" />
            <span className="text-slate-600">/</span>
            <SkeletonLine width="w-14" />
          </div>
          <SkeletonLine className="h-7" width="w-64" />
          <div className="mt-2 space-y-1.5">
            <SkeletonLine className="h-3" width="min(560px, 80%)" />
          </div>
        </div>
        <SkeletonBlock height="h-9" className="w-32" />
      </header>

      {/* Stats 4 colunas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} height="h-20" />
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBlock height="h-9" className="flex-1 min-w-[220px]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonChip key={i} width="w-32" />
          ))}
        </div>
      </div>

      {/* Lista de vídeos (skeleton tabular) */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} height="h-16" />
        ))}
      </div>
    </div>
  );
}
