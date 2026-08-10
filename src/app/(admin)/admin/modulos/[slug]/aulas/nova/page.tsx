import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoForm } from "@/components/VideoForm";
import { VideoFormHeader } from "../../_components/VideoFormHeader";
import { moduleBySlug } from "@/lib/modules";
import { VIDEO_CATEGORY_LABELS, videoCategoryLabel } from "@/lib/videoCategories";
import type { VideoCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function categoryEnumFromLabel(label: string): VideoCategory | undefined {
  const entry = (Object.entries(VIDEO_CATEGORY_LABELS) as [string, string][])
    .find(([, l]) => l === label);
  return entry?.[0] as VideoCategory | undefined;
}

export default async function NewAulaPage({ params }: PageProps) {
  const { slug } = await params;
  const mod = moduleBySlug(slug);
  if (!mod) notFound();

  // Categoria pré-selecionada = primeira do módulo.
  const firstLabel = mod.videoCategoryKeys[0];
  const defaultCategory = categoryEnumFromLabel(firstLabel) ?? "COMECE_POR_AQUI";
  const defaultCategoryLabel = videoCategoryLabel(defaultCategory);

  return (
    <div className="space-y-6">
      <VideoFormHeader
        title="Nova aula"
        subtitle={`Faça upload do arquivo e preencha os metadados. Categoria pré-selecionada: ${defaultCategoryLabel}.`}
        parentHref={`/admin/modulos/${slug}`}
        parentLabel={mod.shortTitle}
        right={
          <Link
            href={`/admin/modulos/${slug}`}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Cancelar
          </Link>
        }
      />
      <VideoForm
        mode="create"
        backHref={`/admin/modulos/${slug}`}
        defaultCategory={defaultCategory}
      />
    </div>
  );
}
