import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { VideoLibraryFull } from "@/components/VideoLibrary";
import { getPageContent } from "@/lib/pageContent.server";
import { getPublicVideos } from "@/lib/videos.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const header = await getPageContent("page_aulas_header");
  return {
    title: header.metadataTitle,
    description: header.metadataDescription,
  };
}

export default async function AulasPage() {
  const [header, videos] = await Promise.all([
    getPageContent("page_aulas_header"),
    getPublicVideos(),
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
          <VideoLibraryFull videos={videos} />
        </div>
      </div>
    </>
  );
}
