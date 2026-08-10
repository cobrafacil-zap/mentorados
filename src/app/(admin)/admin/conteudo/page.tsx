import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CONTENT_LABELS, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/pageContent";

// =========================================================
// /admin/conteudo — apenas VISUALIZAÇÃO (read-only).
//
// Mostra qual conteúdo está atualmente em uso para cada chave
// (override do banco + fallback hardcoded) sem permitir edição.
// A página existe para o admin inspecionar rapidamente o que
// vai aparecer no site público.
//
// Edição fica em /admin/modulos/<slug>/aulas/... e em código. Conteúdo de LP
// só é editável via `npx prisma studio` ou deploy.
// =========================================================

export const dynamic = "force-dynamic";

const GROUP_ORDER = ["Global", "Home", "Método", "Aulas", "Ferramentas"] as const;

interface KeyState {
  key: PageContentKey;
  title: string;
  description: string;
  saved: boolean;
  updatedAt: Date | null;
  preview: string;
}

async function loadContentStates(): Promise<{
  rows: KeyState[];
  totalCount: number;
  savedCount: number;
  dbAvailable: boolean;
  errorMessage?: string;
}> {
  const keys = PAGE_CONTENT_KEYS as readonly string[];
  const states: KeyState[] = [];

  let rows: { key: string; updatedAt: Date; content: unknown }[] = [];
  let dbAvailable = true;
  let errorMessage: string | undefined;

  try {
    rows = await prisma.pageContent.findMany({
      where: { key: { in: [...keys] } },
      select: { key: true, updatedAt: true, content: true },
    });
  } catch (error) {
    dbAvailable = false;
    errorMessage =
      error instanceof Error
        ? error.message
        : "Não foi possível consultar o banco de dados.";
    console.warn("[admin/conteudo] DB indisponível:", error);
  }

  const rowMap = new Map(rows.map((r) => [r.key, r]));

  for (const key of PAGE_CONTENT_KEYS) {
    const meta = CONTENT_LABELS[key];
    const row = rowMap.get(key);
    states.push({
      key,
      title: meta.title,
      description: meta.description,
      saved: !!row,
      updatedAt: row?.updatedAt ?? null,
      preview: summarizeContent(key, row?.content ?? null),
    });
  }

  return {
    rows: states,
    totalCount: PAGE_CONTENT_KEYS.length,
    savedCount: rows.length,
    dbAvailable,
    errorMessage,
  };
}

/** Cria um resumo curto do conteúdo de uma chave para mostrar na listagem. */
function summarizeContent(key: PageContentKey, content: unknown): string {
  if (!content || typeof content !== "object") return "Sem dados.";
  const c = content as Record<string, unknown>;

  switch (key) {
    case "home_hero": {
      const t = [c.titleBefore, c.titleHighlight, c.titleAfter].filter(Boolean).join(" ");
      return t || "Título vazio.";
    }
    case "home_featured":
      return (c.titlePrefix as string) || "—";
    case "home_cta": {
      const t = [c.titleBefore, c.titleHighlight, c.titleAfter].filter(Boolean).join(" ");
      return t || "—";
    }
    case "global_navbar":
      return Array.isArray(c.links) ? `${(c.links as unknown[]).length} links` : "—";
    case "global_footer":
      return (c.descriptionHighlight as string) || "—";
    case "page_metodo_header":
    case "page_aulas_header":
    case "page_ferramentas_header": {
      const t = [c.titleBefore, c.titleHighlight, c.titleAfter].filter(Boolean).join(" ");
      return t || (c.metadataTitle as string) || "—";
    }
    case "page_metodo_explainer":
      return Array.isArray(c.steps) ? `${(c.steps as unknown[]).length} etapas` : "—";
    case "page_metodo_how":
      return Array.isArray(c.steps) ? `${(c.steps as unknown[]).length} etapas numeradas` : "—";
    case "page_ferramentas_tools":
      return Array.isArray(c.tools) ? `${(c.tools as unknown[]).length} ferramentas` : "—";
    case "page_ferramentas_calculator": {
      const t = [c.titleBefore, c.titleHighlight, c.titleAfter].filter(Boolean).join(" ");
      return t || "—";
    }
    case "page_ferramentas_dashboard": {
      const t = [c.titleBefore, c.titleHighlight, c.titleAfter].filter(Boolean).join(" ");
      return t || "—";
    }
    default:
      return "—";
  }
}

export default async function AdminConteudoPage() {
  const { rows, totalCount, savedCount, dbAvailable, errorMessage } = await loadContentStates();

  const grouped: Record<string, KeyState[]> = {};
  for (const r of rows) {
    const group = CONTENT_LABELS[r.key].group;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(r);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-slate-300">Conteúdo</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Conteúdo das páginas</h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              Somente leitura
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Visualize qual conteúdo está ativo em cada parte das páginas públicas.
            Para editar, use <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">npx prisma studio</code> ou
            faça deploy de uma nova versão do código com os textos atualizados.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold tabular-nums text-white">{savedCount}</span>
          <span className="text-slate-500">/</span>
          <span className="tabular-nums">{totalCount}</span>
          <span className="text-slate-400">chaves com override</span>
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
              Não foi possível consultar os overrides. Mostrando apenas os textos
              padrão do código. Detalhes: <span className="text-slate-400">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

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
                <article
                  key={it.key}
                  className="glass relative overflow-hidden rounded-2xl p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{it.title}</h3>
                      {it.saved ? (
                        <span
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-[#1fd29c]/30 bg-[#1fd29c]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#1fd29c]"
                          title={`Atualizado em ${it.updatedAt?.toLocaleString("pt-BR") ?? ""}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Salvo
                        </span>
                      ) : (
                        <span className="inline-flex flex-shrink-0 items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{it.description}</p>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Conteúdo ativo</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-200">
                        {it.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-500">
                      <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                        {it.key}
                      </code>
                      {it.updatedAt && (
                        <span className="ml-auto">
                          {it.updatedAt.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
