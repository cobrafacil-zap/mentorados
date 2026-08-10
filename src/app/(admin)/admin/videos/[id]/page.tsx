import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/VideoForm";
import { VideoFormHeader } from "../_components/VideoFormHeader";
import { ModuleContextCard } from "../_components/ModuleContextCard";
import { moduleForCategory } from "@/lib/modules";
import { videoCategoryLabel } from "@/lib/videoCategories";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  // Mapeia enum Prisma → label PT-BR antes de consultar o módulo.
  // Mantém o `moduleForCategory` independente do Prisma (consumível também pelo
  // /aulas, onde `v.category` já é label PT-BR vindo de `data/videos.ts`).
  const categoryLabel = videoCategoryLabel(video.category);
  const mod = moduleForCategory(categoryLabel);

  // Vídeos do mesmo módulo (mesmo conjunto de categorias), ordenados.
  const moduleVideos = mod
    ? await prisma.video.findMany({
        where: {
          category: { in: mod.videoCategoryKeys as never },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <VideoFormHeader
        title="Editar vídeo"
        subtitle={video.title}
        right={
          <Link
            href="/admin/videos"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Voltar para a lista
          </Link>
        }
      />

      {/* Resumo do módulo + categoria (visível quando há mapeamento) */}
      {mod && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs">
          <span className="text-slate-400">Módulo:</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2.5 py-0.5 font-semibold text-[#ffb066]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18]" />
            {mod.title}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Categoria:</span>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-200">
            {categoryLabel}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoForm mode="edit" initial={video} />
        </div>
        {mod && (
          <div className="lg:col-span-1">
            <ModuleContextCard
              module={mod}
              videos={moduleVideos}
              currentId={video.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
