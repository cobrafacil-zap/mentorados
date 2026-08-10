import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MethodExplainer } from "@/components/MethodExplainer";
import { HowItWorks } from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: "O Método GL — Como funciona",
  description:
    "Entenda a metodologia por trás do Método GL: do tráfego pago à retenção, oferta, comissão e análise de resultado.",
};

export default function MetodoPage() {
  return (
    <>
      <PageHeader
        eyebrow="O Método GL"
        title={
          <>
            A lógica por trás de <span className="text-gradient-orange">grupos lucrativos</span>.
          </>
        }
        subtitle="Do tráfego pago ao lucro: como cada peça se encaixa, o que acontece em cada etapa e por que algumas operações funcionam enquanto outras não saem do lugar."
        crumbs={[{ label: "Início", href: "/" }, { label: "O Método GL" }]}
      />
      <MethodExplainer />
      <HowItWorks />
    </>
  );
}