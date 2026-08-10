import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { VideoLibraryFull } from "@/components/VideoLibrary";

export const metadata: Metadata = {
  title: "Aulas gratuitas — Método GL",
  description:
    "Conteúdos gratuitos sobre operação de grupos, tráfego pago, criativos, métricas e muito mais. Assista direto na plataforma, sem cadastro.",
};

export default function AulasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Aulas gratuitas"
        title={
          <>
            Aprenda com o <span className="text-gradient-orange">Método GL</span>.
          </>
        }
        subtitle="Vídeos curtos e diretos sobre grupos, tráfego, retenção e métricas. Comece pelo vídeo em destaque ou explore por categoria."
        crumbs={[{ label: "Início", href: "/" }, { label: "Aulas" }]}
      />
      <div className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <VideoLibraryFull />
        </div>
      </div>
    </>
  );
}