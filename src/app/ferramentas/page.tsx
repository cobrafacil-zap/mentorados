import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { OperationCalculator } from "@/components/OperationCalculator";
import { ToolsGrid } from "@/components/ToolsGrid";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { getPageContent } from "@/lib/pageContent";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("page_ferramentas_header");
  return {
    title: header.metadataTitle,
    description: header.metadataDescription,
  };
}

export default async function FerramentasPage() {
  const [header, calculator, tools, dashboard] = await Promise.all([
    getPageContent("page_ferramentas_header"),
    getPageContent("page_ferramentas_calculator"),
    getPageContent("page_ferramentas_tools"),
    getPageContent("page_ferramentas_dashboard"),
  ]);

  const hd = header;
  return (
    <>
      <PageHeader
        eyebrow={hd.eyebrow}
        title={
          <>
            {hd.titleBefore}{" "}
            {hd.titleHighlight && (
              <span className="text-gradient-orange">{hd.titleHighlight}</span>
            )}{hd.titleAfter ? ` ${hd.titleAfter}` : ""}
          </>
        }
        subtitle={hd.subtitle}
        crumbs={hd.crumbs}
      />
      <div className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <OperationCalculator {...calculator} />
          <div className="mt-24 sm:mt-32">
            <ToolsGrid {...tools} />
          </div>
          <div className="mt-24 sm:mt-32">
            <MetricsDashboard {...dashboard} />
          </div>
        </div>
      </div>
    </>
  );
}
