import Link from "next/link";
import type { VideoCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MODULES } from "@/lib/modules";
import { VIDEO_CATEGORY_LABELS } from "@/lib/videoCategories";

export const dynamic = "force-dynamic";

interface ModuleCardData {
  module: typeof MODULES[number];
  total: number;
  published: number;
  drafts: number;
  pct: number;
  categoriesWithVideos: { key: VideoCategory; label: string; count: number }[];
  videosByCategory: Record<string, { id: string; title: string; published: boolean; order: number }[]>;
}

async function loadModuleData(): Promise<{
  modules: ModuleCardData[];
  totalGlobal: number;
  dbAvailable: boolean;
  errorMessage?: string;
}> {
  // Tenta buscar do DB. Se falhar (tabela inexistente, sem migration
  // aplicada, DB off), cai num fallback amigável sem quebrar a página.
  let counts: { category: VideoCategory; _count: { _all: number } }[] = [];
  let publishedCounts: { category: VideoCategory; _count: { _all: number } }[] = [];
  let allVideos: { id: string; title: string; category: VideoCategory; published: boolean; order: number }[] = [];
  let dbAvailable = true;
  let errorMessage: string | undefined;

  try {
    [counts, publishedCounts, allVideos] = await Promise.all([
      prisma.video.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
      prisma.video.groupBy({
        by: ["category"],
        where: { published: true },
        _count: { _all: true },
      }),
      prisma.video.findMany({
        select: { id: true, title: true, category: true, published: true, order: true },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
    ]);
  } catch (error) {
    dbAvailable = false;
    errorMessage =
      error instanceof Error
        ? error.message
        : "Não foi possível consultar o banco de dados.";
    console.warn("[admin/modulos] DB indisponível:", error);
  }

  const totalByCat = new Map<string, number>();
  for (const row of counts) totalByCat.set(row.category, row._count._all);

  const pubByCat = new Map<string, number>();
  for (const row of publishedCounts) pubByCat.set(row.category, row._count._all);

  const videosByCategory: Record<string, { id: string; title: string; published: boolean; order: number }[]> = {};
  for (const v of allVideos) {
    if (!videosByCategory[v.category]) videosByCategory[v.category] = [];
    videosByCategory[v.category].push(v);
  }

  const modules: ModuleCardData[] = MODULES.map((m) => {
    const totals = m.videoCategoryKeys.reduce(
      (acc, label) => {
        const enumKey = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
          .find(([, l]) => l === label)?.[0];
        if (!enumKey) return acc;
        acc.total += totalByCat.get(enumKey) ?? 0;
        acc.published += pubByCat.get(enumKey) ?? 0;
        acc.cats.push({
          key: enumKey as VideoCategory,
          label,
          count: totalByCat.get(enumKey) ?? 0,
        });
        return acc;
      },
      { total: 0, published: 0, cats: [] as { key: VideoCategory; label: string; count: number }[] },
    );

    return {
      module: m,
      total: totals.total,
      published: totals.published,
      drafts: Math.max(0, totals.total - totals.published),
      pct: totals.total === 0 ? 0 : Math.round((totals.published / totals.total) * 100),
      categoriesWithVideos: totals.cats,
      videosByCategory,
    };
  });

  const totalGlobal = modules.reduce((acc, m) => acc + m.total, 0);

  return { modules, totalGlobal, dbAvailable, errorMessage };
}

export default async function AdminModulosPage() {
  const { modules, totalGlobal, dbAvailable, errorMessage } = await loadModuleData();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-slate-300">Módulos</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Módulos da trilha</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            As quatro trilhas que organizam as aulas do site. Cada card abaixo mostra o total
            de vídeos, status de publicação e a lista completa das aulas daquele módulo.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold tabular-nums text-white">{totalGlobal}</span>
          <span className="text-slate-500">aulas no total</span>
        </div>
      </header>

      {!dbAvailable && (
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#ffb066]/30 bg-[#ffb066]/5 px-4 py-3 text-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#ffb066]">
            <path d="M12 9v4M12 17v.5M2.5 19.5h19l-9.5-16-9.5 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">Banco de dados indisponível</div>
            <div className="mt-0.5 text-slate-300">
              Não foi possível consultar os vídeos. Rode{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
                npx prisma migrate dev
              </code>{" "}
              para criar as tabelas. Detalhes: <span className="text-slate-400">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {modules.map((data) => (
          <ModuleCard key={data.module.slug} data={data} />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ data }: { data: ModuleCardData }) {
  const { module: m, total, published, drafts, pct, categoriesWithVideos, videosByCategory } = data;

  return (
    <article className="glass relative overflow-hidden rounded-2xl p-5">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/10 blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
            Módulo {m.order} de 4
          </div>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-slate-300">
            {pct}% publicado
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            <span className="text-gradient-orange">{m.title.replace(/^\d+\.\s*/, "")}</span>
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {m.summary}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Aulas" value={total} tone="default" />
          <Stat label="Publicadas" value={published} tone="success" />
          <Stat label="Rascunhos" value={drafts} tone="muted" />
        </div>

        {/* Categorias */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Categorias
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categoriesWithVideos.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-200"
              >
                {c.label}
                <span className="text-slate-500">{c.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Lista de vídeos do módulo */}
        {total > 0 && (
          <details className="group rounded-xl border border-white/[0.08] bg-white/[0.02] open:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:text-white">
              <span className="inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-400">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10 9.5l4 2.5-4 2.5v-5z" fill="currentColor" />
                </svg>
                {total} {total === 1 ? "aula" : "aulas"} no módulo
              </span>
              <span className="text-slate-500 transition group-open:rotate-90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </summary>
            <div className="max-h-80 space-y-3 overflow-y-auto px-3 pb-3 pt-1">
              {categoriesWithVideos.map((cat) => {
                const videos = videosByCategory[cat.key] ?? [];
                if (videos.length === 0) return null;
                return (
                  <div key={cat.key}>
                    <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {cat.label}
                    </h4>
                    <ul className="space-y-1">
                      {videos.map((v) => (
                        <li key={v.id}>
                          <Link
                            href={`/admin/videos/${v.id}`}
                            className="group/link flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-xs text-slate-300 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                          >
                            <span className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${v.published ? "bg-[#1fd29c]" : "bg-slate-500"}`} />
                            <span className="min-w-0 flex-1 truncate">{v.title}</span>
                            <span className="text-[10px] tabular-nums text-slate-500">#{v.order}</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-500 group-hover/link:text-[#ffb066]">
                              <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          <Link
            href={`/admin/videos?module=${m.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff7a18]/35 bg-[#ff7a18]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb066] transition hover:bg-[#ff7a18]/20"
          >
            Gerenciar no editor
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href={`/admin/videos/novo?category=${categoriesWithVideos[0]?.key ?? ""}&module=${m.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Nova aula
          </Link>
          <span className="ml-auto text-[10px] text-slate-500">
            {m.videoCategoryKeys.length} {m.videoCategoryKeys.length === 1 ? "categoria" : "categorias"}
          </span>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "default" | "success" | "muted" }) {
  const toneClass =
    tone === "success" ? "text-[#1fd29c]" : tone === "muted" ? "text-slate-500" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-0.5 text-xl font-bold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}
