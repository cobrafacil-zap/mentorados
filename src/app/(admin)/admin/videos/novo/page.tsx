import { VideoForm } from "@/components/VideoForm";
import { VideoFormHeader } from "../_components/VideoFormHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      <VideoFormHeader
        title="Novo vídeo"
        subtitle="Faça upload do arquivo, escolha a categoria e preencha os metadados."
        right={
          <Link
            href="/admin/videos"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Cancelar
          </Link>
        }
      />
      <VideoForm mode="create" />
    </div>
  );
}