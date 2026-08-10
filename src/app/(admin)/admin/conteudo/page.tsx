import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CONTENT_LABELS, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/pageContent";

export const dynamic = "force-dynamic";

// Ordem dos grupos na listagem.
const GROUP_ORDER = ["Global", "Home", "Método", "Aulas", "Ferramentas"] as const;

export default async function AdminConteudoPage() {
  // Uma query só pra saber quais chaves estão salvas no DB.
  const rows = await prisma.pageContent.findMany({
    where: { key: { in: [...PAGE_CONTENT_KEYS] } },
    select: { key: true, updatedAt: true },
  });
  const savedMap = new Map(rows.map((r) => [r.key, r.updatedAt]));

  // Agrupa por `group` mantendo a ordem de PAGE_CONTENT_KEYS dentro do grupo.
  const grouped: Record<string, { key: PageContentKey; title: string; description: string; updatedAt: Date | null }[]> = {};
  for (const key of PAGE_CONTENT_KEYS) {
    const meta = CONTENT_LABELS[key];
    if (!grouped[meta.group]) grouped[meta.group] = [];
    grouped[meta.group].push({
      key,
      title: meta.title,
      description: meta.description,
      updatedAt: savedMap.get(key) ?? null,
    });
  }

  const savedCount = rows.length;
  const totalCount = PAGE_CONTENT_KEYS.length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-slate-300">Conteúdo</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Conteúdo das páginas</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Edite headlines, CTAs e textos das páginas públicas. Cada chave tem seu próprio formulário —
            o que não for salvo usa o padrão do código, então é seguro apagar.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold tabular-nums text-white">{savedCount}</span>
          <span className="text-slate-500">/</span>
          <span className="tabular-nums">{totalCount}</span>
          <span className="text-slate-400">chaves com override</span>
        </div>
      </header>

      {GROUP_ORDER.map((group) => {
        const items = grouped[group];
        if (!items || items.length === 0) return null;
        return (
          <section key={group}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group}
              </h2>
              <span className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] tabular-nums text-slate-500">{items.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <Link
                  key={it.key}
                  href={`/admin/conteudo/${it.key}`}
                  className="glass group relative overflow-hidden rounded-2xl p-4 transition hover:border-[#ff7a18]/30"
                >
                  {/* Glow decorativo */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ff7a18]/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

                  <div className="relative space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{it.title}</h3>
                      {it.updatedAt ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md border border-[#1fd29c]/30 bg-[#1fd29c]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#1fd29c]"
                          title={`Atualizado em ${it.updatedAt.toLocaleString("pt-BR")}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Salvo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{it.description}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                      <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                        {it.key}
                      </code>
                      <span className="ml-auto text-slate-400 group-hover:text-[#ffb066]">Editar →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
