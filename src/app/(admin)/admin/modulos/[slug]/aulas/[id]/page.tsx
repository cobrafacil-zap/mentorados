import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/VideoForm";
import { VideoFormHeader } from "../../_components/VideoFormHeader";
import { ModuleContextCard } from "../../_components/ModuleContextCard";
import { moduleBySlug } from "@/lib/modules";
import { VIDEO_CATEGORY_LABELS, videoCategoryLabel } from "@/lib/videoCategories";
import type { VideoCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

function categoryEnumFromLabel(label: string): VideoCategory | undefined {
  const entry = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
    .find(([, l]) => l === label);
  return entry?.[0] as VideoCategory | undefined;
}

export default async function EditAulaPage({ params }: PageProps) {
  const { slug, id } = await params;

  const mod = moduleBySlug(slug);
  if (!mod) notFound();

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  // Cross-module guard: aula pertence mesmo ao módulo da URL?
  const categoryLabel = videoCategoryLabel(video.category);
  if (!mod.videoCategoryKeys.includes(categoryLabel)) notFound();

  // Enum keys do módulo (para buscar siblings)
  const categoryEnums = mod.videoCategoryKeys
    .map((label) => categoryEnumFromLabel(label))
    .filter((c): c is VideoCategory => !!c);

  // Siblings do mesmo módulo (mesma categoria, mesmo conjunto)
  const moduleVideos = categoryEnums.length > 0
    ? await prisma.video.findMany({
        where: { category: { in: categoryEnums } },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <VideoFormHeader
        title="Editar aula"
        subtitle={video.title}
        parentHref={`/admin/modulos/${slug}`}
        parentLabel={mod.shortTitle}
        right={
          <Link
            href={`/admin/modulos/${slug}`}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            ← Voltar para a lista
          </Link>
        }
      />

      {/* Resumo do módulo + categoria */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs">
        <span className="text-slate-400">Módulo:</span>
        <Link
          href={`/admin/modulos/${slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2.5 py-0.5 font-semibold text-[#ffb066] hover:bg-[#ff7a18]/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18]" />
          {mod.shortTitle}
        </Link>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">Categoria:</span>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-200">
          {categoryLabel}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoForm mode="edit" initial={video} backHref={`/admin/modulos/${slug}`} />
        </div>
        <div className="lg:col-span-1">
          <ModuleContextCard
            module={mod}
            videos={moduleVideos}
            currentId={video.id}
            slug={slug}
          />
        </div>
      </div>
    </div>
  );
}
