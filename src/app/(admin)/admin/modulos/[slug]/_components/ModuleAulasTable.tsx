"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Video, VideoCategory } from "@prisma/client";
import { videoCategoryLabel } from "@/lib/videoCategories";
import type { ModuleDef } from "@/lib/modules";
import { Toast, useToast } from "./Toast";
import { ConfirmDialog, useConfirm } from "./ConfirmDialog";

type SortKey = "order" | "title" | "category" | "duration" | "status" | "createdAt";

interface Props {
  module: ModuleDef;
  slug: string;
  categoryEnums: VideoCategory[];
  initialVideos: Video[];
  initialStats: { total: number; published: number; drafts: number; featured: number };
  dbAvailable: boolean;
}

/**
 * Tabela de aulas de UM módulo. Escopo:
 *  - filtro de categoria mostra SÓ as categorias do módulo
 *  - edição/redirect aponta para `/admin/modulos/<slug>/aulas/<id>`
 *
 * Lógica de busca/sort/bulk replica o que era em
 * `src/app/(admin)/admin/videos/page.tsx` (escopado).
 */
export function ModuleAulasTable({
  module: mod,
  slug,
  categoryEnums,
  initialVideos,
  initialStats,
  dbAvailable,
}: Props) {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "order", dir: "asc" });

  const toast = useToast();
  const confirm = useConfirm();

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    setErrorHint(null);
    try {
      const res = await fetch("/api/admin/videos", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as { error?: string; detail?: string; hint?: string }));
        setError(body.error ?? `Falha ao carregar vídeos (HTTP ${res.status})`);
        setErrorDetail(body.detail ?? null);
        setErrorHint(body.hint ?? null);
        return;
      }
      const all: Video[] = await res.json();
      // Filtra o que pertence ao módulo (defesa — server já filtra, mas reforça aqui)
      const allowed = new Set(categoryEnums);
      setVideos(all.filter((v) => allowed.has(v.category)));
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [categoryEnums]);

  useEffect(() => {
    // Recarrega se o parent remover (delete) ou adicionar (seed).
    if (initialVideos.length === 0 && !loading && !error) return;
  }, [initialVideos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (status === "published" && !v.published) return false;
      if (status === "draft" && v.published) return false;
      if (q) {
        if (
          !v.title.toLowerCase().includes(q) &&
          !v.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [videos, category, status, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sort.key) {
        case "title":
          return dir * a.title.localeCompare(b.title, "pt-BR");
        case "category":
          return dir * a.category.localeCompare(b.category, "pt-BR");
        case "duration":
          return dir * a.duration.localeCompare(b.duration, "pt-BR");
        case "status":
          return dir * Number(a.published) - Number(b.published);
        case "createdAt":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case "order":
        default:
          return dir * (a.order - b.order);
      }
    });
    return arr;
  }, [filtered, sort]);

  const stats = useMemo(() => {
    return {
      total: initialStats.total,
      published: initialStats.published,
      drafts: initialStats.drafts,
      featured: initialStats.featured,
    };
  }, [initialStats]);

  const togglePublished = async (v: Video) => {
    setBusyId(v.id);
    try {
      const res = await fetch(`/api/admin/videos/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !v.published }),
      });
      if (!res.ok) throw new Error();
      const updated: Video = await res.json();
      setVideos((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
      toast.show(updated.published ? "Vídeo publicado" : "Vídeo despublicado", "success");
    } catch {
      toast.show("Erro ao atualizar status", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (v: Video) => {
    const ok = await confirm.ask({
      title: "Excluir vídeo",
      message: `Excluir "${v.title}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(v.id);
    try {
      const res = await fetch(`/api/admin/videos/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setVideos((prev) => prev.filter((x) => x.id !== v.id));
      toast.show("Vídeo excluído", "success");
    } catch {
      toast.show("Erro ao excluir vídeo", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === sorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((v) => v.id)));
    }
  };

  const bulkPublish = async (published: boolean) => {
    setBulkBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/admin/videos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published }),
          }),
        ),
      );
      toast.show(
        `${selected.size} vídeo${selected.size > 1 ? "s" : ""} ${published ? "publicado" : "despublicado"}${selected.size > 1 ? "s" : ""}`,
        "success",
      );
      router.refresh();
    } catch {
      toast.show("Erro ao aplicar ação em massa", "danger");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    const ok = await confirm.ask({
      title: "Excluir vídeos",
      message: `Excluir ${selected.size} vídeo${selected.size > 1 ? "s" : ""}? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir tudo",
      tone: "danger",
    });
    if (!ok) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/admin/videos/${id}`, { method: "DELETE" }),
        ),
      );
      toast.show(`${selected.size} excluído${selected.size > 1 ? "s" : ""}`, "success");
      router.refresh();
    } catch {
      toast.show("Erro ao excluir vídeos", "danger");
    } finally {
      setBulkBusy(false);
    }
  };

  const onSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const filtersActive = query !== "" || category !== "all" || status !== "all";
  const editBase = `/admin/modulos/${slug}/aulas`;

  if (!dbAvailable) {
    return (
      <div className="space-y-2 rounded-2xl border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 p-5 text-[#ffb0bf]">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Banco de dados indisponível
        </div>
        {errorDetail && (
          <pre className="overflow-x-auto rounded-lg border border-[#ff5c7a]/20 bg-black/30 p-3 text-[11px] leading-relaxed text-[#ffb0bf]/80">
{errorDetail}
          </pre>
        )}
        {errorHint && (
          <div className="text-xs text-slate-200">
            <strong className="text-[#ffb066]">Dica:</strong> {errorHint}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      <ConfirmDialog confirm={confirm} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon="library" />
        <StatCard label="Publicadas" value={stats.published} icon="check" tone="success" />
        <StatCard label="Rascunhos" value={stats.drafts} icon="draft" tone="muted" />
        <StatCard label="Em destaque" value={stats.featured} icon="star" tone="orange" />
      </div>

      {/* Filtros */}
      <div className="glass rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou descrição…"
              className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white focus:border-[#ff7a18]/60 focus:outline-none"
          >
            <option value="all">Todas as categorias</option>
            {categoryEnums.map((c) => (
              <option key={c} value={c}>
                {videoCategoryLabel(c)}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white focus:border-[#ff7a18]/60 focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </select>
          {filtersActive && (
            <button
              onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              Limpar
            </button>
          )}
        </div>

        {filtersActive && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>
              Mostrando <strong className="text-white">{sorted.length}</strong> de{" "}
              <strong className="text-white">{stats.total}</strong>
            </span>
            {query && <Chip>título: "{query}"</Chip>}
            {category !== "all" && <Chip>cat: {videoCategoryLabel(category as never)}</Chip>}
            {status !== "all" && <Chip>status: {status === "published" ? "publicadas" : "rascunhos"}</Chip>}
          </div>
        )}
      </div>

      {/* Barra de ações em massa */}
      {selected.size > 0 && (
        <div className="glass-strong flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ff7a18]/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-[#ff7a18]/20 px-2 text-xs font-bold text-[#ffb066]">
              {selected.size}
            </span>
            <span className="text-white">{selected.size === 1 ? "aula selecionada" : "aulas selecionadas"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => bulkPublish(true)} disabled={bulkBusy} className="rounded-lg border border-[#1fd29c]/40 bg-[#1fd29c]/10 px-3 py-1.5 text-xs font-semibold text-[#1fd29c] hover:bg-[#1fd29c]/20 disabled:opacity-50">Publicar</button>
            <button onClick={() => bulkPublish(false)} disabled={bulkBusy} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">Despublicar</button>
            <button onClick={bulkDelete} disabled={bulkBusy} className="rounded-lg border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb0bf] hover:bg-[#ff5c7a]/20 disabled:opacity-50">Excluir</button>
            <button onClick={() => setSelected(new Set())} className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-white">Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabela */}
      {sorted.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white">
            {videos.length === 0 ? `Nenhuma aula em ${mod.shortTitle}` : "Nenhuma aula encontrada"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {videos.length === 0
              ? "Comece importando o pacote de exemplo ou criando a primeira aula."
              : "Tente ajustar os filtros para ver mais resultados."}
          </p>
          <div className="mt-4 flex justify-center">
            <Link href={`${editBase}/nova`} className="btn-primary">+ Nova aula</Link>
          </div>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={sorted.length > 0 && selected.size === sorted.length}
                      ref={(el) => {
                        if (el) el.indeterminate = selected.size > 0 && selected.size < sorted.length;
                      }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 cursor-pointer rounded border-white/20 bg-[#0a1230] text-[#ff7a18] focus:ring-[#ff7a18]/40"
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <SortHeader label="Aula" sortKey="title" sort={sort} onSort={onSort} />
                  <SortHeader label="Categoria" sortKey="category" sort={sort} onSort={onSort} />
                  <SortHeader label="Duração" sortKey="duration" sort={sort} onSort={onSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((v) => {
                  const isSelected = selected.has(v.id);
                  return (
                    <tr key={v.id} className={`group transition ${isSelected ? "bg-[#ff7a18]/[0.06]" : "hover:bg-white/[0.02]"}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(v.id)}
                          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-[#0a1230] text-[#ff7a18] focus:ring-[#ff7a18]/40"
                          aria-label={`Selecionar ${v.title}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`${editBase}/${v.id}`}
                            className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black transition hover:border-[#ff7a18]/50"
                          >
                            {v.thumbnail ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            {v.featured && (
                              <span className="absolute left-1 top-1 rounded bg-[#ff7a18] px-1 py-0.5 text-[8px] font-bold text-black">DESTAQUE</span>
                            )}
                          </Link>
                          <Link href={`${editBase}/${v.id}`} className="min-w-0 flex-1 group/title">
                            <div className="truncate font-medium text-white group-hover/title:text-[#ffb066]">{v.title}</div>
                            <div className="line-clamp-1 text-xs text-slate-500">{v.description}</div>
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-200">
                          {videoCategoryLabel(v.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300 tabular-nums">{v.duration}</td>
                      <td className="px-4 py-3">
                        {v.published ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1fd29c]/35 bg-[#1fd29c]/15 px-2 py-1 text-xs text-[#1fd29c]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1fd29c]" />
                            Publicada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            Rascunho
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`${editBase}/${v.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-[#ff7a18]/35 bg-[#ff7a18]/10 px-2.5 py-1 text-xs font-semibold text-[#ffb066] transition hover:bg-[#ff7a18]/20"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Editar
                          </Link>
                          <button
                            onClick={() => togglePublished(v)}
                            disabled={busyId === v.id}
                            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                          >
                            {v.published ? "Despublicar" : "Publicar"}
                          </button>
                          <button
                            onClick={() => remove(v)}
                            disabled={busyId === v.id}
                            className="rounded-md border border-[#ff5c7a]/35 bg-[#ff5c7a]/10 px-2.5 py-1 text-xs text-[#ffb0bf] transition hover:bg-[#ff5c7a]/20 disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === sortKey;
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 text-xs uppercase tracking-wider transition hover:text-white ${
          active ? "text-white" : "text-slate-400"
        }`}
      >
        {label}
        <span className={`transition ${active ? "opacity-100" : "opacity-30"}`}>
          {active && sort.dir === "desc" ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#ff7a18]/25 bg-[#ff7a18]/10 px-2 py-0.5 text-[10px] text-[#ffb066]">
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: "library" | "check" | "draft" | "star";
  tone?: "default" | "success" | "muted" | "orange";
}) {
  const accent = {
    default: "text-white",
    success: "text-[#1fd29c]",
    muted: "text-slate-300",
    orange: "text-[#ffb066]",
  }[tone];

  const bgAccent = {
    default: "bg-white/[0.04]",
    success: "bg-[#1fd29c]/10",
    muted: "bg-white/[0.04]",
    orange: "bg-[#ff7a18]/10",
  }[tone];

  const ringAccent = {
    default: "ring-white/10",
    success: "ring-[#1fd29c]/30",
    muted: "ring-white/10",
    orange: "ring-[#ff7a18]/30",
  }[tone];

  const ICONS = {
    library: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9.5l4 2.5-4 2.5v-5z" fill="currentColor" />
      </svg>
    ),
    check: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    draft: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4h12l4 4v12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    star: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z" />
      </svg>
    ),
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bgAccent} ring-1 ${ringAccent} ${accent}`}>
          {ICONS[icon]}
        </span>
        {label}
      </div>
      <div className={`mt-3 text-3xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}
