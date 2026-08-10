"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import type { Video } from "@prisma/client";
import { VIDEO_CATEGORY_KEYS, videoCategoryLabel } from "@/lib/videoCategories";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/videos", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar vídeos");
      const data: Video[] = await res.json();
      setVideos(data);
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
    return videos.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (status === "published" && !v.published) return false;
      if (status === "draft" && v.published) return false;
      if (query) {
        const q = query.toLowerCase();
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

  const stats = useMemo(() => {
    if (!videos) return { total: 0, published: 0, drafts: 0 };
    return {
      total: videos.length,
      published: videos.filter((v) => v.published).length,
      drafts: videos.filter((v) => !v.published).length,
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
    } catch {
      alert("Erro ao atualizar status.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (v: Video) => {
    if (!confirm(`Excluir "${v.title}"? Esta ação não pode ser desfeita.`)) return;
    setBusyId(v.id);
    try {
      const res = await fetch(`/api/admin/videos/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setVideos((prev) => (prev ?? []).filter((x) => x.id !== v.id));
    } catch {
      alert("Erro ao excluir vídeo.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Vídeos do Método GL</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Faça upload de novos vídeos, edite metadados e controle a publicação.
          </p>
        </div>
        <Link
          href="/admin/videos/novo"
          className="inline-flex items-center gap-2 rounded-md bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Novo vídeo
        </Link>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Publicados" value={stats.published} accent="success" />
        <StatCard label="Rascunhos" value={stats.drafts} accent="muted" />
      </div>

      {/* Banner de seed inicial (só aparece quando o banco está vazio) */}
      {stats.total === 0 && !loading && !error && (
        <SeedBanner onSeeded={fetchVideos} />
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou descrição…"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#ff7a18] focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#ff7a18] focus:outline-none"
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
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#ff7a18] focus:outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
        {(query || category !== "all" || status !== "all") && (
          <button
            onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}
            className="rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-6 text-red-200">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilters={query !== "" || category !== "all" || status !== "all"}
          onClear={() => { setQuery(""); setCategory("all"); setStatus("all"); }}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Vídeo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((v) => (
                <tr key={v.id} className="bg-zinc-950 hover:bg-zinc-900/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-black">
                        {v.thumbnail ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
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
                        <div className="line-clamp-1 text-xs text-zinc-500">{v.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
                      {videoCategoryLabel(v.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{v.duration}</td>
                  <td className="px-4 py-3">
                    {v.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-900/40 px-2 py-1 text-xs text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        Rascunho
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/videos/${v.id}`}
                        className="rounded-md border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/5"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => togglePublished(v)}
                        disabled={busyId === v.id}
                        className="rounded-md border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/5 disabled:opacity-50"
                      >
                        {v.published ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => remove(v)}
                        disabled={busyId === v.id}
                        className="rounded-md border border-red-900/60 bg-red-950/30 px-2.5 py-1 text-xs text-red-300 hover:bg-red-950/60 disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "success" | "muted" }) {
  const color =
    accent === "success" ? "text-[#1fd29c]" :
    accent === "muted" ? "text-zinc-400" :
    "text-white";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ff7a18]/20 text-[#ffb066]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v12M6 10l6 6 6-6M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <div className="text-sm font-semibold text-white">Banco de vídeos vazio</div>
          <div className="text-xs text-zinc-300">
            {feedback ?? "Importe os 10 vídeos de exemplo do data/videos.ts para começar."}
          </div>
        </div>
      </div>
      <button
        onClick={run}
        disabled={seeding}
        className="rounded-md bg-[#ff7a18] px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {seeding ? "Importando…" : "Importar exemplo"}
      </button>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/40" />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white">Nenhum vídeo encontrado</h3>
      <p className="mt-1 text-sm text-zinc-400">
        {hasFilters
          ? "Tente ajustar os filtros para ver mais resultados."
          : "Comece fazendo o upload do seu primeiro vídeo."}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {hasFilters ? (
          <button onClick={onClear} className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5">
            Limpar filtros
          </button>
        ) : null}
        <Link
          href="/admin/videos/novo"
          className="inline-flex items-center gap-2 rounded-md bg-[#ff7a18] px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          + Novo vídeo
        </Link>
      </div>
    </div>
  );
}
