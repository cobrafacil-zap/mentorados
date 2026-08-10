import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONTENT_LABELS, DEFAULT_CONTENT, isPageContentKey, type PageContentKey } from "@/lib/pageContent";
import { PageContentForm } from "../_components/PageContentForm";

export const dynamic = "force-dynamic";

export default async function AdminConteudoEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  if (!isPageContentKey(key)) {
    notFound();
  }

  const typedKey: PageContentKey = key;
  const meta = CONTENT_LABELS[typedKey];
  const fallback = DEFAULT_CONTENT[typedKey];

  // Tenta carregar a linha do banco. Em caso de erro, segue com fallback.
  let row: { content: unknown; updatedAt: Date } | null = null;
  try {
    const found = await prisma.pageContent.findUnique({
      where: { key: typedKey },
      select: { content: true, updatedAt: true },
    });
    if (found) {
      row = { content: found.content, updatedAt: found.updatedAt };
    }
  } catch (error) {
    console.warn(`[admin/conteudo/${key}] Falha ao ler do DB, usando fallback`, error);
  }

  const initial = (row?.content ?? fallback) as Record<string, unknown>;
  const defaultContent = fallback as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <span>/</span>
            <Link href="/admin/conteudo" className="hover:text-white">Conteúdo</Link>
            <span>/</span>
            <span className="text-slate-300">{meta.title}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{meta.description}</p>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Grupo <span className="text-slate-300">{meta.group}</span> · chave{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
              {typedKey}
            </code>
          </p>
        </div>
        <Link
          href="/admin/conteudo"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>
      </header>

      <PageContentForm
        key={typedKey}
        initial={initial}
        defaultContent={defaultContent}
        saved={!!row}
        updatedAt={row ? row.updatedAt.toISOString() : null}
      />
    </div>
  );
}
