import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeaturedVideo } from "@/components/VideoLibrary";
import { CallToAction } from "@/components/CallToAction";
import { getPageContent } from "@/lib/pageContent.server";
import { getFeaturedVideo } from "@/lib/videos.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Método GL — Plataforma gratuita",
  description:
    "Conteúdos, estratégias e ferramentas gratuitas para aprender a estruturar uma operação de grupos lucrativos.",
};

export default async function Home() {
  const [navbar, footer, hero, featured, cta, featuredVideo] = await Promise.all([
    getPageContent("global_navbar"),
    getPageContent("global_footer"),
    getPageContent("home_hero"),
    getPageContent("home_featured"),
    getPageContent("home_cta"),
    getFeaturedVideo(),
  ]);

  return (
    <>
      <Navbar {...navbar} />
      <main>
        <Hero {...hero} />
        <FeaturedVideo video={featuredVideo} {...featured} />
        <CallToAction {...cta} />
      </main>
      <Footer {...footer} />
    </>
  );
}
