import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { moduleBySlug } from "@/lib/modules";
import { VIDEO_CATEGORY_LABELS, videoCategoryLabel } from "@/lib/videoCategories";
import type { VideoCategory } from "@prisma/client";
import { ModuleAulasTable } from "./_components/ModuleAulasTable";
import { ModuleSeedBanner } from "./_components/ModuleSeedBanner";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Mapeia PT-BR label → enum Prisma (defensivo; alguns labels podem
 *  não ter enum se o seed nunca rodou com aquela categoria). */
function categoryEnumFromLabel(label: string): VideoCategory | undefined {
  const entry = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
    .find(([, l]) => l === label);
  return entry?.[0] as VideoCategory | undefined;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const mod = moduleBySlug(slug);
  if (!mod) notFound();

  const categoryEnums = mod.videoCategoryKeys
    .map((label) => categoryEnumFromLabel(label))
    .filter((c): c is VideoCategory => !!c);

  let videos: Awaited<ReturnType<typeof prisma.video.findMany>> = [];
  let groups: { category: VideoCategory; published: boolean; _count: { _all: number } }[] = [];
  let dbAvailable = true;
  let errorMessage: string | undefined;

  try {
    [videos, groups] = await Promise.all([
      prisma.video.findMany({
        where: categoryEnums.length > 0 ? { category: { in: categoryEnums } } : undefined,
        orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.video.groupBy({
        by: ["category", "published"],
        where: categoryEnums.length > 0 ? { category: { in: categoryEnums } } : undefined,
        _count: { _all: true },
      }),
    ]);
  } catch (error) {
    dbAvailable = false;
    errorMessage =
      error instanceof Error ? error.message : "Não foi possível consultar o banco.";
    console.warn("[admin/modulos/[slug]] DB indisponível:", error);
  }

  // Calcula stats agregadas a partir do groupBy
  let total = 0;
  let published = 0;
  let drafts = 0;
  for (const g of groups) {
    const count = g._count._all;
    total += count;
    if (g.published) published += count;
    else drafts += count;
  }
  const featured = (videos as { featured: boolean }[]).filter((v) => v.featured).length;

  // Por categoria no módulo — usado nos chips e no sidebar de categorias.
  const categoriesWithVideos = mod.videoCategoryKeys.map((label) => {
    const enumKey = categoryEnumFromLabel(label);
    const count = enumKey
      ? groups
          .filter((g) => g.category === enumKey)
          .reduce((acc, g) => acc + g._count._all, 0)
      : 0;
    return { label, enumKey, count };
  });

  const totalGlobal = dbAvailable ? total : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <Link href="/admin/modulos" className="hover:text-white">Módulos</Link>
            <span>/</span>
            <span className="text-slate-300">{mod.title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Aulas — <span className="text-gradient-orange">{mod.shortTitle}</span>
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
              Módulo {mod.order} de 4
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{mod.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/modulos"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            ← Todos os módulos
          </Link>
          <Link
            href={`/admin/modulos/${slug}/aulas/nova`}
            className="btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            Nova aula
          </Link>
        </div>
      </header>

      {/* Categorias do módulo */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Categorias</span>
        {categoriesWithVideos.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-200"
          >
            {videoCategoryLabel(c.enumKey ?? c.label)}
            <span className="text-slate-500">{c.count}</span>
          </span>
        ))}
      </div>

      {/* Banner de DB indisponível */}
      {!dbAvailable && (
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#ffb066]/30 bg-[#ffb066]/5 px-4 py-3 text-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#ffb066]">
            <path d="M12 9v4M12 17v.5M2.5 19.5h19l-9.5-16-9.5 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">Banco de dados indisponível</div>
            <div className="mt-0.5 text-slate-300">
              Detalhes: <span className="text-slate-400">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Seed banner */}
      {dbAvailable && totalGlobal === 0 && <ModuleSeedBanner onSeeded={() => { /* server refresh happens by revalidate */ }} />}

      <ModuleAulasTable
        module={mod}
        slug={slug}
        categoryEnums={categoryEnums}
        initialVideos={videos as never}
        initialStats={{ total, published, drafts, featured }}
        dbAvailable={dbAvailable}
      />
    </div>
  );
}
