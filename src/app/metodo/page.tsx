import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MethodExplainer } from "@/components/MethodExplainer";
import { HowItWorks } from "@/components/HowItWorks";
import { getPageContent } from "@/lib/pageContent.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("page_metodo_header");
  return {
    title: header.metadataTitle,
    description: header.metadataDescription,
  };
}

export default async function MetodoPage() {
  const [header, explainer, how] = await Promise.all([
    getPageContent("page_metodo_header"),
    getPageContent("page_metodo_explainer"),
    getPageContent("page_metodo_how"),
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
      <MethodExplainer {...explainer} />
      <HowItWorks {...how} />
    </>
  );
}
