import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/VideoForm";
import { VideoFormHeader } from "../_components/VideoFormHeader";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();
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
      <VideoForm mode="edit" initial={video} />
    </div>
  );
}