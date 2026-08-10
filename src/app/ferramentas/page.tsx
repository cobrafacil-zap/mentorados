import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { OperationCalculator } from "@/components/OperationCalculator";
import { ToolsGrid } from "@/components/ToolsGrid";
import { MetricsDashboard } from "@/components/MetricsDashboard";

export const metadata: Metadata = {
  title: "Ferramentas gratuitas — Método GL",
  description:
    "Calculadora de operação, métricas essenciais e ferramentas para analisar a sua operação de grupos de ofertas.",
};

export default function FerramentasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ferramentas gratuitas"
        title={
          <>
            Analise a sua <span className="text-gradient-orange">operação</span>.
          </>
        }
        subtitle="Ferramentas práticas para você entender, com os números reais do seu grupo, se a operação está pagando o esforço."
        crumbs={[{ label: "Início", href: "/" }, { label: "Ferramentas" }]}
      />
      <div className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <OperationCalculator />
          <div className="mt-24 sm:mt-32">
            <ToolsGrid />
          </div>
          <div className="mt-24 sm:mt-32">
            <MetricsDashboard />
          </div>
        </div>
      </div>
    </>
  );
}