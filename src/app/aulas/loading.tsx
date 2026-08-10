// =========================================================
// Loading skeleton para /aulas — exibido pelo Next enquanto
// o server component lê do DB (`generateMetadata` + getPageContent).
// Espelha a estrutura do PageHeader + grid de vídeos para
// evitar layout shift quando o conteúdo real chega.
// =========================================================

import { SkeletonBlock, SkeletonChip, SkeletonLine } from "@/components/Skeleton";

export default function AulasLoading() {
  return (
    <>
      {/* PageHeader skeleton */}
      <section className="relative overflow-hidden pb-12 pt-20 sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Eyebrow */}
            <SkeletonChip width="w-44" />

            {/* Title */}
            <div className="mt-6 space-y-3">
              <SkeletonLine className="h-8" width="min(640px, 90%)" />
              <SkeletonLine className="h-8" width="min(420px, 60%)" />
            </div>

            {/* Subtitle */}
            <div className="mt-6 space-y-2">
              <SkeletonLine className="h-4" width="min(560px, 80%)" />
              <SkeletonLine className="h-4" width="min(440px, 65%)" />
            </div>

            {/* Crumbs */}
            <div className="mt-8 flex items-center gap-2">
              <SkeletonLine width="w-12" />
              <span className="text-slate-600">/</span>
              <SkeletonLine width="w-16" />
            </div>
          </div>
        </div>
      </section>

      {/* VideoLibrary grid skeleton */}
      <div className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filtros skeleton */}
          <div className="mb-8 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonChip key={i} width={i === 0 ? "w-24" : "w-20"} />
            ))}
          </div>

          {/* Grid de cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} height="h-64" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
