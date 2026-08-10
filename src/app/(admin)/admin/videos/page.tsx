"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Video } from "@prisma/client";
import { VIDEO_CATEGORY_KEYS, VIDEO_CATEGORY_LABELS, videoCategoryLabel } from "@/lib/videoCategories";
import { moduleBySlug } from "@/lib/modules";

/** Inverso de `videoCategoryLabel`: dado um label PT-BR ("Tráfego Pago")
 *  devolve o enum Prisma ("TRAFEGO_PAGO"), ou undefined se não existir. */
function categoryEnumFromLabel(label: string): string | undefined {
  const entry = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
    .find(([, l]) => l === label);
  return entry?.[0];
}
import { Toast, useToast } from "./_components/Toast";
import { ConfirmDialog, useConfirm } from "./_components/ConfirmDialog";

type SortKey = "order" | "title" | "category" | "duration" | "status" | "createdAt";

export default function AdminVideosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const moduleSlug = searchParams.get("module");
  const activeModule = moduleSlug ? moduleBySlug(moduleSlug) : null;

  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Quando vem com `?module=`, fixa a primeira categoria do módulo como pré-seleção.
  const [category, setCategory] = useState<string>(() => {
    if (!activeModule) return "all";
    const firstLabel = activeModule.videoCategoryKeys[0];
    return categoryEnumFromLabel(firstLabel) ?? "all";
  });
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
        // Tenta extrair `detail` e `hint` do JSON de erro.
        const body = await res.json().catch(() => ({} as { error?: string; detail?: string; hint?: string }));
        setError(body.error ?? `Falha ao carregar vídeos (HTTP ${res.status})`);
        setErrorDetail(body.detail ?? null);
        setErrorHint(body.hint ?? null);
        return;
      }
      const data: Video[] = await res.json();
      setVideos(data);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filtered = useMemo(() => {
    if (!videos) return [];
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
    if (!videos) return { total: 0, published: 0, drafts: 0, featured: 0 };
    return {
      total: videos.length,
      published: videos.filter((v) => v.published).length,
      drafts: videos.filter((v) => !v.published).length,
      featured: videos.filter((v) => v.featured).length,
    };
  }, [videos]);

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
      setVideos((prev) => (prev ?? []).map((x) => (x.id === v.id ? updated : x)));
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
      setVideos((prev) => (prev ?? []).filter((x) => x.id !== v.id));
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
      await fetchVideos();
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
      await fetchVideos();
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

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <ConfirmDialog confirm={confirm} />

      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <span className="text-slate-300">Vídeos</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Vídeos do <span className="text-gradient-orange">Método GL</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Faça upload, edite metadados e controle a publicação das aulas.
          </p>
        </div>
        <Link
          href="/admin/videos/novo"
          className="btn-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Novo vídeo
        </Link>
      </header>

      {/* Banner de módulo ativo (vindo de `?module=`) */}
      {activeModule && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ff7a18]/30 bg-[#ff7a18]/5 px-4 py-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-[#ff7a18]/40 bg-[#ff7a18]/15 px-1.5 text-[11px] font-bold tabular-nums text-[#ffb066]">
            {String(activeModule.order).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0 text-xs">
            <div className="text-slate-300">
              Filtrando pelo módulo{" "}
              <strong className="font-semibold text-white">{activeModule.shortTitle}</strong>
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Pré-selecionada a categoria{" "}
              <span className="text-slate-300">
                {videoCategoryLabel(category as Parameters<typeof videoCategoryLabel>[0])}
              </span>
              {" — "}
              você pode trocar o filtro abaixo sem perder o contexto.
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.replace(pathname)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-white/20 hover:bg-white/10"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon="library" />
        <StatCard label="Publicados" value={stats.published} icon="check" tone="success" />
        <StatCard label="Rascunhos" value={stats.drafts} icon="draft" tone="muted" />
        <StatCard label="Em destaque" value={stats.featured} icon="star" tone="orange" />
      </div>

      {/* Banner de seed */}
      {stats.total === 0 && !loading && !error && (
        <SeedBanner onSeeded={fetchVideos} />
      )}

      {/* Filtros */}
      <div className="glass rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
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
            {VIDEO_CATEGORY_KEYS.map((c) => (
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
            {status !== "all" && <Chip>status: {status === "published" ? "publicados" : "rascunhos"}</Chip>}
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
            <span className="text-white">{selected.size === 1 ? "vídeo selecionado" : "vídeos selecionados"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => bulkPublish(true)}
              disabled={bulkBusy}
              className="rounded-lg border border-[#1fd29c]/40 bg-[#1fd29c]/10 px-3 py-1.5 text-xs font-semibold text-[#1fd29c] hover:bg-[#1fd29c]/20 disabled:opacity-50"
            >
              Publicar
            </button>
            <button
              onClick={() => bulkPublish(false)}
              disabled={bulkBusy}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50"
            >
              Despublicar
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkBusy}
              className="rounded-lg border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb0bf] hover:bg-[#ff5c7a]/20 disabled:opacity-50"
            >
              Excluir
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="space-y-2 rounded-2xl border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 p-5 text-[#ffb0bf]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {error}
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
          <button
            type="button"
            onClick={fetchVideos}
            className="rounded-lg border border-[#ff5c7a]/30 bg-[#ff5c7a]/10 px-3 py-1.5 text-xs font-medium text-[#ffb0bf] hover:bg-[#ff5c7a]/20"
          >
            Tentar de novo
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          hasFilters={filtersActive}
          onClear={() => { setQuery(""); setCategory("all"); setStatus("all"); }}
        />
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
                  <SortHeader label="Vídeo" sortKey="title" sort={sort} onSort={onSort} />
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
                    <tr
                      key={v.id}
                      className={`group transition ${
                        isSelected ? "bg-[#ff7a18]/[0.06]" : "hover:bg-white/[0.02]"
                      }`}
                    >
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
                          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
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
                              <span className="absolute left-1 top-1 rounded bg-[#ff7a18] px-1 py-0.5 text-[8px] font-bold text-black">
                                DESTAQUE
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-white">{v.title}</div>
                            <div className="line-clamp-1 text-xs text-slate-500">{v.description}</div>
                          </div>
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
                            Publicado
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
                            href={`/admin/videos/${v.id}`}
                            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/5 hover:text-white"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => togglePublished(v)}
                            disabled={busyId === v.id}
                            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-50"
                          >
                            {v.published ? "Despublicar" : "Publicar"}
                          </button>
                          <button
                            onClick={() => remove(v)}
                            disabled={busyId === v.id}
                            className="rounded-md border border-[#ff5c7a]/35 bg-[#ff5c7a]/10 px-2.5 py-1 text-xs text-[#ffb0bf] hover:bg-[#ff5c7a]/20 disabled:opacity-50"
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

  const ringAccent = {
    default: "ring-white/10",
    success: "ring-[#1fd29c]/30",
    muted: "ring-white/10",
    orange: "ring-[#ff7a18]/30",
  }[tone];

  const bgAccent = {
    default: "bg-white/[0.04]",
    success: "bg-[#1fd29c]/10",
    muted: "bg-white/[0.04]",
    orange: "bg-[#ff7a18]/10",
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
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bgAccent} ${ringAccent} ring-1 ${accent}`}>
          {ICONS[icon]}
        </span>
        {label}
      </div>
      <div className={`mt-3 text-3xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function SeedBanner({ onSeeded }: { onSeeded: () => void }) {
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const run = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/videos/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no seed");
      setFeedback(`Importados ${data.created} vídeos · ${data.updated} já existiam.`);
      onSeeded();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Erro ao importar");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ff7a18]/30 bg-[#ff7a18]/[0.06] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ff7a18]/30 bg-[#ff7a18]/15 text-[#ffb066]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v12M6 10l6 6 6-6M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <div className="text-sm font-semibold text-white">Banco de vídeos vazio</div>
          <div className="text-xs text-slate-300">
            {feedback ?? "Importe os 10 vídeos de exemplo do data/videos.ts para começar."}
          </div>
        </div>
      </div>
      <button
        onClick={run}
        disabled={seeding}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {seeding ? "Importando…" : "Importar exemplo"}
      </button>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="glass space-y-2 rounded-2xl p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg border border-white/5 bg-white/[0.02]" />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="glass rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white">Nenhum vídeo encontrado</h3>
      <p className="mt-1 text-sm text-slate-400">
        {hasFilters
          ? "Tente ajustar os filtros para ver mais resultados."
          : "Comece fazendo o upload do seu primeiro vídeo."}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {hasFilters ? (
          <button onClick={onClear} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
            Limpar filtros
          </button>
        ) : null}
        <Link href="/admin/videos/novo" className="btn-primary">
          + Novo vídeo
        </Link>
      </div>
    </div>
  );
}