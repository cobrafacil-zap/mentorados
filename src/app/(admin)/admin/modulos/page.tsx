import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MODULES } from "@/lib/modules";
import { VIDEO_CATEGORY_LABELS } from "@/lib/videoCategories";

export const dynamic = "force-dynamic";

export default async function AdminModulosPage() {
  // Conta aulas por categoria numa query só (groupBy).
  const counts = await prisma.video.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  // Conta publicadas separadamente (groupBy com `_count`+`where` em chave).
  const publishedCounts = await prisma.video.groupBy({
    by: ["category"],
    where: { published: true },
    _count: { _all: true },
  });

  // Indexa por enum.
  const totalByCat = new Map<string, number>();
  for (const row of counts) totalByCat.set(row.category, row._count._all);

  const pubByCat = new Map<string, number>();
  for (const row of publishedCounts) pubByCat.set(row.category, row._count._all);

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
            As quatro trilhas que organizam as aulas do site. Cada módulo agrupa
            categorias relacionadas — confira a contagem e atalhe para a lista de vídeos filtrada.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {MODULES.map((m) => {
          // Soma contagens de cada categoria pertencente ao módulo.
          const total = m.videoCategoryKeys.reduce(
            (acc, label) => {
              const enumKey = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
                .find(([, l]) => l === label)?.[0];
              return acc + (enumKey ? totalByCat.get(enumKey) ?? 0 : 0);
            },
            0,
          );
          const published = m.videoCategoryKeys.reduce(
            (acc, label) => {
              const enumKey = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
                .find(([, l]) => l === label)?.[0];
              return acc + (enumKey ? pubByCat.get(enumKey) ?? 0 : 0);
            },
            0,
          );
          const drafts = total - published;
          const pct = total === 0 ? 0 : Math.round((published / total) * 100);

          return (
            <article
              key={m.slug}
              className="glass relative overflow-hidden rounded-2xl p-5"
            >
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
                    {m.videoCategoryKeys.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/admin/videos?module=${m.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff7a18]/35 bg-[#ff7a18]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb066] transition hover:bg-[#ff7a18]/20"
                  >
                    Ver aulas
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
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
