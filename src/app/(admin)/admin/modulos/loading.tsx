// =========================================================
// Loading skeleton para /admin/modulos — exibido enquanto o
// server roda o `prisma.video.groupBy` (2 queries). Espelha
// o cabeçalho + grid de 4 cards de stats para evitar shift.
// =========================================================

import { SkeletonBlock, SkeletonChip, SkeletonLine } from "@/components/Skeleton";

export default function AdminModulosLoading() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-1.5">
            <SkeletonLine width="w-10" />
            <span className="text-slate-600">/</span>
            <SkeletonLine width="w-16" />
          </div>
          <SkeletonLine className="h-7" width="w-72" />
          <div className="mt-2 space-y-1.5">
            <SkeletonLine className="h-3" width="min(640px, 95%)" />
            <SkeletonLine className="h-3" width="min(520px, 75%)" />
          </div>
        </div>
      </header>

      {/* Grid de 4 cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <article
            key={i}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="space-y-4">
              {/* Badge + % chip */}
              <div className="flex items-center justify-between gap-2">
                <SkeletonChip width="w-28" />
                <SkeletonChip width="w-20" />
              </div>

              {/* Título */}
              <div className="space-y-2">
                <SkeletonLine className="h-5" width="w-2/3" />
                <SkeletonLine className="h-3" width="95%" />
                <SkeletonLine className="h-3" width="80%" />
              </div>

              {/* Stats (3 blocos) */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <SkeletonLine width="w-10" />
                    <div className="mt-1.5">
                      <SkeletonLine className="h-6" width="w-8" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Categorias chips */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <SkeletonChip key={j} width="w-20" />
                ))}
              </div>

              {/* CTA botão */}
              <div className="pt-1">
                <SkeletonBlock height="h-8" className="w-28" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
